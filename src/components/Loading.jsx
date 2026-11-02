const Loading = ({ label = 'Loading...', className = 'p-16' }) => (
  <div className={`${className} flex flex-col items-center justify-center space-y-3`}>
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#CBD5E1] border-t-[#1E3A5F]" />
    <p className="text-xs text-[#64748B]">{label}</p>
  </div>
);

export default Loading;
