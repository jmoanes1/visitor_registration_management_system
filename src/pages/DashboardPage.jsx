import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Plus,
  Search,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import EmptyState from '@/components/EmptyState.jsx';
import Loading from '@/components/Loading.jsx';
import Avatar from '@/components/Avatar.jsx';
import StatCard from '@/components/StatCard.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import { dashboardApi } from '@/services/dashboard.js';
import { visitorsApi } from '@/services/visitors.js';
import { formatDate } from '@/utils/formatDate.js';
import { apiErrorMessage } from '@/utils/apiError.js';

const RECENT_VISITOR_LIMIT = 6;

const emptySummary = {
  totalVisitorsToday: 0,
  currentlyCheckedIn: 0,
  completedVisitsToday: 0,
  expectedVisitors: 0,
};

const DashboardPage = () => {
  const [summary, setSummary] = useState(emptySummary);
  const [activity, setActivity] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isStale = false;

    const load = async () => {
      try {
        const [summaryResponse, activityResponse, visitorsResponse] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.activity(),
          visitorsApi.list({ limit: RECENT_VISITOR_LIMIT }),
        ]);

        if (isStale) return;

        setSummary(summaryResponse.data.data);
        setActivity(activityResponse.data.data || []);
        setRecentVisitors(visitorsResponse.data.data || []);
        setErrorMessage('');
      } catch (error) {
        if (!isStale) setErrorMessage(apiErrorMessage(error, 'Failed to load dashboard data'));
      } finally {
        if (!isStale) setIsLoading(false);
      }
    };

    load();
    return () => {
      isStale = true;
    };
  }, []);

  if (isLoading) return <Loading label="Loading dashboard data..." className="min-h-[360px]" />;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      <div className="card flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Overview • {today}
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Reception Operations Dashboard
          </h1>
          <p className="text-xs text-[#64748B]">
            Real-time tracking of visitor traffic, active on-site passes, and check-in history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/visitors" className="btn-secondary">
            <Search size={15} />
            <span>Search Records</span>
          </Link>
          <Link to="/visitors/register" className="btn-primary">
            <Plus size={15} />
            <span>Register Visitor</span>
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="card !p-3 text-xs text-rose-700 bg-rose-50 border-rose-200"
        >
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Expected"
          value={summary.totalVisitorsToday}
          unit="today"
          description="Total visitor volume"
          icon={Users}
        />
        <StatCard
          label="On Premises"
          value={summary.currentlyCheckedIn}
          badge={summary.currentlyCheckedIn > 0 ? 'Active' : undefined}
          unit="on site"
          description="Visitors on-site now"
          icon={UserCheck}
          tone="emerald"
        />
        <StatCard
          label="Completed Visits"
          value={summary.completedVisitsToday}
          unit="checked out"
          description="Visits completed today"
          icon={CheckCircle2}
          tone="slate"
        />
        <StatCard
          label="Pending Arrival"
          value={summary.expectedVisitors}
          unit="expected"
          description="Awaiting reception"
          icon={CalendarClock}
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 table-container">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">Recent Registrations</h2>
              <p className="text-xs text-[#64748B]">Latest visitors registered into the system</p>
            </div>
            <Link
              to="/visitors"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] hover:text-[#274C77]"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto bg-white">
            <table className="min-w-full divide-y divide-[#E2E8F0] text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] text-left font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="px-6 py-3">Visitor</th>
                  <th className="px-6 py-3">Room / Unit</th>
                  <th className="px-6 py-3">Host Person</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] bg-white">
                {recentVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#94A3B8]">
                      No visitor entries logged yet.
                    </td>
                  </tr>
                ) : (
                  recentVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-[#F1F5F9] transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            size="sm"
                            src={visitor.profilePicture}
                            firstName={visitor.firstName}
                            lastName={visitor.lastName}
                          />
                          <div>
                            <p className="font-semibold text-[#0F172A]">
                              {visitor.firstName} {visitor.lastName}
                            </p>
                            <p className="text-[10px] font-mono text-[#94A3B8]">
                              {visitor.referenceNumber}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-[#334155] font-semibold">
                        {visitor.roomOrUnit || '—'}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-[#475569]">
                        {visitor.personToVisit}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <StatusBadge status={visitor.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#1E3A5F]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Registrations</h2>
            </div>
            <span className="text-[11px] text-[#64748B]">Last 7 days</span>
          </div>

          {activity.length === 0 ? (
            <EmptyState title="No activity yet" description="Nothing has been recorded today." />
          ) : (
            <ul className="space-y-3">
              {[...activity].reverse().map((day) => (
                <li key={day.date} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-[#475569]">{formatDate(day.date)}</span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 rounded-full bg-[#1E3A5F]" style={{ width: `${Math.min(day.count * 12, 96)}px` }} />
                    <span className="font-semibold text-[#0F172A] w-6 text-right">{day.count}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-2 border-t border-[#E2E8F0]">
            <Link to="/reports" className="w-full btn-secondary text-center justify-center !h-9">
              <span>View Audit Reports</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
