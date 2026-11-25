// Formatters for KM Transport Management System (KMTMS)
// Currency: GHS, Timezone: Africa/Accra, Ghana localization

export function formatGHS(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'GH₵ 0.00';
  }
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('GHS', 'GH₵');
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Africa/Accra',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Accra',
    });
  } catch {
    return dateString;
  }
}

export function maskGhanaCard(card: string | undefined | null): string {
  if (!card) return 'GHA-•••••••••-•';
  // Example: GHA-728192831-9 -> GHA-•••••2831-9
  if (card.length > 8) {
    const parts = card.split('-');
    if (parts.length === 3) {
      const middle = parts[1];
      const maskedMiddle = '•••••' + middle.slice(-4);
      return `${parts[0]}-${maskedMiddle}-${parts[2]}`;
    }
    return card.slice(0, 4) + '••••' + card.slice(-4);
  }
  return card;
}

export function maskPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return '—';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length >= 10) {
    return clean.slice(0, 4) + ' ••• ' + clean.slice(-3);
  }
  return phone;
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'verified':
    case 'settled':
    case 'approved':
      return 'badge-kmtms-success';
    case 'due':
    case 'pending':
    case 'pending_activation':
    case 'pending_verification':
    case 'pending_provider':
    case 'initiated':
      return 'badge-kmtms-warning';
    case 'outstanding':
    case 'suspended':
    case 'under_breakdown':
    case 'maintenance':
      return 'badge-kmtms-info';
    case 'overdue':
    case 'rejected':
    case 'provider_failed':
    case 'inactive':
    case 'reversed':
      return 'badge-kmtms-danger';
    case 'upcoming':
    case 'archived':
    case 'available':
      return 'badge-kmtms-neutral';
    default:
      return 'badge-kmtms-neutral';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending_activation':
      return 'Pending Activation';
    case 'pending_verification':
      return 'Pending Verification';
    case 'pending_provider':
      return 'Awaiting Gateway';
    case 'provider_failed':
      return 'Provider Failed';
    case 'under_breakdown':
      return 'Under Breakdown';
    case 'momo_auto':
      return 'MoMo (Automated Gateway)';
    case 'momo_manual':
      return 'MoMo (Direct Transfer)';
    case 'proxy':
      return 'Proxy Cash Collection';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  }
}
