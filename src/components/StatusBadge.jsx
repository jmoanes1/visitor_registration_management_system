import Badge from '@/components/Badge.jsx';
import { STATUS_TONES } from '@shared/visitorStatuses.js';

// The one place a visitor status becomes a pill, so the dashboard, directory and
// reports always read the same.
const StatusBadge = ({ status }) => (
  <Badge tone={STATUS_TONES[status] || 'slate'} dot>
    {status || 'Unknown'}
  </Badge>
);

export default StatusBadge;
