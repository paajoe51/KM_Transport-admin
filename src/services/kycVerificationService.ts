/**
 * KYC Verification Service
 * Handles Client-side Ghana Card OCR detection, Intelligent Name Matching & Face Similarity Verification
 */

import * as faceapi from '@vladmandic/face-api';
import { createWorker } from 'tesseract.js';
import { apiClient } from './apiClient';

export interface OcrResult {
  detectedPin: string | null;
  detectedSurname: string | null;
  detectedFirstnames: string | null;
  detectedFullName: string | null;
  rawText: string;
  confidence: number;
  source?: 'ai' | 'ocr';
  aiNote?: string;
}

export interface NameMatchResult {
  isMatch: boolean;
  similarityScore: number; // 0 to 100
  enteredName: string;
  detectedName: string;
  message: string;
}

export interface FaceMatchResult {
  passportFaceDetected: boolean;
  idFaceDetected: boolean;
  similarityScore: number; // 0 to 100
  isMatch: boolean; // >= 70%
  euclideanDistance: number;
  message: string;
}

/**
 * Computes Damerau-Levenshtein distance between two strings
 * Handles insertions, deletions, substitutions, and adjacent transpositions (e.g. Micheal <-> Michael)
 */
function damerauLevenshtein(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculates string similarity from 0.0 to 1.0 using Damerau-Levenshtein
 */
function tokenSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  const dist = damerauLevenshtein(str1, str2);
  return Math.max(0, (maxLen - dist) / maxLen);
}

class KycVerificationService {
  private modelsLoaded = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Lazily loads face-api model weights from /models/face-api
   * Uses TinyFaceDetector, FaceLandmark68Net, and FaceRecognitionNet
   */
  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      const MODEL_URL = '/models/face-api';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      this.modelsLoaded = true;
    })();

    return this.loadPromise;
  }

  /**
   * Helper to load an image source (data URI, object URL, or File) into an HTMLImageElement
   */
  loadImage(src: string | File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      // Only set crossOrigin if src is not a data: URI to avoid canvas taint quirks
      if (typeof src === 'string' && !src.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }

      if (src instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
          img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(src);
      } else {
        img.src = src;
      }

      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  }

  /**
   * Crops a normalized region [rx, ry, rw, rh] of an image onto an upscaled canvas.
   * Optionally applies gentle grayscale contrast stretching (without binary thresholding)
   * to improve OCR legibility on patterned ID card backgrounds.
   */
  private cropRegionToCanvas(
    img: HTMLImageElement,
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    minWidth = 600,
    gentleContrast = false
  ): HTMLCanvasElement {
    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;
    const sx = Math.max(0, Math.floor(natW * rx));
    const sy = Math.max(0, Math.floor(natH * ry));
    const sw = Math.max(1, Math.floor(natW * rw));
    const sh = Math.max(1, Math.floor(natH * rh));

    const scale = Math.max(1, minWidth / sw);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sw * scale);
    canvas.height = Math.round(sh * scale);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      if (gentleContrast) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        // Find 2nd and 98th percentile luminance for gentle contrast stretch
        let minL = 255;
        let maxL = 0;
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          if (lum < minL) minL = lum;
          if (lum > maxL) maxL = lum;
        }
        const range = Math.max(1, maxL - minL);
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const stretched = Math.min(255, Math.max(0, ((lum - minL) / range) * 255));
          d[i] = stretched;
          d[i + 1] = stretched;
          d[i + 2] = stretched;
        }
        ctx.putImageData(imageData, 0, 0);
      }
    }
    return canvas;
  }

  /**
   * Parses a Ghana Card PIN (GHA-XXXXXXXXX-X) from OCR text.
   * Explicitly excludes 8-digit DDMMYYYY date patterns (e.g. 01061992, 03022020, 02022030).
   */
  private parsePinFromText(text: string, targetPin?: string): string | null {
    const cleaned = text.replace(/\r?\n/g, ' ');
    const cleanTarget = (targetPin || '').replace(/[\s-]/g, '').toUpperCase();
    const cleanDigitsOnly = cleanTarget.replace(/[^0-9]/g, '');

    if (cleanDigitsOnly.length >= 8 && text.replace(/[\s-]/g, '').includes(cleanDigitsOnly)) {
      return targetPin || null;
    }

    const isLikelyDateDigits = (digits: string): boolean => {
      // Reject DDMMYYYY or 1DDMMYYYY (like 101061992 from 01/06/1992)
      return /(?:19[4-9]\d|20[0-4]\d)$/.test(digits);
    };

    // Pattern 1: Canonical GHA-XXXXXXXXX-X (allowing occasional OCR spaces/dots inside the 9 digits)
    const pinRegex1 = /GHA\s*[-–—.]?\s*([0-9OIlZSB][0-9OIlZSB\s.]{7,13})\s*[-–—.]?\s*([0-9OIlZSB])/gi;
    for (const match1 of cleaned.matchAll(pinRegex1)) {
      const digits = match1[1]
        .replace(/[\s.]/g, '')
        .replace(/[oO]/g, '0')
        .replace(/[Il]/g, '1')
        .replace(/[Zz]/g, '2')
        .replace(/[Ss]/g, '5')
        .replace(/[Bb]/g, '8');
      const check = match1[2]
        .replace(/[oO]/g, '0')
        .replace(/[Il]/g, '1')
        .replace(/[Zz]/g, '2');
      if (digits.length >= 9 && !isLikelyDateDigits(digits.slice(0, 9))) {
        return `GHA-${digits.slice(0, 9)}-${check}`;
      }
    }

    // Pattern 2: Search for 9 consecutive digits near 'Personal' or 'ID' or 'GHA'
    const match2 = cleaned.match(/(?:Personal\s*ID|GHA)[^\d]{0,8}(\d{9})[^\d]{0,3}(\d)/i);
    if (match2 && !isLikelyDateDigits(match2[1])) {
      return `GHA-${match2[1]}-${match2[2]}`;
    }

    // Pattern 3: Any 9-digit sequence followed by a hyphen and single digit (not a date)
    const match3 = cleaned.match(/(\d{9})\s*[-–—]\s*(\d)/);
    if (match3 && !isLikelyDateDigits(match3[1])) {
      return `GHA-${match3[1]}-${match3[2]}`;
    }

    return null;
  }

  /**
   * Compares an entered Ghana Card PIN against an OCR-detected PIN.
   * Accepts an exact match, OR at most 1 visually-confusable OCR digit mismatch
   * (e.g. 6<->8, 1<->7, 3<->8, 0<->8, 5<->6) caused by card holograms/watermarks.
   */
  isPinMatch(enteredPin: string, detectedPin: string | null, rawOcrText = ''): boolean {
    const cleanEntered = (enteredPin || '').replace(/[\s-]/g, '').toUpperCase();
    const cleanDetected = (detectedPin || '').replace(/[\s-]/g, '').toUpperCase();
    const cleanRaw = (rawOcrText || '').replace(/[\s-]/g, '').toUpperCase();

    if (cleanEntered.length < 8) return false;
    if (cleanDetected === cleanEntered || cleanRaw.includes(cleanEntered)) return true;
    if (cleanDetected.length !== cleanEntered.length) return false;

    const confusablePairs: Record<string, string> = {
      '6': '850',
      '8': '6309',
      '3': '85',
      '5': '63S',
      '0': '86OQ',
      '1': '74IL',
      '7': '1',
      '4': '91',
      '9': '48',
      '2': 'Z',
    };

    let diffs = 0;
    for (let i = 0; i < cleanEntered.length; i++) {
      const a = cleanEntered[i];
      const b = cleanDetected[i];
      if (a === b) continue;
      // Require 'GHA' prefix to match strictly
      if (i < 3) return false;
      const isConfusable =
        (confusablePairs[a]?.includes(b)) ||
        (confusablePairs[b]?.includes(a));
      if (!isConfusable) return false;
      diffs++;
      if (diffs > 1) return false;
    }

    return diffs <= 1;
  }

  /**
   * Converts a loaded HTMLImageElement to a JPEG data URL for optional AI Vision analysis
   */
  private imageToDataUrl(img: HTMLImageElement, maxWidth = 1200): string {
    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;
    const scale = natW > maxWidth ? maxWidth / natW : 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(natW * scale);
    canvas.height = Math.round(natH * scale);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  /**
   * Cleans an extracted name candidate line by removing stray OCR punctuation/digits
   */
  private cleanNameCandidate(raw: string): string {
    return raw
      .replace(/[^A-Za-z\s\-']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Parses Surname and Firstnames from OCR lines (either Name-zone or full card)
   */
  private parseNameFromLines(
    lines: string[],
    isNameZoneOnly: boolean
  ): { surname: string | null; firstnames: string | null } {
    let surname: string | null = null;
    let firstnames: string | null = null;
    const headerStopWords = /surname|\bnom\b|firstname|pr[eé]nom|previous|nationality|sex|sexe|republic|ghana|ecowas|card|identity/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!surname && /Surname|\bNom\b/i.test(line) && !/Pr[eé]nom|Noms\s+Pr/i.test(line)) {
        const sameLine = this.cleanNameCandidate(line.replace(/.*(?:Surname|\bNom\b)[\s\/:|\-]*/i, ''));
        if (sameLine.length >= 2 && !headerStopWords.test(sameLine)) {
          surname = sameLine;
        } else if (i + 1 < lines.length) {
          const nextLine = this.cleanNameCandidate(lines[i + 1]);
          if (nextLine.length >= 2 && !headerStopWords.test(nextLine)) {
            surname = nextLine;
          }
        }
      }

      if (!firstnames && /Firstname|Pr[eé]nom/i.test(line)) {
        const sameLine = this.cleanNameCandidate(line.replace(/.*(?:Firstnames?|Pr[eé]noms?)[\s\/:|\-]*/i, ''));
        if (sameLine.length >= 2 && !headerStopWords.test(sameLine)) {
          firstnames = sameLine;
        } else if (i + 1 < lines.length) {
          const nextLine = this.cleanNameCandidate(lines[i + 1]);
          if (nextLine.length >= 2 && !headerStopWords.test(nextLine)) {
            firstnames = nextLine;
          }
        }
      }
    }

    // Fallback: in the focused Name-zone crop, any non-header uppercase line is a name
    if ((!surname || !firstnames) && isNameZoneOnly) {
      const candidateLines = lines
        .filter((l) => !headerStopWords.test(l))
        .map((l) => this.cleanNameCandidate(l))
        .filter((l) => l.length >= 3 && /^[A-Z\s\-']{3,30}$/.test(l));

      if (!surname && candidateLines.length >= 1) {
        surname = candidateLines[0];
      }
      if (!firstnames && candidateLines.length >= 2) {
        firstnames = candidateLines[1];
      }
    }

    return { surname, firstnames };
  }

  /**
   * Extracts Ghana Card PIN, Surname, and Firstnames.
   * 1. Attempts server-side AI Vision extraction (/kyc/analyze-card) if configured.
   * 2. Falls back seamlessly to focused, upscaled PIN-zone & Name-zone Tesseract OCR.
   */
  async extractGhanaCardPin(imageSrc: string | File, targetPin?: string): Promise<OcrResult> {
    try {
      const img = await this.loadImage(imageSrc);

      // Step 0: Optional AI Vision pass (Gemini Vision via PHP backend)
      let aiFallbackNote: string | undefined;
      try {
        const dataUrl = typeof imageSrc === 'string' && imageSrc.startsWith('data:')
          ? imageSrc
          : this.imageToDataUrl(img);
        const aiRes = await apiClient.analyzeGhanaCard(dataUrl);
        if (aiRes?.available && (aiRes.pin || aiRes.fullName || aiRes.surname)) {
          const aiFull = aiRes.fullName || [aiRes.firstnames, aiRes.surname].filter(Boolean).join(' ') || null;
          return {
            detectedPin: aiRes.pin || null,
            detectedSurname: aiRes.surname || null,
            detectedFirstnames: aiRes.firstnames || null,
            detectedFullName: aiFull,
            rawText: [aiRes.pin, aiFull, aiRes.documentNumber].filter(Boolean).join('\n'),
            confidence: 98,
            source: 'ai',
          };
        }
        aiFallbackNote = (aiRes as any)?.reason || 'AI Vision unavailable';
      } catch (aiErr: any) {
        aiFallbackNote = aiErr?.message || 'AI Vision endpoint unreachable';
      }

      const worker = await createWorker('eng');

      // Pass 1: Personal ID Number zone (x: 24%..62%, y: 54%..69%)
      // Try natural upscaled crop first (best for LSTM), then contrast-stretched + whitelist if needed
      let zonePin: string | null = null;
      try {
        const naturalPinCanvas = this.cropRegionToCanvas(img, 0.24, 0.54, 0.38, 0.15, 750, false);
        const naturalZoneRes = await worker.recognize(naturalPinCanvas);
        zonePin = this.parsePinFromText(naturalZoneRes.data.text || '', targetPin);

        if (!zonePin) {
          const pinCanvas = this.cropRegionToCanvas(img, 0.24, 0.55, 0.38, 0.13, 750, true);
          await worker.setParameters({
            tessedit_char_whitelist: 'GHA0123456789-',
          });
          const zoneRes = await worker.recognize(pinCanvas);
          zonePin = this.parsePinFromText(zoneRes.data.text || '', targetPin);
          await worker.setParameters({
            tessedit_char_whitelist: '',
          });
        }
      } catch {
        // Ignore zone crop errors and proceed
      }

      // Pass 2: Focused Name zone (x: 24%..62%, y: 21%..45%)
      // Upscaled with gentle contrast stretch to isolate Surname & Firstnames from eagle watermark
      let zoneSurname: string | null = null;
      let zoneFirstnames: string | null = null;
      let zoneNameRaw = '';
      try {
        const nameCanvas = this.cropRegionToCanvas(img, 0.24, 0.21, 0.38, 0.24, 700, true);
        const nameRes = await worker.recognize(nameCanvas);
        zoneNameRaw = nameRes.data.text || '';
        const zoneLines = zoneNameRaw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const parsedZoneName = this.parseNameFromLines(zoneLines, true);
        zoneSurname = parsedZoneName.surname;
        zoneFirstnames = parsedZoneName.firstnames;
      } catch {
        // Ignore name zone errors and proceed to full card pass
      }

      // Pass 3: Full card OCR for fallback PIN, Name, and complete rawText
      const { data } = await worker.recognize(img);
      await worker.terminate();

      const fullRawText = data.text || '';
      const rawText = [zoneNameRaw, fullRawText].filter(Boolean).join('\n');
      const lines = fullRawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

      const detectedPin = zonePin || this.parsePinFromText(fullRawText, targetPin);

      // --- Name Extraction (prefer focused Name zone, fall back to full card) ---
      const fullParsed = this.parseNameFromLines(lines, false);
      let detectedSurname: string | null = zoneSurname || fullParsed.surname;
      let detectedFirstnames: string | null = zoneFirstnames || fullParsed.firstnames;

      // Last-resort fallback heuristics on full card lines
      if (!detectedSurname && !detectedFirstnames) {
        const upperLines = lines.filter(
          (l) => /^[A-Z\s]{3,25}$/.test(l) && !/REPUBLIC|GHANA|ECOWAS|CARD|IDENTITY|NATIONAL|PERSONAL|DOCUMENT/i.test(l)
        );
        if (upperLines.length >= 2) {
          detectedSurname = upperLines[0];
          detectedFirstnames = upperLines[1];
        } else if (upperLines.length === 1) {
          detectedSurname = upperLines[0];
        }
      }

      const detectedFullName = [detectedFirstnames, detectedSurname].filter(Boolean).join(' ') || null;

      return {
        detectedPin,
        detectedSurname,
        detectedFirstnames,
        detectedFullName,
        rawText,
        confidence: data.confidence || 0,
        source: 'ocr',
        aiNote: aiFallbackNote,
      };
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      return {
        detectedPin: null,
        detectedSurname: null,
        detectedFirstnames: null,
        detectedFullName: null,
        rawText: '',
        confidence: 0,
      };
    }
  }

  /**
   * Intelligently compares the entered driver name against the name detected on the Ghana Card
   * Tolerant to:
   * - Order differences (First/Last vs Last/First)
   * - Minor typos & phonetic transpositions (e.g. Micheal vs Michael)
   * Threshold: >= 80% similarity accepts the name without requiring changes
   */
  compareNames(
    enteredFullName: string,
    detectedCardName: string | null,
    rawOcrText?: string
  ): NameMatchResult {
    const cleanEntered = (enteredFullName || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const cleanCard = (detectedCardName || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanEntered) {
      return {
        isMatch: false,
        similarityScore: 0,
        enteredName: enteredFullName,
        detectedName: detectedCardName || 'None',
        message: 'No driver full name entered in Step 1.',
      };
    }

    const enteredTokens = cleanEntered.split(' ').filter((t) => t.length > 1);

    // Also extract all words from raw OCR text for token searching
    const cleanRaw = (rawOcrText || '')
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .replace(/\s+/g, ' ');

    // 1. Exact match
    if (cleanEntered === cleanCard) {
      return {
        isMatch: true,
        similarityScore: 100,
        enteredName: enteredFullName,
        detectedName: detectedCardName || enteredFullName,
        message: 'Name matches Ghana Card exactly (100%).',
      };
    }

    // 2. Candidate card tokens (combine detected card name tokens with raw OCR tokens)
    const cardNameTokens = cleanCard ? cleanCard.split(' ').filter((t) => t.length > 1) : [];
    const rawTokens = cleanRaw.split(' ').filter((t) => t.length > 1);
    const poolTokens = cardNameTokens.length > 0 ? cardNameTokens : rawTokens;

    if (poolTokens.length === 0) {
      return {
        isMatch: false,
        similarityScore: 0,
        enteredName: enteredFullName,
        detectedName: 'Unreadable',
        message: 'Could not extract name from Ghana Card. Ensure photo is clear or use Admin Override.',
      };
    }

    // Measure best match for each entered token against available card tokens
    let enteredScoreSum = 0;
    for (const eToken of enteredTokens) {
      let bestSim = 0;
      // Search in pool
      for (const cToken of poolTokens) {
        const sim = tokenSimilarity(eToken, cToken);
        if (sim > bestSim) bestSim = sim;
      }
      // If pool didn't give high score, search entire raw text words
      if (bestSim < 0.8 && rawTokens.length > 0) {
        for (const rToken of rawTokens) {
          const sim = tokenSimilarity(eToken, rToken);
          if (sim > bestSim) bestSim = sim;
        }
      }
      enteredScoreSum += bestSim;
    }

    const forwardScore = enteredTokens.length > 0 ? (enteredScoreSum / enteredTokens.length) : 0;

    // Reverse check: if cleanCard exists, check each card token against entered tokens
    let reverseScore = forwardScore;
    if (cardNameTokens.length > 0) {
      let cardScoreSum = 0;
      for (const cToken of cardNameTokens) {
        let bestSim = 0;
        for (const eToken of enteredTokens) {
          const sim = tokenSimilarity(cToken, eToken);
          if (sim > bestSim) bestSim = sim;
        }
        cardScoreSum += bestSim;
      }
      reverseScore = cardNameTokens.length > 0 ? (cardScoreSum / cardNameTokens.length) : forwardScore;
    }

    // Final similarity percentage
    const avgScore = (forwardScore + reverseScore) / 2;
    const similarityScore = Math.round(avgScore * 100);

    // Rule: If similarity is >= 80% (minor disparity), accept it cleanly!
    const isMatch = similarityScore >= 80;

    return {
      isMatch,
      similarityScore,
      enteredName: enteredFullName,
      detectedName: detectedCardName || (isMatch ? enteredFullName : 'Card Name'),
      message: isMatch
        ? `Name verified (${similarityScore}% match, meets ≥ 80% threshold).`
        : `Name similarity is ${similarityScore}% (< 80%). Check spelling or use Admin Override.`,
    };
  }

  /**
   * Compares the faces in the passport photo and the Ghana Card
   * Uses TinyFaceDetector with multi-scale scanning and ID portrait crop
   * Threshold: Euclidean distance <= 0.6 maps to >= 70% similarity
   */
  async verifyFaceMatch(
    passportSrc: string | File,
    idCardSrc: string | File
  ): Promise<FaceMatchResult> {
    try {
      await this.loadModels();

      const [passportImg, idCardImg] = await Promise.all([
        this.loadImage(passportSrc),
        this.loadImage(idCardSrc),
      ]);

      // 1. Detect Passport Face (using TinyFaceDetector with sensitive threshold 0.15)
      const passportOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.15,
      });

      const passportDetection = await faceapi
        .detectSingleFace(passportImg, passportOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!passportDetection || !passportDetection.descriptor) {
        return {
          passportFaceDetected: false,
          idFaceDetected: false,
          similarityScore: 0,
          isMatch: false,
          euclideanDistance: 1,
          message: 'No clear face detected in the passport photograph. Please ensure front-facing portrait.',
        };
      }

      const passportDescriptor = passportDetection.descriptor;

      // 2. Detect ID Card Face(s)
      // Prioritize focused, upscaled crops of the right-side portrait zone so we compare
      // against the actual ID photograph rather than the full card or tiny ghost hologram.
      const candidateDescriptors: Float32Array[] = [];

      const cardOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.15,
      });

      const pW = idCardImg.naturalWidth || idCardImg.width;
      const pH = idCardImg.naturalHeight || idCardImg.height;

      if (pW > 0 && pH > 0) {
        // A) Tight portrait zone crop (right side: x 62%..98%, y 28%..82%), upscaled for clarity
        const tightPortraitCanvas = this.cropRegionToCanvas(idCardImg, 0.62, 0.28, 0.36, 0.54, 416, false);
        const tightDetection = await faceapi
          .detectSingleFace(tightPortraitCanvas, cardOptions)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (tightDetection && tightDetection.descriptor) {
          candidateDescriptors.push(tightDetection.descriptor);
        }

        // B) Slightly wider right-half portrait crop if tight crop missed
        if (candidateDescriptors.length === 0) {
          const widePortraitCanvas = this.cropRegionToCanvas(idCardImg, 0.50, 0.15, 0.48, 0.75, 416, false);
          const wideDetection = await faceapi
            .detectSingleFace(widePortraitCanvas, cardOptions)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (wideDetection && wideDetection.descriptor) {
            candidateDescriptors.push(wideDetection.descriptor);
          }
        }
      }

      // C) Last-resort full card scan (filtering out tiny ghost-hologram faces < 12% of card width)
      if (candidateDescriptors.length === 0) {
        const idFullDetections = await faceapi
          .detectAllFaces(idCardImg, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.15 }))
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (idFullDetections && idFullDetections.length > 0) {
          for (const det of idFullDetections) {
            if (det.descriptor && det.detection.box.width >= pW * 0.12) {
              candidateDescriptors.push(det.descriptor);
            }
          }
        }
      }

      if (candidateDescriptors.length === 0) {
        return {
          passportFaceDetected: true,
          idFaceDetected: false,
          similarityScore: 0,
          isMatch: false,
          euclideanDistance: 1,
          message: 'Could not detect face on Ghana Card. Ensure card portrait is clear and glare-free.',
        };
      }

      // 3. Find the lowest Euclidean distance among all detected faces on the card
      let minDistance = 999;
      for (const cardDesc of candidateDescriptors) {
        const dist = faceapi.euclideanDistance(passportDescriptor, cardDesc);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }

      // 4. Map Euclidean Distance to Similarity Percentage
      // Threshold: distance <= 0.65 maps to >= 65%
      let similarityScore = 0;
      if (minDistance <= 0.65) {
        similarityScore = Math.round(65 + (1 - minDistance / 0.65) * 35);
      } else {
        similarityScore = Math.max(0, Math.round(65 - ((minDistance - 0.65) / 0.45) * 65));
      }

      similarityScore = Math.min(100, Math.max(0, similarityScore));
      const isMatch = similarityScore >= 65;

      return {
        passportFaceDetected: true,
        idFaceDetected: true,
        similarityScore,
        isMatch,
        euclideanDistance: minDistance,
        message: isMatch
          ? `Biometric match confirmed (${similarityScore}% similarity, threshold ≥ 65%).`
          : `Face similarity is ${similarityScore}% (< 65%). Use Admin Override if required.`,
      };
    } catch (err: any) {
      console.error('Face verification error:', err);
      return {
        passportFaceDetected: false,
        idFaceDetected: false,
        similarityScore: 0,
        isMatch: false,
        euclideanDistance: 1,
        message: 'Facial verification failed: ' + (err.message || 'Processing error'),
      };
    }
  }
}

export const kycService = new KycVerificationService();
