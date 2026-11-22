import { Icon } from './Icons'

interface TablePaginationProps {
  currentPage: number
  lastPage: number
  total: number
  onChange: (page: number) => void
}

export function TablePagination({ currentPage, lastPage, total, onChange }: TablePaginationProps) {
  if (lastPage <= 1) return null

  const pages: number[] = []
  const debut = Math.max(1, currentPage - 2)
  const fin = Math.min(lastPage, currentPage + 2)
  for (let page = debut; page <= fin; page += 1) pages.push(page)

  return (
    <div className="pagination" aria-label="Pagination">
      <button type="button" onClick={() => onChange(currentPage - 1)} disabled={currentPage <= 1} aria-label="Page précédente">
        <Icon name="chevron-left" size={15} />
      </button>
      {debut > 1 && <span style={{ padding: '0 4px', color: 'var(--color-muted)' }}>…</span>}
      {pages.map((page) => (
        <button
          type="button"
          key={page}
          className={page === currentPage ? 'actif' : ''}
          onClick={() => onChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      {fin < lastPage && <span style={{ padding: '0 4px', color: 'var(--color-muted)' }}>…</span>}
      <button type="button" onClick={() => onChange(currentPage + 1)} disabled={currentPage >= lastPage} aria-label="Page suivante">
        <Icon name="chevron-right" size={15} />
      </button>
      <span style={{ width: '100%', textAlign: 'center', fontSize: 12, color: 'var(--color-muted)' }}>
        Page {currentPage} sur {lastPage} — {total} élément{total > 1 ? 's' : ''}
      </span>
    </div>
  )
}
