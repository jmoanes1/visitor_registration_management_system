// A visitor or staff photo, falling back to initials when no image was captured.
const Avatar = ({ src, firstName, lastName, name, size = 'md' }) => {
  const sizes = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-[11px]',
  };

  const initials = src
    ? ''
    : `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}` ||
      name?.slice(0, 2) ||
      '—';

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName || ''} ${lastName || name || ''}`.trim()}
        className={`${sizes[size]} rounded-full object-cover border border-[#CBD5E1]`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-[#F1F5F9] text-[#1E293B] font-bold flex items-center justify-center border border-[#E2E8F0] uppercase`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
};

export default Avatar;
