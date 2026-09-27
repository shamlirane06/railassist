export default function SummaryList({ items }) {
  return (
    <dl className="summary-list">
      {items.filter(Boolean).map(item => (
        <div className="summary-list__row" key={item.label}>
          <dt>{item.label}</dt>
          <dd className={item.tone ? `summary-list__value--${item.tone}` : undefined}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
