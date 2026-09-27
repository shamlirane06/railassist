import Icon from './Icon'

export default function ListRow({ icon, iconContent, tone = 'neutral', title, description, meta, onClick, chevron = true, emphasis }) {
  return (
    <button type="button" className={`list-row${emphasis ? ` list-row--${emphasis}` : ''}`} onClick={onClick}>
      {(icon || iconContent) && (
        <span className={`tile-icon tile-icon--${tone}`} aria-hidden="true">
          {iconContent ?? <Icon name={icon} size={22} />}
        </span>
      )}
      <span className="list-row__body">
        <span className="list-row__title">{title}</span>
        {description && <span className="list-row__desc">{description}</span>}
      </span>
      {meta && <span className="list-row__meta">{meta}</span>}
      {chevron && <Icon name="chevronRight" size={20} className="list-row__chevron" />}
    </button>
  )
}
