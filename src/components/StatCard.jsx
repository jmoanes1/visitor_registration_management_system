const TONES = {
  navy: 'bg-[#EFF6FF] text-[#1E3A5F]',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  slate: 'bg-slate-100 text-[#334155]',
};

const StatCard = ({ label, value, unit, description, icon: Icon, tone = 'navy', badge }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
        {label}
      </span>
      {Icon && (
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${TONES[tone] || TONES.navy}`}
        >
          <Icon size={16} />
        </div>
      )}
    </div>

    <div className="mt-3 flex items-baseline gap-2">
      <span className="text-2xl font-bold text-[#0F172A]">{value}</span>
      {badge ? (
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          {badge}
        </span>
      ) : (
        unit && <span className="text-xs text-[#64748B]">{unit}</span>
      )}
    </div>

    {description && <p className="text-xs text-[#64748B] mt-1">{description}</p>}
  </div>
);

export default StatCard;
