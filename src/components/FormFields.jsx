// Form fields share one layout so labels, required markers and error messages
// never drift apart between the registration, staff and filter screens.
const Field = ({ id, label, required, error, hint, className = '', children }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-xs font-semibold text-[#1E293B] mb-1.5">
      {label}
      {required && <span className="text-[#DC2626]"> *</span>}
    </label>
    {children}
    {error ? (
      <p className="text-[11px] text-[#DC2626] mt-1">{error}</p>
    ) : (
      hint && <p className="text-[11px] text-[#64748B] mt-1">{hint}</p>
    )}
  </div>
);

const invalidClass = (error) => (error ? '!border-[#DC2626]' : '');

export const TextField = ({
  id,
  label,
  required,
  error,
  hint,
  className = '',
  type = 'text',
  icon: Icon,
  trailing,
  ...inputProps
}) => (
  <Field id={id} label={label} required={required} error={error} hint={hint} className={className}>
    <div className={Icon || trailing ? 'relative' : undefined}>
      {Icon && (
        <Icon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          aria-hidden="true"
        />
      )}
      <input
        id={id}
        type={type}
        aria-invalid={Boolean(error)}
        className={`input-field ${Icon ? 'pl-10' : ''} ${trailing ? 'pr-10' : ''} ${invalidClass(error)} ${
          inputProps.className || ''
        }`}
        {...inputProps}
      />
      {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  </Field>
);

export const SelectField = ({
  id,
  label,
  required,
  error,
  hint,
  className = '',
  children,
  ...selectProps
}) => (
  <Field id={id} label={label} required={required} error={error} hint={hint} className={className}>
    <select
      id={id}
      aria-invalid={Boolean(error)}
      className={`select-field ${invalidClass(error)} ${selectProps.className || ''}`}
      {...selectProps}
    >
      {children}
    </select>
  </Field>
);

export const TextAreaField = ({
  id,
  label,
  required,
  error,
  hint,
  className = '',
  rows = 2,
  ...textAreaProps
}) => (
  <Field id={id} label={label} required={required} error={error} hint={hint} className={className}>
    <textarea
      id={id}
      rows={rows}
      aria-invalid={Boolean(error)}
      className={`input-field !h-auto !py-2.5 ${invalidClass(error)} ${
        textAreaProps.className || ''
      }`}
      {...textAreaProps}
    />
  </Field>
);

export default Field;
