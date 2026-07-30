'use client'

type Filter = {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

type SearchFilterBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  filters?: Filter[]
  resultCount?: number
}

export default function SearchFilterBar({ value, onChange, placeholder, filters = [], resultCount }: SearchFilterBarProps) {
  return (
    <section className="director-filter-bar" aria-label="Recherche et filtres">
      <div className="director-search-field">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input type="search" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
      </div>
      {filters.map(filter => (
        <label className="director-filter-select" key={filter.label}>
          <span>{filter.label}</span>
          <select value={filter.value} onChange={event => filter.onChange(event.target.value)}>
            {filter.options.map(option => <option key={option}>{option}</option>)}
          </select>
        </label>
      ))}
      {typeof resultCount === 'number' && <span className="director-filter-count">{resultCount} résultat{resultCount > 1 ? 's' : ''}</span>}
    </section>
  )
}
