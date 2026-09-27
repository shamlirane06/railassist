import Icon from './Icon'

export default function Toggle({ icon, label, description, checked, onChange, disabled = false }) {
  return (
    <label className="toggle-row">
      {icon && (
        <span className="tile-icon tile-icon--blue" aria-hidden="true">
          <Icon name={icon} size={22} />
        </span>
      )}
      <span className="list-row__body">
        <span className="list-row__title">{label}</span>
        {description && <span className="list-row__desc">{description}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        className="toggle-row__input"
        checked={checked}
        disabled={disabled}
        onChange={event => onChange(event.target.checked)}
      />
      <span className="toggle-row__switch" aria-hidden="true" />
    </label>
  )
}
