import Icon from './Icon'

export default function ScreenHeader({ title, subtitle, onBack, backLabel = 'Back', actions, large = false, eyebrow }) {
  return (
    <header className={`app-header${large ? ' app-header--large' : ''}`}>
      {onBack && (
        <button type="button" className="icon-btn" onClick={onBack} aria-label={backLabel}>
          <Icon name="chevronLeft" size={22} />
        </button>
      )}
      <div className="app-header__text">
        {eyebrow && <p className="app-header__eyebrow">{eyebrow}</p>}
        <h1 className="app-header__title">{title}</h1>
        {subtitle && <p className="app-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="app-header__actions">{actions}</div>}
    </header>
  )
}
