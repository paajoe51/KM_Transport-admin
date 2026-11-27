import React, { useState, useMemo } from 'react';
import { mockService } from '../../../services/mockService';
import { apiClient } from '../../../services/apiClient';
import { kycService } from '../../../services/kycVerificationService';
import { DocumentUploader } from '../../../components/common/DocumentUploader';
import { Driver, RemittanceFrequency, AccountStatus } from '../../../types';
import { DataTable, Column } from '../../../components/common/DataTable';
import { ActionMenu } from '../../../components/common/ActionMenu';
import { Modal } from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';
import { formatGHS, formatDate, maskGhanaCard, maskPhoneNumber } from '../../../utils/formatters';
import {
  Users,
  Plus,
  Eye,
  Edit2,
  FileText,
  Truck,
  UserCheck,
  ShieldAlert,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  FolderOpen,
  ScanLine,
  ShieldCheck,
  Loader2,
  Sparkles,
  Trash2,
  UserX,
} from 'lucide-react';

export const DriverManagement: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>(mockService.getDrivers());
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [officerFilter, setOfficerFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Add Driver Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+233 24 ');
  const [altPhone, setAltPhone] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Spouse');
  const [emergencyTown, setEmergencyTown] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorGhanaCard, setGuarantorGhanaCard] = useState('GHA-');
  const [guarantorTown, setGuarantorTown] = useState('');
  const [guarantorPhoto, setGuarantorPhoto] = useState<string | null>(null);
  const [guarantorPhotoFile, setGuarantorPhotoFile] = useState<File | undefined>(undefined);
  const [guarantorGhanaCardPhoto, setGuarantorGhanaCardPhoto] = useState<string | null>(null);
  const [guarantorGhanaCardFile, setGuarantorGhanaCardFile] = useState<File | undefined>(undefined);
  const [ghanaCard, setGhanaCard] = useState('GHA-');
  const [licenceNumber, setLicenceNumber] = useState('DL-');
  const [licenceExpiry, setLicenceExpiry] = useState('2028-12-31');
  const [branchId, setBranchId] = useState('branch-1');
  const [officerId, setOfficerId] = useState('officer-1');
  const [vehicleId, setVehicleId] = useState('');
  const [fixedAmount, setFixedAmount] = useState('150.00');
  const [frequency, setFrequency] = useState<RemittanceFrequency>('daily');
  const [dueTime, setDueTime] = useState('18:00');
  const [gracePeriod, setGracePeriod] = useState(16);

  // KYC Photos & Biometric Verification State
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);
  const [passportFile, setPassportFile] = useState<File | undefined>(undefined);
  const [ghanaCardPhoto, setGhanaCardPhoto] = useState<string | null>(null);
  const [ghanaCardFile, setGhanaCardFile] = useState<File | undefined>(undefined);

  // OCR state
  const [ocrDetectedPin, setOcrDetectedPin] = useState<string | null>(null);
  const [ocrRawText, setOcrRawText] = useState<string>('');
  const [isOcrScanning, setIsOcrScanning] = useState(false);

  // Name Verification state
  const [detectedCardName, setDetectedCardName] = useState<string | null>(null);
  const [nameSimilarity, setNameSimilarity] = useState<number | null>(null);
  const [nameVerifyMessage, setNameVerifyMessage] = useState<string | null>(null);

  // Face Matching state
  const [faceSimilarity, setFaceSimilarity] = useState<number | null>(null);
  const [isFaceVerifying, setIsFaceVerifying] = useState(false);
  const [faceVerifyMessage, setFaceVerifyMessage] = useState<string | null>(null);

  // Admin Override state
  const [manualOverride, setManualOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [isSavingDriver, setIsSavingDriver] = useState(false);

  // Edit & Delete Driver States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  // Edit Form Fields
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAltPhone, setEditAltPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editEmergencyRelationship, setEditEmergencyRelationship] = useState('Spouse');
  const [editEmergencyTown, setEditEmergencyTown] = useState('');
  const [editGuarantorName, setEditGuarantorName] = useState('');
  const [editGuarantorGhanaCard, setEditGuarantorGhanaCard] = useState('');
  const [editGuarantorTown, setEditGuarantorTown] = useState('');
  const [editGhanaCard, setEditGhanaCard] = useState('');
  const [editLicenceNumber, setEditLicenceNumber] = useState('');
  const [editLicenceExpiry, setEditLicenceExpiry] = useState('');
  const [editBranchId, setEditBranchId] = useState('');
  const [editOfficerId, setEditOfficerId] = useState('');
  const [editVehicleId, setEditVehicleId] = useState('');
  const [editStatus, setEditStatus] = useState<AccountStatus>('active');

  const { showToast } = useToast();
  const branches = mockService.getBranches();
  const officers = mockService.getOfficers();
  const vehicles = mockService.getVehicles();
  const obligations = mockService.getObligations();
  const payments = mockService.getPayments();
  const configs = mockService.getRemittanceConfigs();

  // Filtered drivers list
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchBranch = branchFilter === 'all' || d.branchId === branchFilter;
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchOfficer = officerFilter === 'all' || d.assignedOfficerId === officerFilter;
      return matchBranch && matchStatus && matchOfficer;
    });
  }, [drivers, branchFilter, statusFilter, officerFilter]);

  const handleOpenAdd = () => {
    setAddStep(1);
    setFullName('');
    setPhone('+233 24 ');
    setAltPhone('');
    setResidentialAddress('');
    setEmergencyName('');
    setEmergencyPhone('+233 ');
    setEmergencyRelationship('Spouse');
    setEmergencyTown('');
    setGuarantorName('');
    setGuarantorGhanaCard('GHA-');
    setGuarantorTown('');
    setGuarantorPhoto(null);
    setGuarantorPhotoFile(undefined);
    setGuarantorGhanaCardPhoto(null);
    setGuarantorGhanaCardFile(undefined);
    setGhanaCard('GHA-');
    setLicenceNumber('DL-');
    setLicenceExpiry('2028-12-31');
    setBranchId('branch-1');
    setOfficerId('officer-1');
    // find first available vehicle
    const available = vehicles.find((v) => v.status === 'available');
    setVehicleId(available ? available.id : '');
    setFixedAmount('150.00');
    setFrequency('daily');

    // Reset KYC & verification state
    setPassportPhoto(null);
    setPassportFile(undefined);
    setGhanaCardPhoto(null);
    setGhanaCardFile(undefined);
    setOcrDetectedPin(null);
    setOcrRawText('');
    setIsOcrScanning(false);
    setDetectedCardName(null);
    setNameSimilarity(null);
    setNameVerifyMessage(null);
    setFaceSimilarity(null);
    setIsFaceVerifying(false);
    setFaceVerifyMessage(null);
    setManualOverride(false);
    setOverrideReason('');

    setIsAddModalOpen(true);
  };

  // Biometric and OCR handlers
  const handlePassportPhotoChange = async (uri: string | null, file?: File) => {
    setPassportPhoto(uri);
    setPassportFile(file);
    setFaceSimilarity(null);
    setFaceVerifyMessage(null);

    if (uri && ghanaCardPhoto) {
      runFaceMatch(uri, ghanaCardPhoto);
    }
  };

  const handleGhanaCardPhotoChange = async (uri: string | null, file?: File) => {
    setGhanaCardPhoto(uri);
    setGhanaCardFile(file);
    setOcrDetectedPin(null);
    setOcrRawText('');
    setDetectedCardName(null);
    setNameSimilarity(null);
    setNameVerifyMessage(null);
    setFaceSimilarity(null);
    setFaceVerifyMessage(null);

    if (uri) {
      // Run OCR with enhanced contrast and noise filtering in background
      setIsOcrScanning(true);
      try {
        const ocrRes = await kycService.extractGhanaCardPin(uri, ghanaCard);
        setOcrRawText(ocrRes.rawText);

        if (ocrRes.detectedPin) {
          setOcrDetectedPin(ocrRes.detectedPin);
          if (!ghanaCard || ghanaCard === 'GHA-') {
            setGhanaCard(ocrRes.detectedPin);
          }
        }

        // Name verification
        const cardName = ocrRes.detectedFullName || ocrRes.detectedSurname || null;
        setDetectedCardName(cardName);

        if (fullName.trim()) {
          const nameRes = kycService.compareNames(fullName, cardName, ocrRes.rawText);
          setNameSimilarity(nameRes.similarityScore);
          setNameVerifyMessage(nameRes.message);
          if (nameRes.isMatch) {
            showToast('info', 'Name Matched', `Card name verified (${nameRes.similarityScore}% match, threshold ≥ 80%).`);
          } else {
            showToast('warning', 'Name Disparity', `Card name differs from entered driver name (${nameRes.similarityScore}% match).`);
          }
        }

        if (ocrRes.detectedPin) {
          const modeLabel = ocrRes.source === 'ai' ? 'AI Vision' : 'Local OCR';
          showToast('info', `${modeLabel} Scanned`, `Detected Card PIN: ${ocrRes.detectedPin}${ocrRes.aiNote ? ` (${ocrRes.aiNote})` : ''}`);
        } else {
          showToast('warning', 'OCR Notice', `Could not detect a clear Ghana Card PIN.${ocrRes.aiNote ? ` (${ocrRes.aiNote})` : ' Please verify orientation or lighting.'}`);
        }
      } catch (err: any) {
        console.error('OCR Error:', err);
        showToast('error', 'OCR Failed', 'Could not process Ghana Card image.');
      } finally {
        setIsOcrScanning(false);
      }

      // If passport is already uploaded, run face match
      if (passportPhoto) {
        runFaceMatch(passportPhoto, uri);
      }
    }
  };

  const runFaceMatch = async (passportUri: string, cardUri: string) => {
    setIsFaceVerifying(true);
    setFaceVerifyMessage(null);
    try {
      const matchRes = await kycService.verifyFaceMatch(passportUri, cardUri);
      setFaceSimilarity(matchRes.similarityScore);
      setFaceVerifyMessage(matchRes.message);
      if (matchRes.isMatch) {
        showToast('success', 'Biometric Verified', `Faces match with ${matchRes.similarityScore}% confidence (Threshold >= 65%).`);
      } else {
        showToast('warning', 'Face Mismatch', `Face similarity is ${matchRes.similarityScore}% (< 65%). Manual review required.`);
      }
    } catch (err: any) {
      console.error('Face verification error:', err);
      setFaceSimilarity(0);
      setFaceVerifyMessage('Face detection or verification failed.');
      showToast('error', 'Verification Failed', 'Could not detect faces in one or both images.');
    } finally {
      setIsFaceVerifying(false);
    }
  };

  // 1. Normalized PIN comparison (exact or at most 1 hologram-confusable digit like 6<->8)
  const isPinMatched = useMemo(() => {
    return kycService.isPinMatch(ghanaCard, ocrDetectedPin, ocrRawText);
  }, [ghanaCard, ocrDetectedPin, ocrRawText]);

  // 2. Intelligent Name Comparison (order-tolerant, minor typo tolerant with threshold >= 80%)
  const nameComparison = useMemo(() => {
    return kycService.compareNames(fullName, detectedCardName, ocrRawText);
  }, [fullName, detectedCardName, ocrRawText]);
  const isNameMatched = Boolean(fullName.trim() && ghanaCardPhoto && nameComparison.isMatch);

  // 3. Biometric Face Similarity (threshold >= 65%)
  const isFaceMatched = faceSimilarity !== null && faceSimilarity >= 65;

  // All 3 checks must pass OR manual admin override provided
  const isKycValid = (isPinMatched && isNameMatched && isFaceMatched) || (manualOverride && overrideReason.trim().length >= 5);

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !ghanaCard || !licenceNumber) {
      showToast('warning', 'Missing Details', 'Please complete required personal and licensing fields.');
      return;
    }

    if (!guarantorName || !guarantorGhanaCard || !guarantorTown || !guarantorPhoto || !guarantorGhanaCardPhoto) {
      showToast('warning', 'Guarantor Incomplete', 'Guarantor name, Ghana Card PIN, town, photo, and Ghana Card picture are required.');
      return;
    }

    if (!passportPhoto || !ghanaCardPhoto) {
      showToast('warning', 'KYC Incomplete', 'Both passport photo and Ghana Card image are required.');
      return;
    }

    if (!isKycValid) {
      showToast('error', 'Verification Blocked', 'Ghana Card PIN match, Name match (≥ 80%), and Face match (≥ 65%) required, or provide manual override justification.');
      return;
    }

    setIsSavingDriver(true);

    try {
      // 1. Upload passport photo and Ghana card if files or data URLs
      let finalAvatarUrl = passportPhoto;
      let finalCardDocUrl = ghanaCardPhoto;

      try {
        const pUpload = await apiClient.uploadImage({
          file: passportFile,
          data: passportPhoto.startsWith('data:') ? passportPhoto : undefined,
          category: 'passport',
        });
        if (pUpload && pUpload.url) {
          finalAvatarUrl = pUpload.url;
        }
      } catch (uploadErr) {
        console.warn('Passport photo upload failed, using local URI:', uploadErr);
      }

      try {
        const idUpload = await apiClient.uploadImage({
          file: ghanaCardFile,
          data: ghanaCardPhoto.startsWith('data:') ? ghanaCardPhoto : undefined,
          category: 'id',
        });
        if (idUpload && idUpload.url) {
          finalCardDocUrl = idUpload.url;
        }
      } catch (uploadErr) {
        console.warn('Ghana Card upload failed, using local URI:', uploadErr);
      }

      let finalGuarantorPhotoUrl = guarantorPhoto || undefined;
      let finalGuarantorCardUrl = guarantorGhanaCardPhoto || undefined;

      try {
        if (guarantorPhoto) {
          const gPhotoUpload = await apiClient.uploadImage({
            file: guarantorPhotoFile,
            data: guarantorPhoto.startsWith('data:') ? guarantorPhoto : undefined,
            category: 'passport',
          });
          if (gPhotoUpload?.url) finalGuarantorPhotoUrl = gPhotoUpload.url;
        }
      } catch (uploadErr) {
        console.warn('Guarantor photo upload failed, using local URI:', uploadErr);
      }

      try {
        if (guarantorGhanaCardPhoto) {
          const gCardUpload = await apiClient.uploadImage({
            file: guarantorGhanaCardFile,
            data: guarantorGhanaCardPhoto.startsWith('data:') ? guarantorGhanaCardPhoto : undefined,
            category: 'id',
          });
          if (gCardUpload?.url) finalGuarantorCardUrl = gCardUpload.url;
        }
      } catch (uploadErr) {
        console.warn('Guarantor Ghana Card upload failed, using local URI:', uploadErr);
      }

      const newDriver = mockService.saveDriver({
        fullName,
        phone,
        altPhone,
        residentialAddress,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        emergencyContactRelationship: emergencyRelationship,
        emergencyContactTown: emergencyTown,
        guarantorName,
        guarantorGhanaCardNumber: guarantorGhanaCard,
        guarantorTown,
        guarantorPhotoUrl: finalGuarantorPhotoUrl,
        guarantorGhanaCardDocUrl: finalGuarantorCardUrl,
        ghanaCardNumber: ghanaCard,
        licenceNumber,
        licenceExpiryDate: licenceExpiry,
        branchId,
        assignedOfficerId: officerId,
        assignedVehicleId: vehicleId || undefined,
        status: 'active',
        currentOutstandingBalance: parseFloat(fixedAmount) || 150,
        avatarUrl: finalAvatarUrl,
        ghanaCardDocUrl: finalCardDocUrl,
      });

      // Save remittance configuration
      mockService.saveRemittanceConfig({
        driverId: newDriver.id,
        fixedAmount: parseFloat(fixedAmount) || 150,
        frequency,
        dueTime,
        gracePeriodHours: gracePeriod,
        effectiveDate: new Date().toISOString().split('T')[0],
        createdBy: 'Michael Abordzi',
      });

      // Assign vehicle if selected
      if (vehicleId) {
        mockService.reassignVehicle(newDriver.id, vehicleId, 'Initial onboarding assignment', 'Michael Abordzi');
      }

      setDrivers(mockService.getDrivers());
      setIsAddModalOpen(false);
      showToast('success', 'Driver Enrolled', `${newDriver.fullName} successfully registered with biometric verification.`);
    } catch (err: any) {
      console.error('Error saving driver:', err);
      showToast('error', 'Registration Error', err.message || 'Could not complete driver enrollment.');
    } finally {
      setIsSavingDriver(false);
    }
  };

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setActiveTab('overview');
  };

  const handleOpenEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setEditFullName(driver.fullName);
    setEditPhone(driver.phone);
    setEditAltPhone(driver.altPhone || '');
    setEditAddress(driver.residentialAddress || '');
    setEditEmergencyName(driver.emergencyContactName || '');
    setEditEmergencyPhone(driver.emergencyContactPhone || '');
    setEditEmergencyRelationship(driver.emergencyContactRelationship || 'Spouse');
    setEditEmergencyTown(driver.emergencyContactTown || '');
    setEditGuarantorName(driver.guarantorName || '');
    setEditGuarantorGhanaCard(driver.guarantorGhanaCardNumber || '');
    setEditGuarantorTown(driver.guarantorTown || '');
    setEditGhanaCard(driver.ghanaCardNumber);
    setEditLicenceNumber(driver.licenceNumber);
    setEditLicenceExpiry(driver.licenceExpiryDate);
    setEditBranchId(driver.branchId);
    setEditOfficerId(driver.assignedOfficerId || 'officer-1');
    setEditVehicleId(driver.assignedVehicleId || '');
    setEditStatus(driver.status);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    if (!editFullName || !editPhone || !editGhanaCard || !editLicenceNumber) {
      showToast('warning', 'Missing Details', 'Full name, phone, Ghana Card PIN and licence are required.');
      return;
    }

    // Vehicle reassignment check if vehicle changed
    if (editVehicleId !== (editingDriver.assignedVehicleId || '')) {
      if (editVehicleId) {
        mockService.reassignVehicle(editingDriver.id, editVehicleId, 'Administrative update', 'Michael Abordzi');
      } else if (editingDriver.assignedVehicleId) {
        const v = vehicles.find((veh) => veh.id === editingDriver.assignedVehicleId);
        if (v) {
          v.currentDriverId = undefined;
          v.status = 'available';
        }
      }
    }

    const updated = mockService.saveDriver({
      id: editingDriver.id,
      fullName: editFullName,
      phone: editPhone,
      altPhone: editAltPhone,
      residentialAddress: editAddress,
      emergencyContactName: editEmergencyName,
      emergencyContactPhone: editEmergencyPhone,
      emergencyContactRelationship: editEmergencyRelationship,
      emergencyContactTown: editEmergencyTown,
      guarantorName: editGuarantorName,
      guarantorGhanaCardNumber: editGuarantorGhanaCard,
      guarantorTown: editGuarantorTown,
      ghanaCardNumber: editGhanaCard,
      licenceNumber: editLicenceNumber,
      licenceExpiryDate: editLicenceExpiry,
      branchId: editBranchId,
      assignedOfficerId: editOfficerId,
      assignedVehicleId: editVehicleId || undefined,
      status: editStatus,
    });

    setDrivers(mockService.getDrivers());
    if (selectedDriver && selectedDriver.id === updated.id) {
      setSelectedDriver(updated);
    }
    setIsEditModalOpen(false);
    showToast('success', 'Driver Updated', `${updated.fullName} details updated successfully.`);
  };

  const handleToggleDriverStatus = (driver: Driver) => {
    const updated = mockService.toggleDriverStatus(driver.id);
    if (updated) {
      setDrivers(mockService.getDrivers());
      if (selectedDriver && selectedDriver.id === updated.id) {
        setSelectedDriver(updated);
      }
      const actionText = updated.status === 'active' ? 'Activated' : 'Deactivated';
      showToast('success', `Driver ${actionText}`, `${driver.fullName} status is now ${updated.status}.`);
    }
  };

  const handleConfirmDeleteDriver = () => {
    if (!driverToDelete) return;
    const ok = mockService.deleteDriver(driverToDelete.id);
    if (ok) {
      setDrivers(mockService.getDrivers());
      if (selectedDriver && selectedDriver.id === driverToDelete.id) {
        setSelectedDriver(null);
      }
      showToast('success', 'Driver Deleted', `${driverToDelete.fullName} removed permanently.`);
    } else {
      showToast('error', 'Delete Failed', 'Could not delete driver.');
    }
    setDriverToDelete(null);
  };

  const columns: Column<Driver>[] = [
    {
      header: 'Driver & ID',
      accessor: (row) => (
        <div className="d-flex align-items-center gap-2">
          <img
            src={row.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt=""
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div className="fw-bold" style={{ color: 'var(--primary)' }}>
              {row.fullName}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {maskGhanaCard(row.ghanaCardNumber)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: (row) => <span style={{ fontSize: '0.85rem' }}>{row.phone}</span>,
    },
    {
      header: 'Branch & Officer',
      accessor: (row) => {
        const branch = branches.find((b) => b.id === row.branchId);
        const officer = officers.find((o) => o.id === row.assignedOfficerId);
        return (
          <div>
            <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>
              {branch?.code || 'ACC-01'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Off: {officer?.fullName.split(' ')[0] || 'Unassigned'}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Vehicle',
      accessor: (row) => {
        const veh = vehicles.find((v) => v.id === row.assignedVehicleId);
        return (
          <div>
            <div className="fw-bold" style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>
              {veh ? veh.registrationNumber : 'None'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {veh ? veh.type : 'Unassigned'}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Arrangement',
      accessor: (row) => {
        const cfg = configs.find((c) => c.driverId === row.id && c.status === 'active');
        return (
          <span style={{ fontSize: '0.8rem' }}>
            <strong>{formatGHS(cfg?.fixedAmount || 150)}</strong> / {cfg?.frequency || 'daily'}
          </span>
        );
      },
    },
    {
      header: 'Outstanding Balance',
      accessor: (row) => (
        <span
          className="fw-bold"
          style={{
            fontSize: '0.85rem',
            color: row.currentOutstandingBalance > 0 ? 'var(--danger)' : 'var(--success)',
          }}
        >
          {formatGHS(row.currentOutstandingBalance)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={row.status === 'active' ? 'badge-kmtms-success' : row.status === 'suspended' ? 'badge-kmtms-danger' : 'badge-kmtms-warning'}>
          {row.status.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <ActionMenu
          ariaLabel={`Actions for ${row.fullName}`}
          items={[
            {
              label: 'View Dossier',
              icon: <Eye size={14} />,
              tone: 'primary',
              onClick: () => handleViewDriver(row),
            },
            {
              label: 'Edit Driver',
              icon: <Edit2 size={14} />,
              onClick: () => handleOpenEditDriver(row),
            },
            {
              label: row.status === 'active' ? 'Deactivate' : 'Activate',
              icon: row.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />,
              tone: row.status === 'active' ? 'warning' : 'success',
              dividerBefore: true,
              onClick: () => handleToggleDriverStatus(row),
            },
            {
              label: 'Delete Driver',
              icon: <Trash2 size={14} />,
              tone: 'danger',
              onClick: () => setDriverToDelete(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Title Bar */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Driver Management
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Centralized driver register, operational allocations, licensing and accounts.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-kmtms-primary">
          <Plus size={16} /> Enroll New Driver
        </button>
      </div>

      {/* Filters Bar */}
      <div className="kmtms-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-3">
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Filter by Branch:
            </label>
            <select
              className="form-select form-select-sm"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-3">
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Account Status:
            </label>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_activation">Pending Activation</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="col-12 col-md-3">
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Assigned Transport Officer:
            </label>
            <select
              className="form-select form-select-sm"
              value={officerFilter}
              onChange={(e) => setOfficerFilter(e.target.value)}
            >
              <option value="all">All Officers</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-3 d-flex align-items-end">
            <button
              onClick={() => {
                setBranchFilter('all');
                setStatusFilter('all');
                setOfficerFilter('all');
              }}
              className="btn btn-sm btn-outline-secondary w-100"
              style={{ height: '31px', fontSize: '0.78rem' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Drivers Data Table */}
      <DataTable
        columns={columns}
        data={filteredDrivers}
        keyExtractor={(d) => d.id}
        searchPlaceholder="Search driver by name, phone, licence, Ghana Card..."
        searchKey={(d) => `${d.fullName} ${d.phone} ${d.ghanaCardNumber} ${d.licenceNumber}`}
      />

      {/* ENROLL DRIVER MODAL (Multi-step per SRD 7.1) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Driver Registration & Fleet Enrollment (Step ${addStep} of 3)`}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveDriver}>
          {/* Step 1: Personal & Emergency Details */}
          {addStep === 1 && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                1. Personal Information & Emergency Contact
              </h3>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kwabena Darko"
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Primary Phone Number *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 24 000 0000"
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Alternative Phone
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="+233 20 000 0000"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Residential Address *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={residentialAddress}
                  onChange={(e) => setResidentialAddress(e.target.value)}
                  placeholder="e.g. House No. 12, Block C, Dansoman, Accra"
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="e.g. Akosua Mensah"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+233 24 112 3344"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Relationship with Contact Person *
                  </label>
                  <select
                    className="form-select"
                    value={emergencyRelationship}
                    onChange={(e) => setEmergencyRelationship(e.target.value)}
                    required
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Relative">Relative</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Contact Person Town *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={emergencyTown}
                    onChange={(e) => setEmergencyTown(e.target.value)}
                    placeholder="e.g. Dansoman, Accra"
                    required
                  />
                </div>
              </div>

              {/* Guarantor Details */}
              <div className="p-3 bg-light rounded border mb-4">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                  Guarantor Details
                </h4>
                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                      Guarantor Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={guarantorName}
                      onChange={(e) => setGuarantorName(e.target.value)}
                      placeholder="e.g. Kwame Boateng"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                      Guarantor Ghana Card PIN *
                    </label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      value={guarantorGhanaCard}
                      onChange={(e) => setGuarantorGhanaCard(e.target.value.toUpperCase())}
                      placeholder="GHA-123456789-0"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                      Guarantor Town *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={guarantorTown}
                      onChange={(e) => setGuarantorTown(e.target.value)}
                      placeholder="e.g. Tema Community 1"
                      required
                    />
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <DocumentUploader
                      label="Guarantor Picture *"
                      description="Clear front-facing photo of the guarantor."
                      category="passport"
                      aspectRatio="square"
                      value={guarantorPhoto}
                      onChange={(uri, file) => {
                        setGuarantorPhoto(uri);
                        setGuarantorPhotoFile(file);
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <DocumentUploader
                      label="Guarantor Ghana Card Picture *"
                      description="Clear front side of the guarantor's Ghana Card."
                      category="id"
                      aspectRatio="card"
                      value={guarantorGhanaCardPhoto}
                      onChange={(uri, file) => {
                        setGuarantorGhanaCardPhoto(uri);
                        setGuarantorGhanaCardFile(file);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-kmtms-secondary">
                  Cancel
                </button>
                <button type="button" onClick={() => setAddStep(2)} className="btn-kmtms-primary">
                  Next: Identification & Licence →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Identification & Driver's Licence */}
          {addStep === 2 && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                2. Ghana Card, Biometrics & Driving Licence
              </h3>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Ghana Card PIN *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={ghanaCard}
                    onChange={(e) => setGhanaCard(e.target.value.toUpperCase())}
                    placeholder="GHA-718293841-9"
                    required
                  />
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    Auto-populated when card is scanned via OCR below.
                  </small>
                </div>
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Driver's Licence Number *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={licenceNumber}
                    onChange={(e) => setLicenceNumber(e.target.value)}
                    placeholder="DL-ACC-2022-8921"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Licence Expiry Date *
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={licenceExpiry}
                  onChange={(e) => setLicenceExpiry(e.target.value)}
                  required
                />
              </div>

              {/* Uploaders for Passport Photo and Ghana Card */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <DocumentUploader
                    label="Driver Passport Photo *"
                    description="Upload or take a live camera shot of the driver. Front-facing, clear neutral background."
                    category="passport"
                    aspectRatio="square"
                    value={passportPhoto}
                    onChange={handlePassportPhotoChange}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <DocumentUploader
                    label="Ghana National ID Card *"
                    description="Upload front side of the Ghana Card. PIN and face must be clearly legible for automated AI verification."
                    category="id"
                    aspectRatio="card"
                    value={ghanaCardPhoto}
                    onChange={handleGhanaCardPhotoChange}
                  />
                </div>
              </div>

              {/* Live AI Verification Results Banner */}
              <div className="p-3 bg-light rounded mb-3 border">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--primary)' }}>
                      Automated 3-Way Identity Verification Status
                    </span>
                  </div>
                  {isKycValid ? (
                    <span className="badge bg-success d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={12} /> All Requirements Met
                    </span>
                  ) : (
                    <span className="badge bg-warning text-dark d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                      <AlertTriangle size={12} /> Verification Pending
                    </span>
                  )}
                </div>

                <div className="row g-2">
                  {/* 1. Ghana Card PIN Check */}
                  <div className="col-12 col-md-4">
                    <div className="p-2 border rounded bg-white h-100 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>1. Ghana Card PIN Check</span>
                          {isOcrScanning && (
                            <span className="text-primary d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                              <Loader2 size={12} className="spinner-border spinner-border-sm" /> Scanning...
                            </span>
                          )}
                        </div>

                        {ocrDetectedPin || isPinMatched ? (
                          <div style={{ fontSize: '0.72rem' }}>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Card PIN:</span>
                              <span className="fw-bold font-monospace">{ocrDetectedPin || ghanaCard}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Entered PIN:</span>
                              <span className="fw-bold font-monospace">{ghanaCard || 'None'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted text-center py-2" style={{ fontSize: '0.72rem' }}>
                            {isOcrScanning ? 'Reading card PIN with OCR...' : 'Upload card to scan PIN'}
                          </div>
                        )}
                      </div>

                      {(ocrDetectedPin || isPinMatched) && (
                        <div className="mt-2 text-center">
                          {isPinMatched ? (
                            <span className="badge bg-success-subtle text-success border border-success w-100 py-1">
                              <CheckCircle2 size={12} className="me-1 inline" /> PIN Matches Card
                            </span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger border border-danger w-100 py-1">
                              <XCircle size={12} className="me-1 inline" /> PIN Mismatch
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Driver Name Check */}
                  <div className="col-12 col-md-4">
                    <div className="p-2 border rounded bg-white h-100 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>2. Driver Name Check</span>
                          {isOcrScanning && (
                            <span className="text-primary d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                              <Loader2 size={12} className="spinner-border spinner-border-sm" /> Reading...
                            </span>
                          )}
                        </div>

                        {detectedCardName || ocrRawText ? (
                          <div style={{ fontSize: '0.72rem' }}>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Card Name:</span>
                              <span className="fw-bold text-truncate" style={{ maxWidth: '120px' }}>
                                {detectedCardName || (isNameMatched ? fullName : 'Parsed in Card')}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Entered Name:</span>
                              <span className="fw-bold text-truncate" style={{ maxWidth: '120px' }}>
                                {fullName || 'None'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted text-center py-2" style={{ fontSize: '0.72rem' }}>
                            {isOcrScanning ? 'Matching card name with driver...' : 'Upload card to verify name'}
                          </div>
                        )}
                      </div>

                      {(detectedCardName || ocrRawText) && (
                        <div className="mt-2 text-center">
                          {isNameMatched ? (
                            <span className="badge bg-success-subtle text-success border border-success w-100 py-1">
                              <CheckCircle2 size={12} className="me-1 inline" /> Name Verified ({nameComparison.similarityScore}% ≥ 80%)
                            </span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger border border-danger w-100 py-1">
                              <XCircle size={12} className="me-1 inline" /> Name Disparity ({nameComparison.similarityScore}% &lt; 80%)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Facial Biometric Match */}
                  <div className="col-12 col-md-4">
                    <div className="p-2 border rounded bg-white h-100 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>3. Facial Biometrics</span>
                          {isFaceVerifying && (
                            <span className="text-primary d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                              <Loader2 size={12} className="spinner-border spinner-border-sm" /> Matching...
                            </span>
                          )}
                        </div>

                        {faceSimilarity !== null ? (
                          <div style={{ fontSize: '0.72rem' }}>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Similarity Score:</span>
                              <span className={`fw-bold ${faceSimilarity >= 65 ? 'text-success' : 'text-danger'}`}>
                                {faceSimilarity}% (Req: ≥ 65%)
                              </span>
                            </div>

                            <div className="progress mb-1" style={{ height: '7px' }}>
                              <div
                                className={`progress-bar ${faceSimilarity >= 65 ? 'bg-success' : 'bg-danger'}`}
                                role="progressbar"
                                style={{ width: `${Math.min(faceSimilarity, 100)}%` }}
                              />
                            </div>

                            {faceVerifyMessage && (
                              <div className="text-muted text-truncate" style={{ fontSize: '0.66rem' }} title={faceVerifyMessage}>
                                {faceVerifyMessage}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-muted text-center py-2" style={{ fontSize: '0.72rem' }}>
                            {isFaceVerifying ? 'Comparing face landmarks (SSD)...' : 'Upload both photos for matching'}
                          </div>
                        )}
                      </div>

                      {faceSimilarity !== null && (
                        <div className="mt-2 text-center">
                          {isFaceMatched ? (
                            <span className="badge bg-success-subtle text-success border border-success w-100 py-1">
                              <CheckCircle2 size={12} className="me-1 inline" /> Face Verified (≥ 65%)
                            </span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger border border-danger w-100 py-1">
                              <XCircle size={12} className="me-1 inline" /> Under Threshold ({faceSimilarity}% &lt; 65%)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Manual Override Block (if requirements not automatically met) */}
                {(!isPinMatched || !isNameMatched || !isFaceMatched) && passportPhoto && ghanaCardPhoto && (
                  <div className="mt-3 p-2 bg-warning-subtle border border-warning rounded">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="manualOverrideCheck"
                        checked={manualOverride}
                        onChange={(e) => setManualOverride(e.target.checked)}
                      />
                      <label className="form-check-label fw-bold text-dark" htmlFor="manualOverrideCheck" style={{ fontSize: '0.75rem' }}>
                        Admin Manual Verification Override
                      </label>
                    </div>

                    {manualOverride && (
                      <div>
                        <label className="form-label mb-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                          Override Justification Reason * (Audited)
                        </label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          placeholder="e.g. Ghana Card photo has slight lamination glare; officer physically inspected physical card & driver in office."
                          style={{ fontSize: '0.75rem' }}
                        />
                        {overrideReason.trim().length < 5 && (
                          <div className="text-danger mt-1" style={{ fontSize: '0.68rem' }}>
                            Please provide at least 5 characters explaining this manual bypass.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-between">
                <button type="button" onClick={() => setAddStep(1)} className="btn-kmtms-secondary">
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setAddStep(3)}
                  className="btn-kmtms-primary"
                  disabled={!passportPhoto || !ghanaCardPhoto || isOcrScanning || isFaceVerifying || !isKycValid}
                >
                  {isOcrScanning || isFaceVerifying ? 'Verifying Documents...' : 'Next: Remittance & Assignment →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Operational Assignment & Remittance */}
          {addStep === 3 && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                3. Operational Assignment & Remittance Configuration
              </h3>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Branch *
                  </label>
                  <select
                    className="form-select"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Assigned Officer *
                  </label>
                  <select
                    className="form-select"
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                  >
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.fullName} ({o.branchId === 'branch-1' ? 'Accra' : 'Tema'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Assigned Vehicle (Rule: 1 active driver per vehicle)
                </label>
                <select
                  className="form-select"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                >
                  <option value="">No Vehicle Assigned Yet (Standby)</option>
                  {vehicles
                    .filter((v) => v.status === 'available')
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} — {v.make} {v.model} ({v.type})
                      </option>
                    ))}
                </select>
              </div>

              <div className="row g-2 mb-4 p-3 bg-light rounded border">
                <div className="col-12 fw-bold text-dark mb-2" style={{ fontSize: '0.825rem' }}>
                  Remittance Agreement Settings
                </div>
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Fixed Remittance Amount (GHS) *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Remittance Frequency *
                  </label>
                  <select
                    className="form-select"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RemittanceFrequency)}
                  >
                    <option value="daily">Daily (Calendar Days)</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button type="button" onClick={() => setAddStep(2)} className="btn-kmtms-secondary">
                  ← Back
                </button>
                <button type="submit" className="btn-kmtms-primary">
                  Enroll Driver & Activate
                </button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* DRIVER PROFILE DETAILS (8 TABS per SRD 9.3) */}
      {selectedDriver && (
        <Modal
          isOpen={!!selectedDriver}
          onClose={() => setSelectedDriver(null)}
          title={`Driver Dossier: ${selectedDriver.fullName}`}
          maxWidth="840px"
        >
          {/* Header Summary */}
          <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <img
                src={selectedDriver.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt=""
                style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
                  {selectedDriver.fullName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {selectedDriver.phone} • {maskGhanaCard(selectedDriver.ghanaCardNumber)}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className={selectedDriver.status === 'active' ? 'badge-kmtms-success' : selectedDriver.status === 'suspended' ? 'badge-kmtms-danger' : 'badge-kmtms-warning'}>
                {selectedDriver.status.toUpperCase()}
              </span>
              <div className="text-end me-2">
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Balance</div>
                <div className="fw-bold" style={{ color: selectedDriver.currentOutstandingBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {formatGHS(selectedDriver.currentOutstandingBalance)}
                </div>
              </div>
              <div className="d-flex align-items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEditDriver(selectedDriver)}
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleDriverStatus(selectedDriver)}
                  className={`btn btn-sm ${selectedDriver.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'} d-flex align-items-center gap-1`}
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  {selectedDriver.status === 'active' ? <UserX size={12} /> : <UserCheck size={12} />}
                  {selectedDriver.status === 'active' ? ' Deactivate' : ' Activate'}
                </button>
                <button
                  type="button"
                  onClick={() => setDriverToDelete(selectedDriver)}
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>

          {/* 8 Tabs Navigation */}
          <div className="d-flex gap-1 border-bottom mb-3 overflow-x-auto pb-1" style={{ fontSize: '0.8rem' }}>
            {[
              { id: 'overview', label: '1. Overview' },
              { id: 'remittances', label: '2. Remittances' },
              { id: 'payments', label: '3. Payments' },
              { id: 'vehicle', label: '4. Vehicle' },
              { id: 'documents', label: '5. Documents' },
              { id: 'assignments', label: '6. Assignments' },
              { id: 'suspensions', label: '7. Suspensions' },
              { id: 'audit', label: '8. Audit History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn btn-sm"
                style={{
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: activeTab === tab.id ? 'var(--primary-subtle)' : 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <div className="p-3 bg-light rounded">
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operational Branch</div>
                    <div className="fw-bold">
                      {branches.find((b) => b.id === selectedDriver.branchId)?.name || 'Accra Central'}
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 bg-light rounded">
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Responsible Transport Officer</div>
                    <div className="fw-bold">
                      {officers.find((o) => o.id === selectedDriver.assignedOfficerId)?.fullName || 'Emmanuel Kwakye'}
                    </div>
                  </div>
                </div>
              </div>

              <table className="table table-sm" style={{ fontSize: '0.85rem' }}>
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: '35%' }}>Residential Address:</td>
                    <td className="fw-semibold">{selectedDriver.residentialAddress}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Driving Licence No:</td>
                    <td className="fw-semibold">{selectedDriver.licenceNumber} (Exp: {selectedDriver.licenceExpiryDate})</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Emergency Contact:</td>
                    <td>
                      {selectedDriver.emergencyContactName} ({selectedDriver.emergencyContactPhone})
                      {selectedDriver.emergencyContactRelationship && ` — ${selectedDriver.emergencyContactRelationship}`}
                      {selectedDriver.emergencyContactTown && ` • Town: ${selectedDriver.emergencyContactTown}`}
                    </td>
                  </tr>
                  {selectedDriver.guarantorName && (
                    <tr>
                      <td className="text-muted">Guarantor:</td>
                      <td>
                        <div className="fw-semibold">
                          {selectedDriver.guarantorName}
                          {selectedDriver.guarantorGhanaCardNumber && (
                            <span className="font-monospace ms-2 text-muted" style={{ fontSize: '0.8rem' }}>
                              ({selectedDriver.guarantorGhanaCardNumber})
                            </span>
                          )}
                        </div>
                        {selectedDriver.guarantorTown && (
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                            Town: {selectedDriver.guarantorTown}
                          </div>
                        )}
                        {(selectedDriver.guarantorPhotoUrl || selectedDriver.guarantorGhanaCardDocUrl) && (
                          <div className="d-flex gap-2 mt-2">
                            {selectedDriver.guarantorPhotoUrl && (
                              <img
                                src={selectedDriver.guarantorPhotoUrl}
                                alt="Guarantor"
                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                              />
                            )}
                            {selectedDriver.guarantorGhanaCardDocUrl && (
                              <img
                                src={selectedDriver.guarantorGhanaCardDocUrl}
                                alt="Guarantor Ghana Card"
                                style={{ width: '76px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                              />
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="text-muted">Total Verified Remittance:</td>
                    <td className="fw-bold text-success">{formatGHS(selectedDriver.totalVerifiedPayments)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Overdue Periods:</td>
                    <td>
                      <span className={selectedDriver.overdueObligationsCount > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                        {selectedDriver.overdueObligationsCount} period(s)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: REMITTANCES */}
          {activeTab === 'remittances' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold" style={{ fontSize: '0.85rem' }}>Contractual Obligations Register</span>
                <span className="badge bg-light text-dark border">
                  Total Outstanding: {formatGHS(selectedDriver.currentOutstandingBalance)}
                </span>
              </div>
              <div className="table-responsive">
                <table className="table table-sm align-middle" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr className="text-muted">
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Allocated</th>
                      <th>Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obligations
                      .filter((o) => o.driverId === selectedDriver.id)
                      .map((ob) => (
                        <tr key={ob.id}>
                          <td className="fw-semibold">{ob.periodName}</td>
                          <td>{formatGHS(ob.amount)}</td>
                          <td>{formatDate(ob.dueDate)}</td>
                          <td className="text-success">{formatGHS(ob.allocatedAmount)}</td>
                          <td className="fw-bold">{formatGHS(ob.balance)}</td>
                          <td>
                            <span className={`badge-kmtms-${ob.status === 'settled' ? 'success' : ob.status === 'overdue' ? 'danger' : 'warning'}`}>
                              {ob.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold" style={{ fontSize: '0.85rem' }}>Verified & Submitted Transactions</span>
              </div>
              <div className="table-responsive">
                <table className="table table-sm align-middle" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr className="text-muted">
                      <th>Reference</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments
                      .filter((p) => p.driverId === selectedDriver.id)
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="fw-semibold">{p.reference}</td>
                          <td className="fw-bold">{formatGHS(p.amount)}</td>
                          <td>{p.method}</td>
                          <td>{formatDate(p.submittedAt)}</td>
                          <td>
                            <span className={`badge-kmtms-${p.status === 'verified' ? 'success' : 'warning'}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: VEHICLE */}
          {activeTab === 'vehicle' && (
            <div>
              {selectedDriver.assignedVehicleId ? (
                (() => {
                  const veh = vehicles.find((v) => v.id === selectedDriver.assignedVehicleId);
                  return veh ? (
                    <div className="row g-3 align-items-center">
                      <div className="col-sm-5">
                        <img
                          src={veh.photoUrl}
                          alt="Vehicle"
                          className="img-fluid rounded border shadow-sm"
                        />
                      </div>
                      <div className="col-sm-7">
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {veh.registrationNumber}
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          {veh.make} {veh.model} ({veh.year}) — {veh.type}
                        </div>
                        <ul className="list-group list-group-flush" style={{ fontSize: '0.8rem' }}>
                          <li className="list-group-item px-0 d-flex justify-content-between">
                            <span className="text-muted">Chassis No:</span>
                            <code>{veh.chassisNumber}</code>
                          </li>
                          <li className="list-group-item px-0 d-flex justify-content-between">
                            <span className="text-muted">Insurance Expiry:</span>
                            <span>{formatDate(veh.insuranceExpiryDate)}</span>
                          </li>
                          <li className="list-group-item px-0 d-flex justify-content-between">
                            <span className="text-muted">Roadworthiness:</span>
                            <span>{formatDate(veh.roadworthinessExpiryDate)}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div>No vehicle record found.</div>
                  );
                })()
              ) : (
                <div className="p-4 text-center text-muted">
                  Driver currently has no active assigned vehicle.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div className="p-3 bg-light rounded border text-center h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Passport Photograph</div>
                    {selectedDriver.avatarUrl ? (
                      <div className="mb-2 d-flex justify-content-center">
                        <img
                          src={selectedDriver.avatarUrl}
                          alt="Driver Passport"
                          style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--border)' }}
                        />
                      </div>
                    ) : (
                      <div className="py-4">
                        <Users size={36} color="var(--primary)" className="mb-2" />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No custom photo uploaded</div>
                      </div>
                    )}
                  </div>
                  {selectedDriver.avatarUrl && (
                    <a
                      href={selectedDriver.avatarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary"
                      style={{ fontSize: '0.75rem' }}
                    >
                      View Full Photo
                    </a>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 bg-light rounded border text-center h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Ghana National ID Card</div>
                    {selectedDriver.ghanaCardDocUrl ? (
                      <div className="mb-2">
                        <img
                          src={selectedDriver.ghanaCardDocUrl}
                          alt="Ghana Card"
                          style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--border)' }}
                        />
                        <div className="badge bg-success-subtle text-success border border-success mt-2" style={{ fontSize: '0.7rem' }}>
                          <CheckCircle2 size={12} className="me-1 inline" /> Verified Document
                        </div>
                      </div>
                    ) : (
                      <div className="py-4">
                        <FileText size={36} color="var(--primary)" className="mb-2" />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Document (On Record)</div>
                      </div>
                    )}
                  </div>
                  {selectedDriver.ghanaCardDocUrl ? (
                    <a
                      href={selectedDriver.ghanaCardDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary"
                      style={{ fontSize: '0.75rem' }}
                    >
                      View Secure Card Document
                    </a>
                  ) : (
                    <button className="btn btn-sm btn-outline-primary mt-2" style={{ fontSize: '0.75rem' }}>
                      View Record Details
                    </button>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 bg-light rounded border text-center h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Driving Licence</div>
                    <div className="py-4">
                      <FileText size={36} color="var(--secondary)" className="mb-2" />
                      <div className="fw-semibold" style={{ fontSize: '0.78rem' }}>{selectedDriver.licenceNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Expires: {formatDate(selectedDriver.licenceExpiryDate)}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-primary mt-2" style={{ fontSize: '0.75rem' }}>
                    View Licence Record
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Vehicle & Transport Officer Assignment Audit
              </div>
              <div className="p-3 bg-light rounded border" style={{ fontSize: '0.8rem' }}>
                {selectedDriver.assignedVehicleId ? (
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <strong>Current Vehicle Assignment</strong>
                      <span className="text-muted">{selectedDriver.assignedVehicleId}</span>
                    </div>
                    <div className="text-secondary">
                      Assigned to Vehicle ID: {selectedDriver.assignedVehicleId}. Assigned Officer: {selectedDriver.assignedOfficerId || 'Unassigned'}.
                    </div>
                  </div>
                ) : (
                  <div className="text-muted text-center py-2">
                    No vehicle currently assigned to this driver.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: SUSPENSIONS */}
          {activeTab === 'suspensions' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Suspension History
              </div>
              <div className="p-3 bg-light rounded border" style={{ fontSize: '0.8rem' }}>
                {selectedDriver.status === 'suspended' ? (
                  <div>
                    <div className="badge-kmtms-danger mb-2">ACTIVE SUSPENSION</div>
                    <div>Approved medical suspension period: 11 Nov 2026 – 25 Nov 2026.</div>
                    <div className="text-muted mt-1">Daily obligations excluded during approved duration. Prior arrears remain payable.</div>
                  </div>
                ) : (
                  <div className="text-muted">No historical suspension records for this driver.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT HISTORY */}
          {activeTab === 'audit' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Driver Ledger & Modification Trail
              </div>
              <ul className="list-group list-group-flush" style={{ fontSize: '0.8rem' }}>
                <li className="list-group-item px-0">
                  <span className="text-muted">{formatDate(selectedDriver.createdAt)}:</span> Account created and onboarding initiated.
                </li>
                <li className="list-group-item px-0">
                  <span className="text-muted">23 Nov 2026:</span> Verified payment GH₵150.00 credited via Paystack.
                </li>
              </ul>
            </div>
          )}

          <div className="d-flex justify-content-end mt-4 pt-3 border-top">
            <button onClick={() => setSelectedDriver(null)} className="btn-kmtms-secondary">
              Close Profile
            </button>
          </div>
        </Modal>
      )}

      {/* EDIT DRIVER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Driver: ${editingDriver?.fullName}`}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveEditedDriver}>
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Full Name *
              </label>
              <input
                type="text"
                className="form-control"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Account Status *
              </label>
              <select
                className="form-select"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as AccountStatus)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending_activation">Pending Activation</option>
              </select>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Primary Phone Number *
              </label>
              <input
                type="text"
                className="form-control"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Alternate Phone Number
              </label>
              <input
                type="text"
                className="form-control"
                value={editAltPhone}
                onChange={(e) => setEditAltPhone(e.target.value)}
                placeholder="+233 ..."
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Residential Address
            </label>
            <input
              type="text"
              className="form-control"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              placeholder="House No, Street, Town/City"
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Emergency Contact Name
              </label>
              <input
                type="text"
                className="form-control"
                value={editEmergencyName}
                onChange={(e) => setEditEmergencyName(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Emergency Contact Phone
              </label>
              <input
                type="text"
                className="form-control"
                value={editEmergencyPhone}
                onChange={(e) => setEditEmergencyPhone(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Relationship with Contact Person
              </label>
              <select
                className="form-select"
                value={editEmergencyRelationship}
                onChange={(e) => setEditEmergencyRelationship(e.target.value)}
              >
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Child">Child</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Contact Person Town
              </label>
              <input
                type="text"
                className="form-control"
                value={editEmergencyTown}
                onChange={(e) => setEditEmergencyTown(e.target.value)}
                placeholder="e.g. Dansoman, Accra"
              />
            </div>
          </div>

          <div className="row g-2 mb-3 p-2 bg-light rounded border">
            <div className="col-12">
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>Guarantor Details</div>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                Guarantor Name
              </label>
              <input
                type="text"
                className="form-control"
                value={editGuarantorName}
                onChange={(e) => setEditGuarantorName(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                Guarantor Ghana Card PIN
              </label>
              <input
                type="text"
                className="form-control font-monospace"
                value={editGuarantorGhanaCard}
                onChange={(e) => setEditGuarantorGhanaCard(e.target.value.toUpperCase())}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                Guarantor Town
              </label>
              <input
                type="text"
                className="form-control"
                value={editGuarantorTown}
                onChange={(e) => setEditGuarantorTown(e.target.value)}
              />
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Ghana Card PIN *
              </label>
              <input
                type="text"
                className="form-control font-monospace"
                value={editGhanaCard}
                onChange={(e) => setEditGhanaCard(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Driver's Licence Number *
              </label>
              <input
                type="text"
                className="form-control"
                value={editLicenceNumber}
                onChange={(e) => setEditLicenceNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Licence Expiry Date *
            </label>
            <input
              type="date"
              className="form-control"
              value={editLicenceExpiry}
              onChange={(e) => setEditLicenceExpiry(e.target.value)}
              required
            />
          </div>

          <div className="row g-2 mb-4 p-3 bg-light rounded border">
            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                Branch Depot *
              </label>
              <select
                className="form-select"
                value={editBranchId}
                onChange={(e) => setEditBranchId(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                Assigned Officer *
              </label>
              <select
                className="form-select"
                value={editOfficerId}
                onChange={(e) => setEditOfficerId(e.target.value)}
              >
                {officers.map((o) => (
                  <option key={o.id} value={o.id}>{o.fullName}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                Assigned Vehicle
              </label>
              <select
                className="form-select"
                value={editVehicleId}
                onChange={(e) => setEditVehicleId(e.target.value)}
              >
                <option value="">No Vehicle Assigned (Standby)</option>
                {vehicles
                  .filter((v) => v.status === 'available' || v.id === editingDriver?.assignedVehicleId)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.type})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-kmtms-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-kmtms-primary">
              Save Driver Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE DRIVER CONFIRMATION MODAL */}
      <Modal
        isOpen={!!driverToDelete}
        onClose={() => setDriverToDelete(null)}
        title="Confirm Driver Deletion"
      >
        <div className="p-2">
          <div className="d-flex align-items-center gap-2 text-danger mb-3">
            <AlertTriangle size={24} />
            <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700 }}>
              Permanent Driver Deletion
            </h5>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to permanently delete driver{' '}
            <strong className="text-dark">{driverToDelete?.fullName}</strong>?
          </p>
          <div className="p-2 bg-light rounded border mb-3" style={{ fontSize: '0.78rem' }}>
            <div><strong>Ghana Card:</strong> {driverToDelete?.ghanaCardNumber}</div>
            <div><strong>Phone:</strong> {driverToDelete?.phone}</div>
            <div>
              <strong>Vehicle Assignment:</strong>{' '}
              {driverToDelete?.assignedVehicleId ? (
                <span className="text-danger fw-bold">
                  {vehicles.find((v) => v.id === driverToDelete.assignedVehicleId)?.registrationNumber || driverToDelete.assignedVehicleId} (Will be released to available fleet)
                </span>
              ) : (
                <span className="text-muted">None (Standby)</span>
              )}
            </div>
            <div className="text-danger mt-2">
              ⚠️ This will remove the driver profile from the active register and unassign their vehicle.
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              onClick={() => setDriverToDelete(null)}
              className="btn btn-sm btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteDriver}
              className="btn btn-sm btn-danger d-flex align-items-center gap-1"
            >
              <Trash2 size={13} /> Delete Driver
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
