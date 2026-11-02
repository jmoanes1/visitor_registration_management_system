const EmptyState = ({ title, description }) => (
  <div className="p-16 text-center space-y-2">
    <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
    {description && <p className="text-xs text-[#64748B]">{description}</p>}
  </div>
);

export default EmptyState;
