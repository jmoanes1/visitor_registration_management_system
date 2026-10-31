import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Home,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
  ScanFace,
  MapPin,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { visitorService } from '../services/visitorService.js';
import { formatDateTime } from '../utils/formatDate.js';

const VisitorsPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const navigate = useNavigate();

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await visitorService.getAll(params);
      setVisitors(res.data.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load visitors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVisitors();
  };

  const handleCheckIn = async (id) => {
    setActionLoading(true);
    try {
      await visitorService.checkIn(id);
      await fetchVisitors();
      if (selectedVisitor?.id === id) {
        const updated = await visitorService.getById(id);
        setSelectedVisitor(updated.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (id) => {
    setActionLoading(true);
    try {
      await visitorService.checkOut(id);
      await fetchVisitors();
      if (selectedVisitor?.id === id) {
        const updated = await visitorService.getById(id);
        setSelectedVisitor(updated.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this visit registration?')) return;
    setActionLoading(true);
    try {
      await visitorService.cancel(id);
      await fetchVisitors();
      if (selectedVisitor?.id === id) {
        const updated = await visitorService.getById(id);
        setSelectedVisitor(updated.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (visitor) => {
    if (
      !window.confirm(
        `Permanently delete the registration for ${visitor.firstName} ${visitor.lastName} (${visitor.referenceNumber})?`
      )
    )
      return;

    setActionLoading(true);
    try {
      await visitorService.delete(visitor.id);
      if (selectedVisitor?.id === visitor.id) setSelectedVisitor(null);
      await fetchVisitors();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

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

  const totalRecords = visitors.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  const paginatedVisitors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return visitors.slice(start, start + pageSize);
  }, [visitors, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Visitor Management
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Overview and directory of all registered visitors, on-site status, and room destinations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchVisitors}
            className="btn-secondary !w-10 !p-0 justify-center"
            title="Refresh list"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link to="/visitors/register" className="btn-primary">
            <Plus size={15} />
            <span>Register Visitor</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card !p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by visitor name, room/unit, address, or badge reference..."
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="select-field !w-auto min-w-[140px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Checked In">Checked In</option>
              <option value="Expected">Expected</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <button type="submit" className="btn-primary whitespace-nowrap">
              Filter
            </button>

            {(search || statusFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setTimeout(fetchVisitors, 0);
                }}
                className="btn-secondary whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Container */}
      <div className="table-container">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#CBD5E1] border-t-[#1E3A5F]" />
            <p className="text-xs text-[#64748B]">Loading visitor records...</p>
          </div>
        ) : totalRecords === 0 ? (
          <div className="p-16 text-center space-y-2">
            <p className="text-sm font-semibold text-[#0F172A]">No visitors found</p>
            <p className="text-xs text-[#64748B]">
              No records match your filter criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white">
              <table className="min-w-full divide-y divide-[#E2E8F0] text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] text-left font-semibold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-3.5">Visitor</th>
                    <th className="px-6 py-3.5">Room or Unit</th>
                    <th className="px-6 py-3.5">Host & Purpose</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] bg-white">
                  {paginatedVisitors.map((v) => (
                    <tr key={v.id} className="hover:bg-[#F1F5F9] transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {v.profilePicture ? (
                            <img
                              src={v.profilePicture}
                              alt={v.firstName}
                              className="w-8 h-8 rounded-full object-cover border border-[#CBD5E1]"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#1E293B] font-bold text-[11px] flex items-center justify-center border border-[#E2E8F0]">
                              {v.firstName?.charAt(0)}
                              {v.lastName?.charAt(0)}
                            </div>
                          )}

                          <div>
                            <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                              <span>{v.firstName} {v.lastName}</span>
                              {v.faceVerified && (
                                <span className="text-emerald-600 text-[10px] font-bold" title="Face verified">
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-[#94A3B8]">
                              {v.referenceNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-[#334155] font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <Home size={13} className="text-[#64748B]" />
                          {v.roomOrUnit || v.company || '—'}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="text-[#0F172A] font-medium">{v.personToVisit}</div>
                        <div className="text-[11px] text-[#64748B]">{v.purpose || 'Visitor'}</div>
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap">
                        {getStatusBadge(v.status)}
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-xs text-[#64748B]">
                        {v.checkInTime ? (
                          <div>In: {formatDateTime(v.checkInTime)}</div>
                        ) : (
                          <div>Reg: {formatDateTime(v.registrationTimestamp)}</div>
                        )}
                        {v.checkOutTime && <div>Out: {formatDateTime(v.checkOutTime)}</div>}
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedVisitor(v)}
                          className="p-1.5 text-[#64748B] hover:text-[#1E3A5F] rounded-lg hover:bg-[#F1F5F9]"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>

                        {v.status !== 'Checked In' && v.status !== 'Completed' && v.status !== 'Cancelled' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleCheckIn(v.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Check In
                          </button>
                        )}

                        {v.status === 'Checked In' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleCheckOut(v.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#1E3A5F] hover:bg-[#274C77] text-white"
                          >
                            Check Out
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/visitors/${v.id}/edit`)}
                          className="p-1.5 text-[#64748B] hover:text-[#1E3A5F] rounded-lg hover:bg-[#F1F5F9]"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          disabled={actionLoading}
                          onClick={() => handleDelete(v)}
                          className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg hover:bg-[#F1F5F9] disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-3.5 bg-white border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
              <div>
                Showing <span className="font-semibold text-[#0F172A]">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-semibold text-[#0F172A]">{Math.min(currentPage * pageSize, totalRecords)}</span> of{' '}
                <span className="font-semibold text-[#0F172A]">{totalRecords}</span> visitors
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold ${
                      currentPage === pageNum
                        ? 'bg-[#1E3A5F] text-white'
                        : 'text-[#475569] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="bg-white rounded-xl shadow-card max-w-lg w-full border border-[#E2E8F0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {selectedVisitor.firstName} {selectedVisitor.lastName}
                </h3>
                <p className="text-xs text-[#64748B]">Ref: {selectedVisitor.referenceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="p-1 text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-[#64748B]">Room or Unit</p>
                  <p className="font-bold text-[#0F172A] text-sm mt-0.5">
                    {selectedVisitor.roomOrUnit || selectedVisitor.company || '—'}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[#64748B]">Purpose</p>
                  <p className="font-medium text-[#0F172A] mt-0.5">{selectedVisitor.purpose || 'Visitor'}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#64748B]">Host Person</p>
                  <p className="font-medium text-[#0F172A] mt-0.5">{selectedVisitor.personToVisit}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#64748B]">Contact Number</p>
                  <p className="font-medium text-[#0F172A] mt-0.5">{selectedVisitor.contactNumber || '—'}</p>
                </div>
                {selectedVisitor.address && (
                  <div className="col-span-2">
                    <p className="font-semibold text-[#64748B]">Address</p>
                    <p className="font-medium text-[#0F172A] mt-0.5">{selectedVisitor.address}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/visitors/${selectedVisitor.id}/edit`)}
                  className="btn-secondary !h-9"
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleDelete(selectedVisitor)}
                  className="btn-danger !h-9"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="btn-secondary !h-9"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorsPage;
