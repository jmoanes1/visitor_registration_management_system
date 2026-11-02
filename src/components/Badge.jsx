const TONES = {
  navy: { badge: 'bg-[#EFF6FF] text-[#1E3A5F] border-[#BFDBFE]', dot: 'bg-[#1E3A5F]' },
  emerald: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600' },
  amber: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  sky: { badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-600' },
  rose: { badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  slate: { badge: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
};

// The single pill style used for statuses, roles and account state.
const Badge = ({ tone = 'slate', dot = false, icon: Icon, children }) => {
  const style = TONES[tone] || TONES.slate;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.badge}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {Icon && <Icon size={11} />}
      {children}
    </span>
  );
};

export default Badge;
