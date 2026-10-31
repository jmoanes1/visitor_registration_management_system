import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CheckCircle2,
  CalendarClock,
  Plus,
  ArrowRight,
  TrendingUp,
  Search,
  Home,
  Clock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService.js';
import { visitorService } from '../services/visitorService.js';
import { formatDateTime } from '../utils/formatDate.js';

const DashboardPage = () => {
  const [summary, setSummary] = useState({
    totalVisitorsToday: 0,
    currentlyCheckedIn: 0,
    completedVisitsToday: 0,
    expectedVisitors: 0,
  });
  const [activity, setActivity] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [summaryRes, activityRes, visitorsRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getActivity(),
        visitorService.getAll({ limit: 6 }),
      ]);
      setSummary(summaryRes.data.data);
      setActivity(activityRes.data.data || []);
      setRecentVisitors(visitorsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Checked In':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Checked In
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Completed
          </span>
        );
      case 'Expected':
      case 'Pre-Registered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Expected
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#CBD5E1] border-t-[#1E3A5F]" />
        <p className="text-xs text-[#64748B]">Loading dashboard data...</p>
      </div>
    );
  }

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Clean White Page Header Card */}
      <div className="card flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Overview • {currentDateFormatted}
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

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Total Expected
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A]">
              {summary.totalVisitorsToday}
            </span>
            <span className="text-xs text-[#64748B]">today</span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">Total visitor volume</p>
        </div>

        {/* Currently Checked In */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              On Premises
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A]">
              {summary.currentlyCheckedIn}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">Visitors on-site now</p>
        </div>

        {/* Completed Visits */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Completed Visits
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#334155] flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A]">
              {summary.completedVisitsToday}
            </span>
            <span className="text-xs text-[#64748B]">checked out</span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">Visits completed today</p>
        </div>

        {/* Expected Arrivals */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Pending Arrival
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <CalendarClock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A]">
              {summary.expectedVisitors}
            </span>
            <span className="text-xs text-[#64748B]">expected</span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">Awaiting reception</p>
        </div>
      </div>

      {/* Main Grid: Clean Table + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Visitors Table (2 Cols) */}
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
                  <th className="px-6 py-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] bg-white">
                {recentVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#94A3B8]">
                      No visitor entries logged yet.
                    </td>
                  </tr>
                ) : (
                  recentVisitors.map((v) => (
                    <tr key={v.id} className="hover:bg-[#F1F5F9] transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {v.profilePicture ? (
                            <img
                              src={v.profilePicture}
                              alt={v.firstName}
                              className="w-7 h-7 rounded-full object-cover border border-[#CBD5E1]"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#F1F5F9] text-[#1E293B] font-bold text-[11px] flex items-center justify-center border border-[#E2E8F0]">
                              {v.firstName?.charAt(0)}
                              {v.lastName?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-[#0F172A]">
                              {v.firstName} {v.lastName}
                            </p>
                            <p className="text-[10px] font-mono text-[#94A3B8]">{v.referenceNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-[#334155] font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <Home size={13} className="text-[#64748B]" />
                          {v.roomOrUnit || v.company || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-[#475569]">
                        {v.personToVisit}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        {getStatusBadge(v.status)}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-right">
                        <Link
                          to="/visitors"
                          className="text-[#64748B] hover:text-[#1E3A5F] p-1.5 rounded-lg hover:bg-[#F1F5F9] inline-flex items-center transition-colors"
                        >
                          <ChevronRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Stream (1 Col) */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#1E3A5F]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Activity Log</h2>
            </div>
            <span className="text-[11px] text-[#64748B]">Real-time</span>
          </div>

          {activity.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#94A3B8]">
              No actions recorded yet today.
            </div>
          ) : (
            <div className="space-y-4">
              {activity.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-semibold text-[#0F172A]">
                      {item.action || item.type || 'Event'}
                    </p>
                    <p className="text-[#64748B]">
                      {item.details || item.description || item.visitorName}
                    </p>
                    <p className="text-[10px] text-[#94A3B8] flex items-center gap-1 pt-0.5">
                      <Clock size={11} />
                      <span>{item.timestamp ? formatDateTime(item.timestamp) : 'Just now'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[#E2E8F0]">
            <Link
              to="/reports"
              className="w-full btn-secondary text-center justify-center !h-9"
            >
              <span>View Audit Reports</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
