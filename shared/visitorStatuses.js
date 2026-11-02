// Single source of truth for the visitor workflow, shared by the API and the UI
// so a status can never be spelled differently on one side than the other.

export const VISITOR_STATUSES = [
  'Registered',
  'Expected',
  'Checked In',
  'Checked Out',
  'Cancelled',
];

export const VISITOR_TYPES = ['Walk-in', 'Appointment'];

// Which colour pill each status is drawn in; see src/components/Badge.jsx.
export const STATUS_TONES = {
  Registered: 'slate',
  Expected: 'amber',
  'Checked In': 'emerald',
  'Checked Out': 'sky',
  Cancelled: 'rose',
};
