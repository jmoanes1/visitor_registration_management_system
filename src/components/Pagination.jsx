import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_CHOICES = [5, 10, 25, 50];

const Pagination = ({ page, pageSize, total, onPageChange, onPageSizeChange }) => {
  if (total === 0) return null;

  const totalPages = Math.ceil(total / pageSize);
  const firstRow = (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, total);

  return (
    <div className="px-6 py-3.5 bg-white border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-semibold text-[#0F172A]">{firstRow}</span> to{' '}
          <span className="font-semibold text-[#0F172A]">{lastRow}</span> of{' '}
          <span className="font-semibold text-[#0F172A]">{total}</span>
        </span>

        {onPageSizeChange && (
          <label className="flex items-center gap-1.5">
            <span>Per page</span>
            <select
              className="rounded-lg border border-[#CBD5E1] bg-white px-1.5 py-1 text-xs text-[#475569]"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              aria-label="Records shown per page"
            >
              {PAGE_SIZE_CHOICES.map((choice) => (
                <option key={choice} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onPageChange(number)}
            aria-current={page === number ? 'page' : undefined}
            className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold ${
              page === number ? 'bg-[#1E3A5F] text-white' : 'text-[#475569] hover:bg-[#F1F5F9]'
            }`}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
