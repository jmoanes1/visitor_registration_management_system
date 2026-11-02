import { useRef } from 'react';
import { Camera, CreditCard, Trash2 } from 'lucide-react';

const MEGABYTE = 1024 * 1024;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// A captured photo is stored on the visitor record as a data URL, so the browser
// never has to upload it somewhere else first.
const PhotoInput = ({
  id,
  label,
  hint,
  value,
  onChange,
  variant = 'face',
  maxBytes = 2 * MEGABYTE,
}) => {
  const inputRef = useRef(null);
  const frame = variant === 'id-card' ? 'w-32 h-24' : 'w-24 h-24';
  const Icon = variant === 'id-card' ? CreditCard : Camera;
  const maxMegabytes = Math.round(maxBytes / MEGABYTE);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxBytes) {
      alert(`Please choose an image smaller than ${maxMegabytes}MB.`);
      event.target.value = '';
      return;
    }

    onChange(await readFileAsDataUrl(file));
    // Releasing the picker lets the same file be chosen again after the form resets;
    // without it, the change event would not fire and the photo would stay blank.
    event.target.value = '';
  };

  const handleClear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center justify-between space-y-3 text-center">
      <div>
        <p className="text-xs font-semibold text-[#1E293B]">{label}</p>
        <p className="text-[11px] text-[#64748B]">{hint}</p>
      </div>

      <div className="relative">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt={label}
              className={`${frame} rounded-lg object-cover border border-[#CBD5E1]`}
            />
            <button
              type="button"
              onClick={handleClear}
              aria-label={`Remove ${label}`}
              className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-[#DC2626] text-white"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`${frame} rounded-lg bg-white border border-dashed border-[#CBD5E1] hover:border-[#1E3A5F] flex flex-col items-center justify-center text-[#94A3B8] hover:text-[#1E3A5F] transition-colors`}
          >
            <Icon size={22} />
            <span className="text-[10px] font-semibold mt-1">Add Image</span>
          </button>
        )}
      </div>

      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full btn-secondary !h-9 text-xs"
      >
        {value ? 'Change Image' : `Upload ${label}`}
      </button>
    </div>
  );
};

export default PhotoInput;
