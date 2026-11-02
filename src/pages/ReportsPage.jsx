import { useEffect, useState } from 'react';
import {
  Building2,
  Clock,
  Download,
  RefreshCw,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '@/components/EmptyState.jsx';
import { TextField } from '@/components/FormFields.jsx';
import Loading from '@/components/Loading.jsx';
import PageHeader from '@/components/PageHeader.jsx';
import StatCard from '@/components/StatCard.jsx';
import { reportsApi } from '@/services/reports.js';
import { apiErrorMessage } from '@/utils/apiError.js';
import { formatDateTime } from '@/utils/formatDate.js';

// Ordered so that adjacent slices contrast: the visit-type donut only ever has
// two entries, and navy next to blue was unreadable.
const PALETTE = ['#1E3A5F', '#0D9488', '#F59E0B', '#6366F1', '#64748B'];

const AUDIT_LOG_LIMIT = 10;

const TOOLTIP_STYLE = {
  backgroundColor: '#0F172A',
  color: '#FFF',
  borderRadius: '8px',
  border: 'none',
  fontSize: '11px',
};

// One list drives both the CSV header and its rows, so a new column cannot end up
// in the file without a value or the other way round.
const CSV_COLUMNS = [
  ['Reference', (visitor) => visitor.referenceNumber],
  ['First Name', (visitor) => visitor.firstName],
  ['Last Name', (visitor) => visitor.lastName],
  ['Room or Unit', (visitor) => visitor.roomOrUnit],
  ['Address', (visitor) => visitor.address],
  ['Email', (visitor) => visitor.email],
  ['Contact', (visitor) => visitor.contactNumber],
  ['Host', (visitor) => visitor.personToVisit],
  ['Purpose', (visitor) => visitor.purpose],
  ['Status', (visitor) => visitor.status],
  ['Check In', (visitor) => visitor.checkInTime],
  ['Check Out', (visitor) => visitor.checkOutTime],
];

const toCsvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const toChartEntries = (tally = {}) =>
  Object.entries(tally).map(([name, value]) => ({ name, value }));

const downloadCsv = (records) => {
  const rows = [
    CSV_COLUMNS.map(([title]) => toCsvCell(title)).join(','),
    ...records.map((record) => CSV_COLUMNS.map(([, read]) => toCsvCell(read(record))).join(',')),
  ];

  const url = URL.createObjectURL(new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');

  link.href = url;
  link.download = `visitor-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
};

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchReport = async (overrides = {}) => {
    const applied = { dateFrom, dateTo, ...overrides };

    setIsLoading(true);
    try {
      const response = await reportsApi.visitors({
        ...(applied.dateFrom && { dateFrom: applied.dateFrom }),
        ...(applied.dateTo && { dateTo: applied.dateTo }),
      });
      setReport(response.data.data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, 'Failed to load analytics'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const departmentData = toChartEntries(report?.byDepartment);
  const typeData = toChartEntries(report?.byType);
  const typeTotal = typeData.reduce((total, entry) => total + entry.value, 0);

  const destinationCount = new Set(
    (report?.records || []).map((visitor) => visitor.roomOrUnit).filter(Boolean)
  ).size;

  const shareOf = (value) => (typeTotal ? Math.round((value / typeTotal) * 100) : 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitor Reports & Analytics"
        description="Operational visitor volume, duration metrics, and traffic analysis."
        actions={
          <>
            <button
              type="button"
              onClick={() => fetchReport()}
              className="btn-secondary !w-10 !p-0 justify-center"
              title="Refresh"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => downloadCsv(report.records)}
              disabled={!report || report.total === 0}
              className="btn-primary"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </>
        }
      />

      <div className="card !p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            fetchReport();
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <TextField
            id="report-date-from"
            label="From Date"
            type="date"
            className="min-w-[160px]"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />

          <TextField
            id="report-date-to"
            label="To Date"
            type="date"
            className="min-w-[160px]"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />

          <button type="submit" className="btn-primary !h-9 whitespace-nowrap">
            Apply Filter
          </button>

          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                fetchReport({ dateFrom: '', dateTo: '' });
              }}
              className="btn-secondary !h-9 whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {isLoading ? (
        <Loading label="Loading analytics..." />
      ) : errorMessage ? (
        <EmptyState title="Analytics unavailable" description={errorMessage} />
      ) : !report || report.total === 0 ? (
        <EmptyState
          title="No data in this range"
          description="Adjust the dates, or register a visitor to populate the report."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Volume"
              value={report.total}
              unit="visitors"
              icon={Users}
            />
            <StatCard
              label="Avg Duration"
              value={report.averageVisitDurationMinutes || 0}
              unit="minutes"
              icon={Clock}
              tone="emerald"
            />
            <StatCard
              label="Active Units"
              value={destinationCount}
              unit="destinations"
              icon={Building2}
              tone="slate"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card space-y-4">
              <div className="pb-3 border-b border-[#E2E8F0]">
                <h3 className="text-sm font-bold text-[#0F172A]">Traffic by Department</h3>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="name"
                      fontSize={11}
                      angle={-20}
                      textAnchor="end"
                      tick={{ fill: '#64748B' }}
                    />
                    <YAxis allowDecimals={false} fontSize={11} tick={{ fill: '#64748B' }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
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
                        {typeData.map((entry, index) => (
                          <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
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
                          const entry = typeData.find((item) => item.name === name);
                          return entry ? `${name}  ${entry.value} (${shareOf(entry.value)}%)` : name;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

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
                  {report.records.slice(0, AUDIT_LOG_LIMIT).map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-[#F1F5F9]">
                      <td className="px-6 py-3 font-mono text-[11px] text-[#64748B]">
                        {visitor.referenceNumber}
                      </td>
                      <td className="px-6 py-3 font-semibold text-[#0F172A]">
                        {visitor.firstName} {visitor.lastName}
                      </td>
                      <td className="px-6 py-3 text-[#334155] font-semibold">
                        {visitor.roomOrUnit || '—'}
                      </td>
                      <td className="px-6 py-3 text-[#475569]">{visitor.personToVisit}</td>
                      <td className="px-6 py-3 text-[#64748B]">
                        {visitor.checkInTime ? formatDateTime(visitor.checkInTime) : '—'}
                      </td>
                      <td className="px-6 py-3 text-[#64748B]">
                        {visitor.checkOutTime ? formatDateTime(visitor.checkOutTime) : '—'}
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
