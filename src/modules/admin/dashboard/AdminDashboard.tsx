import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockService } from '../../../services/mockService';
import { formatGHS, formatDate } from '../../../utils/formatters';
import { StatCard } from '../../../components/common/StatCard';
import {
  Users,
  UserCheck,
  Truck,
  Building2,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  FileText,
  Calendar,
  Filter,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const branches = mockService.getBranches();
  const drivers = mockService.getDrivers();
  const vehicles = mockService.getVehicles();
  const officers = mockService.getOfficers();
  const obligations = mockService.getObligations();
  const payments = mockService.getPayments();
  const suspensions = mockService.getSuspensions();

  // Filtered drivers & obligations based on selected branch
  const filteredDrivers = useMemo(() => {
    if (selectedBranch === 'all') return drivers;
    return drivers.filter((d) => d.branchId === selectedBranch);
  }, [drivers, selectedBranch]);

  // Operational metrics
  const totalDrivers = filteredDrivers.length;
  const activeDrivers = filteredDrivers.filter((d) => d.status === 'active').length;
  const suspendedDrivers = filteredDrivers.filter((d) => d.status === 'suspended').length;
  const pendingActivationDrivers = filteredDrivers.filter((d) => d.status === 'pending_activation').length;

  const totalVehicles = selectedBranch === 'all'
    ? vehicles.length
    : vehicles.filter((v) => v.branchId === selectedBranch).length;
  const assignedVehicles = selectedBranch === 'all'
    ? vehicles.filter((v) => v.status === 'assigned').length
    : vehicles.filter((v) => v.branchId === selectedBranch && v.status === 'assigned').length;
  const availableVehicles = selectedBranch === 'all'
    ? vehicles.filter((v) => v.status === 'available').length
    : vehicles.filter((v) => v.branchId === selectedBranch && v.status === 'available').length;
  const breakdownVehicles = selectedBranch === 'all'
    ? vehicles.filter((v) => v.status === 'under_breakdown').length
    : vehicles.filter((v) => v.branchId === selectedBranch && v.status === 'under_breakdown').length;

  // Financial Metrics
  const verifiedPaymentsList = useMemo(() => {
    return payments.filter(
      (p) => p.status === 'verified' && (selectedBranch === 'all' || p.branchId === selectedBranch)
    );
  }, [payments, selectedBranch]);

  const verifiedCollectionsTotal = verifiedPaymentsList.reduce((sum, p) => sum + p.amount, 0);

  const eligibleObligationsList = useMemo(() => {
    return obligations.filter((o) => {
      const driver = drivers.find((d) => d.id === o.driverId);
      return (
        o.status !== 'suspended' &&
        (selectedBranch === 'all' || (driver && driver.branchId === selectedBranch))
      );
    });
  }, [obligations, drivers, selectedBranch]);

  const expectedRemittancesTotal = eligibleObligationsList.reduce((sum, o) => sum + o.amount, 0);

  const totalOutstandingBalance = filteredDrivers.reduce(
    (sum, d) => sum + d.currentOutstandingBalance,
    0
  );

  const overdueBalance = eligibleObligationsList
    .filter((o) => o.status === 'overdue')
    .reduce((sum, o) => sum + o.balance, 0);

  // Queue monitoring
  const pendingMoMoCount = payments.filter((p) => p.status === 'pending_verification' && p.method === 'momo_manual').length;
  const pendingProxyCount = payments.filter((p) => p.status === 'pending_verification' && p.method === 'proxy').length;
  const pendingSuspensionsCount = suspensions.filter((s) => s.status === 'pending').length;

  // Chart Data: Expected vs Verified
  const collectionTrendData = [
    { name: 'Week 44', expected: 12500, verified: 12500 },
    { name: 'Week 45', expected: 14200, verified: 13800 },
    { name: 'Week 46', expected: 13900, verified: 13900 },
    { name: 'Week 47', expected: 15400, verified: 11200 }, // Current week
  ];

  // Chart Data: Driver Status Breakdown
  const driverStatusData = [
    { name: 'Up-to-Date', value: filteredDrivers.filter((d) => d.currentOutstandingBalance === 0).length, color: '#16A34A' },
    { name: 'Due Today', value: filteredDrivers.filter((d) => d.currentOutstandingBalance > 0 && d.overdueObligationsCount === 0).length, color: '#D97706' },
    { name: 'Overdue Arrears', value: filteredDrivers.filter((d) => d.overdueObligationsCount > 0).length, color: '#DC2626' },
    { name: 'Suspended', value: suspendedDrivers, color: '#64748B' },
  ];

  // Chart Data: Branch Collections
  const branchPerformanceData = branches.map((b) => {
    const branchDrivers = drivers.filter((d) => d.branchId === b.id);
    const branchPayments = payments.filter((p) => p.branchId === b.id && p.status === 'verified');
    const collections = branchPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = branchDrivers.reduce((sum, d) => sum + d.currentOutstandingBalance, 0);
    return {
      name: b.name.replace(' Branch', '').replace(' Industrial Hub', ''),
      collected: collections,
      outstanding: balance,
    };
  });

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Executive Operations Dashboard
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Consolidated financial oversight, collections performance and transport operations.
          </p>
        </div>

        {/* Global Filters */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-1 bg-white px-2 py-1 rounded-2 border">
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="form-select form-select-sm border-0 shadow-none"
              style={{ fontSize: '0.8rem', paddingLeft: 0, fontWeight: 600 }}
            >
              <option value="all">All Branches (Company-wide)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex align-items-center gap-1 bg-white px-2 py-1 rounded-2 border">
            <Calendar size={14} color="var(--text-muted)" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="form-select form-select-sm border-0 shadow-none"
              style={{ fontSize: '0.8rem', paddingLeft: 0, fontWeight: 600 }}
            >
              <option value="today">Today (24 Nov 2026)</option>
              <option value="week">Current Week (W47)</option>
              <option value="month">Current Month (Nov 2026)</option>
              <option value="year">Year to Date (2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Operational Alerts Bar (Actionable) */}
      {(pendingMoMoCount > 0 || pendingProxyCount > 0 || pendingSuspensionsCount > 0) && (
        <div
          className="kmtms-card mb-4"
          style={{
            backgroundColor: '#FFFBEB',
            borderColor: '#FDE68A',
            padding: '12px 16px',
          }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <AlertTriangle size={18} color="#D97706" />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400E' }}>
                Operational Attention Queue:
              </span>
            </div>

            <div className="d-flex align-items-center gap-3 flex-wrap" style={{ fontSize: '0.8rem' }}>
              {pendingMoMoCount > 0 && (
                <button
                  onClick={() => navigate('/admin/approvals')}
                  className="btn btn-sm btn-link p-0 text-decoration-none fw-bold"
                  style={{ color: '#B45309' }}
                >
                  {pendingMoMoCount} Manual MoMo Verification(s) →
                </button>
              )}
              {pendingProxyCount > 0 && (
                <button
                  onClick={() => navigate('/admin/approvals')}
                  className="btn btn-sm btn-link p-0 text-decoration-none fw-bold"
                  style={{ color: '#B45309' }}
                >
                  {pendingProxyCount} Proxy Payment Approval(s) →
                </button>
              )}
              {pendingSuspensionsCount > 0 && (
                <button
                  onClick={() => navigate('/admin/suspensions')}
                  className="btn btn-sm btn-link p-0 text-decoration-none fw-bold"
                  style={{ color: '#B45309' }}
                >
                  {pendingSuspensionsCount} Suspension Request(s) →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: FINANCIAL METRICS */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Financial & Remittance Summary
      </h2>
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Verified Collections"
            value={formatGHS(verifiedCollectionsTotal)}
            subtext="Credited & allocated funds"
            icon={<CheckCircle2 size={22} />}
            iconBg="var(--success-subtle)"
            iconColor="var(--success)"
            link="/admin/payments"
            badge={{ text: 'Verified', variant: 'success' }}
          />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Expected Remittance"
            value={formatGHS(expectedRemittancesTotal)}
            subtext="Configured contractual targets"
            icon={<DollarSign size={22} />}
            iconBg="var(--primary-subtle)"
            iconColor="var(--primary)"
            link="/admin/obligations"
          />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Total Outstanding"
            value={formatGHS(totalOutstandingBalance)}
            subtext="Current unpaid balance"
            icon={<Clock size={22} />}
            iconBg="var(--warning-subtle)"
            iconColor="var(--warning)"
            link="/admin/obligations"
            badge={{ text: 'Unpaid', variant: 'warning' }}
          />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Overdue Arrears"
            value={formatGHS(overdueBalance)}
            subtext="Past deadline & grace period"
            icon={<AlertOctagon size={22} />}
            iconBg="var(--danger-subtle)"
            iconColor="var(--danger)"
            link="/admin/obligations"
            badge={{ text: 'Action Required', variant: 'danger' }}
          />
        </div>
      </div>

      {/* SECTION 2: OPERATIONAL SUMMARY */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Fleet & Operations Register
      </h2>
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard
            title="Total Drivers"
            value={totalDrivers}
            subtext={`${activeDrivers} Active | ${suspendedDrivers} Suspended`}
            icon={<Users size={22} />}
            link="/admin/drivers"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Fleet Vehicles"
            value={totalVehicles}
            subtext={`${assignedVehicles} Assigned | ${availableVehicles} Available`}
            icon={<Truck size={22} />}
            iconBg="var(--secondary-subtle)"
            iconColor="var(--secondary)"
            link="/admin/vehicles"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Transport Officers"
            value={officers.length}
            subtext="Active fleet supervisors"
            icon={<UserCheck size={22} />}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
            link="/admin/officers"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Operating Branches"
            value={branches.length}
            subtext="Regional operational depots"
            icon={<Building2 size={22} />}
            iconBg="#FDF4FF"
            iconColor="#C026D3"
            link="/admin/branches"
          />
        </div>
      </div>

      {/* SECTION 3: VISUAL CHARTS */}
      <div className="row g-3 mb-4">
        {/* Collection Trend */}
        <div className="col-12 col-lg-8">
          <div className="kmtms-card h-100 p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  Collection Performance Trend
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Expected Remittance vs Actual Verified Collections (GHS)
                </span>
              </div>
              <span className="badge-kmtms-info">Weekly Tracking</span>
            </div>

            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collectionTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" fontSize={12} stroke="#64748B" />
                  <YAxis fontSize={12} stroke="#64748B" tickFormatter={(v) => `GH₵${v / 1000}k`} />
                  <Tooltip formatter={(value: number) => formatGHS(value)} />
                  <Legend />
                  <Bar dataKey="expected" fill="#94A3B8" name="Expected Remittance" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="verified" fill="#163A63" name="Verified Collections" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Driver Payment Distribution */}
        <div className="col-12 col-lg-4">
          <div className="kmtms-card h-100 p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  Driver Status Distribution
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Current compliance breakdown
                </span>
              </div>
            </div>

            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={driverStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {driverStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="d-flex flex-column gap-1 mt-2" style={{ fontSize: '0.78rem' }}>
              {driverStatusData.map((item, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <strong>{item.value} drivers</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: BRANCH PERFORMANCE & RECENT VERIFICATIONS */}
      <div className="row g-3">
        {/* Branch Collections */}
        <div className="col-12 col-lg-6">
          <div className="kmtms-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Branch Collections & Outstanding
              </h3>
              <button
                onClick={() => navigate('/admin/branches')}
                className="btn btn-sm btn-link p-0 text-decoration-none"
                style={{ fontSize: '0.8rem', color: 'var(--primary)' }}
              >
                View Branches →
              </button>
            </div>

            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchPerformanceData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" tickFormatter={(v) => `GH₵${v / 1000}k`} fontSize={11} stroke="#64748B" />
                  <YAxis type="category" dataKey="name" fontSize={11} stroke="#64748B" width={80} />
                  <Tooltip formatter={(value: number) => formatGHS(value)} />
                  <Legend />
                  <Bar dataKey="collected" fill="#0D9488" name="Collections" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="outstanding" fill="#E2E8F0" name="Outstanding" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-12 col-lg-6">
          <div className="kmtms-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Recent Verified Collections
              </h3>
              <button
                onClick={() => navigate('/admin/payments')}
                className="btn btn-sm btn-link p-0 text-decoration-none"
                style={{ fontSize: '0.8rem', color: 'var(--primary)' }}
              >
                All Payments →
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-sm align-middle" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr className="text-muted" style={{ borderBottom: '1px solid var(--border)' }}>
                    <th>Reference</th>
                    <th>Driver</th>
                    <th>Method</th>
                    <th className="text-end">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 4).map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.reference}</td>
                      <td>{p.driverName}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {p.method === 'momo_auto' ? 'MoMo Auto' : p.method === 'momo_manual' ? 'MoMo Manual' : 'Proxy'}
                        </span>
                      </td>
                      <td className="text-end fw-bold">{formatGHS(p.amount)}</td>
                      <td>
                        <span className={`badge-kmtms-${p.status === 'verified' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
