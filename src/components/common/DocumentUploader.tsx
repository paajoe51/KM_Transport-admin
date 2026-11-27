import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, X, Check, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface DocumentUploaderProps {
  label: string;
  description?: string;
  category: 'passport' | 'id';
  aspectRatio?: 'square' | 'card';
  value: string | null;
  onChange: (imageUri: string | null, file?: File) => void;
  required?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  label,
  description,
  category,
  aspectRatio = 'card',
  value,
  onChange,
  required = false,
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream when camera modal closes or component unmounts
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: category === 'passport' ? 'user' : 'environment',
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions or upload an image file instead.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUri = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    onChange(dataUri);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string, file);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string, file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="document-uploader mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label className="form-label mb-0" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="btn btn-sm btn-link text-danger p-0 d-flex align-items-center gap-1"
            style={{ fontSize: '0.72rem', textDecoration: 'none' }}
          >
            <X size={13} />
            <span>Remove</span>
          </button>
        )}
      </div>

      {description && (
        <div className="text-muted mb-2" style={{ fontSize: '0.73rem' }}>
          {description}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Preview or Dropzone */}
      {value ? (
        <div
          style={{
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '2px solid var(--border)',
            backgroundColor: '#0F172A',
            height: aspectRatio === 'square' ? '180px' : '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={value}
            alt={label}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: aspectRatio === 'square' ? 'cover' : 'contain',
              borderRadius: '8px',
            }}
          />

          {/* Action Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              display: 'flex',
              gap: '6px',
            }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm btn-dark text-white d-flex align-items-center gap-1 shadow"
              style={{ fontSize: '0.72rem', opacity: 0.9 }}
              title="Replace image"
            >
              <RefreshCw size={12} />
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={startCamera}
              className="btn btn-sm btn-kmtms-orange text-white d-flex align-items-center gap-1 shadow"
              style={{ fontSize: '0.72rem' }}
              title="Take new photo"
            >
              <Camera size={12} />
              <span>Snap</span>
            </button>
          </div>

          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.9)',
              color: '#FFFFFF',
              borderRadius: '9999px',
              padding: '2px 8px',
              fontSize: '0.68rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Check size={12} />
            <span>Loaded</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? 'var(--brand-orange)' : '#CBD5E1'}`,
            backgroundColor: isDragging ? 'rgba(242, 101, 34, 0.05)' : '#F8FAFC',
            borderRadius: '10px',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="d-flex justify-content-center gap-2 mb-2">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(242, 101, 34, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-orange)',
              }}
            >
              <Upload size={18} />
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                startCamera();
              }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(11, 37, 69, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-navy)',
                cursor: 'pointer',
              }}
              title="Use Webcam / Camera"
            >
              <Camera size={18} />
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Click or drag image here
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Supports JPG, PNG or WEBP (Max 5MB)
          </div>

          <div className="mt-2 d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-xs btn-outline-secondary"
              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </button>
            <button
              type="button"
              className="btn btn-xs btn-outline-primary"
              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              onClick={(e) => {
                e.stopPropagation();
                startCamera();
              }}
            >
              Use Live Camera
            </button>
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder Modal */}
      {isCameraOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="kmtms-card p-3"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              borderRadius: '16px',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <Camera size={18} color="var(--brand-orange)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  Capture {label}
                </span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="btn btn-sm btn-link text-white p-0"
              >
                <X size={20} />
              </button>
            </div>

            {cameraError ? (
              <div className="p-3 text-center my-3 bg-danger bg-opacity-25 rounded text-danger border border-danger">
                <AlertCircle size={28} className="mx-auto mb-2" />
                <div style={{ fontSize: '0.85rem' }}>{cameraError}</div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="btn btn-sm btn-light mt-3"
                >
                  Close & Upload File
                </button>
              </div>
            ) : (
              <>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '320px',
                    backgroundColor: '#000000',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />

                  {/* Viewfinder Guide Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    {category === 'passport' ? (
                      <div
                        style={{
                          width: '180px',
                          height: '240px',
                          border: '2px dashed #F26522',
                          borderRadius: '50%',
                          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '320px',
                          height: '200px',
                          border: '2px dashed #00A651',
                          borderRadius: '12px',
                          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="text-center text-muted my-2" style={{ fontSize: '0.75rem' }}>
                  {category === 'passport'
                    ? 'Align face clearly inside the oval guide, look straight into the camera.'
                    : 'Position the Ghana Card inside the rectangle box ensuring good lighting and no glare.'}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="btn btn-outline-light btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="btn btn-kmtms-orange btn-sm px-4 d-flex align-items-center gap-2 fw-bold"
                  >
                    <Camera size={16} />
                    <span>Take Snapshot</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
