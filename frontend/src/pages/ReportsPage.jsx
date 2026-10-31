import { useEffect, useState } from 'react';
import {
  Download,
  Users,
  Clock,
  Building2,
  RefreshCw,
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import { reportsService } from '../services/reportsService.js';
import { formatDateTime } from '../utils/formatDate.js';

// Ordered so that adjacent slices contrast: the visit-type donut only ever has
// two entries, and navy next to blue was unreadable.
const PALETTE = ['#1E3A5F', '#0D9488', '#F59E0B', '#6366F1', '#64748B'];

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await reportsService.getVisitorsReport(params);
      setReport(res.data.data);
    } catch (err) {
      console.error('Failed to load report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportCSV = () => {
    if (!report || !report.records || report.records.length === 0) {
      alert('No records available to export');
      return;
    }

    const headers = [
      'Reference',
      'First Name',
      'Last Name',
      'Room or Unit',
      'Address',
      'Email',
      'Contact',
      'Host',
      'Purpose',
      'Status',
      'Check In',
      'Check Out',
    ];

    const rows = report.records.map((r) => [
      `"${r.referenceNumber || ''}"`,
      `"${r.firstName || ''}"`,
      `"${r.lastName || ''}"`,
      `"${r.roomOrUnit || r.company || ''}"`,
      `"${r.address || ''}"`,
      `"${r.email || ''}"`,
      `"${r.contactNumber || ''}"`,
      `"${r.personToVisit || ''}"`,
      `"${r.purpose || ''}"`,
      `"${r.status || ''}"`,
      `"${r.checkInTime || ''}"`,
      `"${r.checkOutTime || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `visitors_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const departmentData = report?.byDepartment
    ? Object.entries(report.byDepartment).map(([name, value]) => ({ name, value }))
    : [];

  const typeData = report?.byType
    ? Object.entries(report.byType).map(([name, value]) => ({ name, value }))
    : [];

  const typeTotal = typeData.reduce((sum, t) => sum + t.value, 0);
  const shareOf = (value) => (typeTotal ? Math.round((value / typeTotal) * 100) : 0);

  const tooltipStyle = {
    backgroundColor: '#0F172A',
    color: '#FFF',
    borderRadius: '8px',
    border: 'none',
    fontSize: '11px',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Visitor Reports & Analytics
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Operational visitor volume, duration metrics, and traffic analysis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReport}
            className="btn-secondary !w-10 !p-0 justify-center"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!report || report.total === 0}
            className="btn-primary"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card !p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchReport();
          }}
          className="flex flex-wrap items-end gap-3 text-xs"
        >
          <div>
            <label className="block font-semibold text-[#1E293B] mb-1">
              From Date
            </label>
            <input
              type="date"
              className="input-field !h-9 text-xs"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1E293B] mb-1">
              To Date
            </label>
            <input
              type="date"
              className="input-field !h-9 text-xs"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary !h-9 whitespace-nowrap">
            Apply Filter
          </button>

          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setTimeout(fetchReport, 0);
              }}
              className="btn-secondary !h-9 whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#CBD5E1] border-t-[#1E3A5F]" />
          <p className="text-xs text-[#64748B]">Loading analytics...</p>
        </div>
      ) : !report ? (
        <div className="p-12 text-center text-xs text-[#94A3B8]">
          No data available.
        </div>
      ) : (
        <>
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Total Volume
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#0F172A]">{report.total}</span>
                <span className="text-xs text-[#64748B]">visitors</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Avg Duration
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#0F172A]">
                  {report.averageVisitDurationMinutes || 0}
                </span>
                <span className="text-xs text-[#64748B]">minutes</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Active Units
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#334155] flex items-center justify-center">
                  <Building2 size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#0F172A]">
                  {Object.keys(report.byDepartment || {}).length}
                </span>
                <span className="text-xs text-[#64748B]">destinations</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card space-y-4">
              <div className="pb-3 border-b border-[#E2E8F0]">
                <h3 className="text-sm font-bold text-[#0F172A]">Traffic by Department</h3>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" fontSize={11} angle={-20} textAnchor="end" tick={{ fill: '#64748B' }} />
                    <YAxis allowDecimals={false} fontSize={11} tick={{ fill: '#64748B' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card space-y-4">
              <div className="pb-3 border-b border-[#E2E8F0]">
                <h3 className="text-sm font-bold text-[#0F172A]">Visit Type Distribution</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {typeTotal
                    ? `${typeTotal} visitor${typeTotal === 1 ? '' : 's'} across ${typeData.length} visit type${typeData.length === 1 ? '' : 's'}`
                    : 'No visits recorded'}
                </p>
              </div>
              {typeData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-[#94A3B8]">
                  No visit types to chart for this range.
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="40%"
                        cy="50%"
                        innerRadius={54}
                        outerRadius={88}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      >
                        {typeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value, name) => [
                          `${value} visitor${value === 1 ? '' : 's'} · ${shareOf(value)}%`,
                          name,
                        ]}
                      />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        iconSize={9}
                        wrapperStyle={{ fontSize: '11px', color: '#475569', lineHeight: '20px' }}
                        formatter={(name) => {
                          const item = typeData.find((t) => t.name === name);
                          return item
                            ? `${name}  ${item.value} (${shareOf(item.value)}%)`
                            : name;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Log Table */}
          <div className="table-container">
            <div className="px-6 py-4 border-b border-[#E2E8F0] bg-white">
              <h3 className="text-sm font-bold text-[#0F172A]">Audit Log Records</h3>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="min-w-full divide-y divide-[#E2E8F0] text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] text-left font-semibold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Visitor</th>
                    <th className="px-6 py-3">Room / Unit</th>
                    <th className="px-6 py-3">Host Person</th>
                    <th className="px-6 py-3">Check In</th>
                    <th className="px-6 py-3">Check Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] bg-white">
                  {report.records?.slice(0, 10).map((r) => (
                    <tr key={r.id} className="hover:bg-[#F1F5F9]">
                      <td className="px-6 py-3 font-mono text-[11px] text-[#64748B]">
                        {r.referenceNumber}
                      </td>
                      <td className="px-6 py-3 font-semibold text-[#0F172A]">
                        {r.firstName} {r.lastName}
                      </td>
                      <td className="px-6 py-3 text-[#334155] font-semibold">
                        {r.roomOrUnit || r.company || '—'}
                      </td>
                      <td className="px-6 py-3 text-[#475569]">
                        {r.personToVisit}
                      </td>
                      <td className="px-6 py-3 text-[#64748B]">
                        {r.checkInTime ? formatDateTime(r.checkInTime) : '—'}
                      </td>
                      <td className="px-6 py-3 text-[#64748B]">
                        {r.checkOutTime ? formatDateTime(r.checkOutTime) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
