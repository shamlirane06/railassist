import ListRow from './ListRow'
import { getLocationIcon, getLocationTone, getTypeLabel } from '../data/locationMeta'

export default function DestinationRow({ location, onClick, meta }) {
  return (
    <ListRow
      icon={getLocationIcon(location)}
      tone={getLocationTone(location)}
      title={location.name}
      description={location.accessible ? `${getTypeLabel(location)} · Step-free` : getTypeLabel(location)}
      meta={meta}
      onClick={onClick}
    />
  )
}
