const PageHeader = ({ title, description, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-[#0F172A]">{title}</h1>
      {description && <p className="text-xs text-[#64748B] mt-0.5">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2.5">{actions}</div>}
  </div>
);

export default PageHeader;
