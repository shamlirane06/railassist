// Presentation metadata for station location types (labels, icons, tones).
export const TYPE_LABELS = {
  platform: 'Platform',
  'toilet-accessible': 'Accessible toilet',
  toilet: 'Toilet',
  exit: 'Exit',
  entrance: 'Main entrance',
  elevator: 'Lift',
  help: 'Help desk',
  facility: 'Facility',
  information: 'Information desk',
  escalator: 'Escalator',
  stairs: 'Stairs',
}

const TYPE_ICONS = {
  platform: 'train',
  'toilet-accessible': 'accessibility',
  toilet: 'toilet',
  exit: 'exit',
  entrance: 'exit',
  elevator: 'lift',
  help: 'help',
  information: 'info',
  escalator: 'escalator',
  stairs: 'stairs',
  facility: 'building',
}

const ID_ICONS = {
  'ticket-counter': 'ticket',
  'waiting-area': 'seat',
  'staff-point': 'shield',
}

const TYPE_TONES = {
  platform: 'red',
  'toilet-accessible': 'blue',
  toilet: 'blue',
  exit: 'navy',
  entrance: 'navy',
  elevator: 'blue',
  escalator: 'blue',
  stairs: 'neutral',
  help: 'green',
  information: 'green',
  facility: 'neutral',
}

export const getTypeLabel = location => TYPE_LABELS[location?.type] || location?.type || ''
export const getLocationIcon = location => ID_ICONS[location?.id] || TYPE_ICONS[location?.type] || 'pin'
export const getLocationTone = location => TYPE_TONES[location?.type] || 'neutral'
