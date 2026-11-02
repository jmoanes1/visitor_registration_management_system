import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Home, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import Avatar from '@/components/Avatar.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import { SelectField, TextField } from '@/components/FormFields.jsx';
import Loading from '@/components/Loading.jsx';
import Modal from '@/components/Modal.jsx';
import PageHeader from '@/components/PageHeader.jsx';
import Pagination from '@/components/Pagination.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import { visitorsApi } from '@/services/visitors.js';
import { VISITOR_STATUSES } from '@shared/visitorStatuses.js';
import { apiErrorMessage } from '@/utils/apiError.js';
import { formatDateTime } from '@/utils/formatDate.js';

// Filtering happens in the API and paging happens here, so one large page of
// matches is fetched and the local pager walks through it.
const FETCH_LIMIT = 100;

const Detail = ({ label, value }) => (
  <div>
    <p className="font-semibold text-[#64748B]">{label}</p>
    <p className="font-medium text-[#0F172A] mt-0.5">{value || '—'}</p>
  </div>
);

const VisitorsPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  const fetchVisitors = async (overrides = {}) => {
    const applied = { search, statusFilter, ...overrides };

    setIsLoading(true);
    try {
      const response = await visitorsApi.list({
        limit: FETCH_LIMIT,
        ...(applied.search && { search: applied.search }),
        ...(applied.statusFilter && { status: applied.statusFilter }),
      });
      const records = response.data.data || [];
      setVisitors(records);
      return records;
    } catch (error) {
      alert(apiErrorMessage(error, 'Failed to load visitors'));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchVisitors();
  }, [statusFilter]);

  // Runs a check-in/out, cancel or delete, then re-reads the list so the table
  // and an open dialog show the same status.
  const runAction = async (visitorId, action) => {
    setIsSaving(true);
    try {
      await action();
      const records = await fetchVisitors();
      setSelectedVisitor((current) => {
        if (!current || current.id !== visitorId) return current;
        return records.find((visitor) => visitor.id === visitorId) || null;
      });
    } catch (error) {
      alert(apiErrorMessage(error, 'That action could not be completed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (visitor) => {
    if (
      !window.confirm(
        `Permanently delete the registration for ${visitor.firstName} ${visitor.lastName} (${visitor.referenceNumber})?`
      )
    ) {
      return;
    }

    runAction(visitor.id, () => visitorsApi.remove(visitor.id));
  };

  const totalPages = Math.ceil(visitors.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);

  const visibleVisitors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return visitors.slice(start, start + pageSize);
  }, [visitors, currentPage, pageSize]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    fetchVisitors();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitor Management"
        description="Overview and directory of all registered visitors, on-site status, and room destinations."
        actions={
          <>
            <button
              type="button"
              onClick={() => fetchVisitors()}
              className="btn-secondary !w-10 !p-0 justify-center"
              title="Refresh list"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <Link to="/visitors/register" className="btn-primary">
              <Plus size={15} />
              <span>Register Visitor</span>
            </Link>
          </>
        }
      />

      <div className="card !p-4">
        <form onSubmit={applyFilters} className="flex flex-col md:flex-row gap-3">
          <TextField
            id="visitor-search"
            label="Search"
            className="flex-1"
            placeholder="Name, room or unit, address, or badge reference"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="flex items-end gap-2">
            <SelectField
              id="visitor-status-filter"
              label="Status"
              className="min-w-[150px]"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All Statuses</option>
              {VISITOR_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </SelectField>

            <button type="submit" className="btn-primary whitespace-nowrap">
              Filter
            </button>

            {(search || statusFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setPage(1);
                  fetchVisitors({ search: '', statusFilter: '' });
                }}
                className="btn-secondary whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-container">
        {isLoading ? (
          <Loading label="Loading visitor records..." />
        ) : visitors.length === 0 ? (
          <EmptyState title="No visitors found" description="No records match your filter criteria." />
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
                  {visibleVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-[#F1F5F9] transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={visitor.profilePicture}
                            firstName={visitor.firstName}
                            lastName={visitor.lastName}
                          />
                          <div>
                            <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                              <span>
                                {visitor.firstName} {visitor.lastName}
                              </span>
                              {visitor.faceVerified && (
                                <span
                                  className="text-emerald-600 text-[10px] font-bold"
                                  title={`Face verified at ${visitor.faceMatchScore}%`}
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-[#94A3B8]">
                              {visitor.referenceNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-[#334155] font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <Home size={13} className="text-[#64748B]" />
                          {visitor.roomOrUnit || '—'}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="text-[#0F172A] font-medium">{visitor.personToVisit}</div>
                        <div className="text-[11px] text-[#64748B]">
                          {visitor.purpose || 'Visitor'}
                        </div>
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <StatusBadge status={visitor.status} />
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-xs text-[#64748B]">
                        <div>
                          {visitor.checkInTime
                            ? `In: ${formatDateTime(visitor.checkInTime)}`
                            : `Reg: ${formatDateTime(visitor.registrationTimestamp)}`}
                        </div>
                        {visitor.checkOutTime && (
                          <div>Out: {formatDateTime(visitor.checkOutTime)}</div>
                        )}
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedVisitor(visitor)}
                          className="p-1.5 text-[#64748B] hover:text-[#1E3A5F] rounded-lg hover:bg-[#F1F5F9]"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>

                        {visitor.status !== 'Checked In' && visitor.status !== 'Cancelled' && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() =>
                              runAction(visitor.id, () => visitorsApi.checkIn(visitor.id))
                            }
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40"
                          >
                            Check In
                          </button>
                        )}

                        {visitor.status === 'Checked In' && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() =>
                              runAction(visitor.id, () => visitorsApi.checkOut(visitor.id))
                            }
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#1E3A5F] hover:bg-[#274C77] text-white disabled:opacity-40"
                          >
                            Check Out
                          </button>
                        )}

                        {(visitor.status === 'Registered' || visitor.status === 'Expected') && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => {
                              if (!window.confirm('Cancel this visit registration?')) return;
                              runAction(visitor.id, () => visitorsApi.cancel(visitor.id));
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40"
                            title="Cancel this registration"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => navigate(`/visitors/${visitor.id}/edit`)}
                          className="p-1.5 text-[#64748B] hover:text-[#1E3A5F] rounded-lg hover:bg-[#F1F5F9]"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleDelete(visitor)}
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

            <Pagination
              page={currentPage}
              pageSize={pageSize}
              total={visitors.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      {selectedVisitor && (
        <Modal
          title={`${selectedVisitor.firstName} ${selectedVisitor.lastName}`}
          subtitle={`Ref: ${selectedVisitor.referenceNumber}`}
          onClose={() => setSelectedVisitor(null)}
          footer={
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/visitors/${selectedVisitor.id}/edit`)}
                  className="btn-secondary !h-9"
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleDelete(selectedVisitor)}
                  className="btn-danger !h-9"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="btn-secondary !h-9"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between gap-4">
              <StatusBadge status={selectedVisitor.status} />
              {selectedVisitor.visitorType && (
                <span className="text-[11px] text-[#64748B]">{selectedVisitor.visitorType}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Detail label="Room or Unit" value={selectedVisitor.roomOrUnit} />
              <Detail label="Purpose" value={selectedVisitor.purpose || 'Visitor'} />
              <Detail label="Host Person" value={selectedVisitor.personToVisit} />
              <Detail label="Contact Number" value={selectedVisitor.contactNumber} />
              <Detail label="Email" value={selectedVisitor.email} />
              <Detail label="Department" value={selectedVisitor.department} />
              {selectedVisitor.address && (
                <div className="col-span-2">
                  <Detail label="Address" value={selectedVisitor.address} />
                </div>
              )}
              {selectedVisitor.notes && (
                <div className="col-span-2">
                  <Detail label="Notes" value={selectedVisitor.notes} />
                </div>
              )}
              <div className="col-span-2">
                <Detail
                  label="Registered"
                  value={formatDateTime(selectedVisitor.registrationTimestamp)}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VisitorsPage;
