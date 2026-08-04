import { Fragment, ReactNode } from 'react'

type RichAssistantMessageProps = {
  content: string
}

function safeUrl(value: string, image = false) {
  const candidate = value.trim()
  if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate
  try {
    const parsed = new URL(candidate)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    if (image && parsed.protocol !== 'https:') return null
    return parsed.toString()
  } catch {
    return null
  }
}

function inlineContent(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  const parts = text.split(pattern)
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>
    }
    const link = part.match(/^\[([^\]]+)]\(([^)]+)\)$/)
    if (link) {
      const href = safeUrl(link[2])
      return href ? (
        <a key={index} href={href} target="_blank" rel="noreferrer noopener">
          {link[1]}
        </a>
      ) : <Fragment key={index}>{link[1]}</Fragment>
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

function tableCells(line: string) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim())
}

function isTableSeparator(line: string) {
  const cells = tableCells(line)
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell))
}

function isBlockStart(lines: string[], index: number) {
  const line = lines[index]?.trim() ?? ''
  const next = lines[index + 1]?.trim() ?? ''
  return /^#{2,3}\s+/.test(line)
    || /^[-*]\s+/.test(line)
    || /^\d+\.\s+/.test(line)
    || /^!\[[^\]]*]\([^)]+\)$/.test(line)
    || (line.includes('|') && isTableSeparator(next))
}

export default function RichAssistantMessage({ content }: RichAssistantMessageProps) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()
    if (!line) {
      index += 1
      continue
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/)
    if (heading) {
      const Tag = heading[1].length === 2 ? 'h3' : 'h4'
      blocks.push(<Tag key={`heading-${index}`}>{inlineContent(heading[2])}</Tag>)
      index += 1
      continue
    }

    const image = line.match(/^!\[([^\]]*)]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/)
    if (image) {
      const src = safeUrl(image[2], true)
      if (src) {
        blocks.push(
          <figure key={`image-${index}`}>
            {/* Business images can come from local uploads or HTTPS avatar URLs. */}
            <img
              src={src}
              alt={image[1] || 'Illustration fournie par EDUOS'}
              width={720}
              height={405}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={event => event.currentTarget.closest('figure')?.setAttribute('hidden', '')}
            />
            {image[3] && <figcaption>{image[3]}</figcaption>}
          </figure>,
        )
      }
      index += 1
      continue
    }

    if (line.includes('|') && isTableSeparator(lines[index + 1] ?? '')) {
      const headers = tableCells(line)
      const rows: string[][] = []
      index += 2
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(tableCells(lines[index]))
        index += 1
      }
      blocks.push(
        <div className="director-ai-table-wrap" key={`table-${index}`}>
          <table>
            <thead>
              <tr>{headers.map((header, cell) => <th key={cell} scope="col">{inlineContent(header)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, cell) => <td key={cell}>{inlineContent(row[cell] ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    const unordered = /^[-*]\s+/.test(line)
    const ordered = /^\d+\.\s+/.test(line)
    if (unordered || ordered) {
      const items: string[] = []
      const expression = unordered ? /^[-*]\s+/ : /^\d+\.\s+/
      while (index < lines.length && expression.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(expression, ''))
        index += 1
      }
      const List = ordered ? 'ol' : 'ul'
      blocks.push(
        <List key={`list-${index}`}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{inlineContent(item)}</li>)}
        </List>,
      )
      continue
    }

    const paragraph = [line]
    index += 1
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    blocks.push(<p key={`paragraph-${index}`}>{inlineContent(paragraph.join(' '))}</p>)
  }

  return <div className="director-ai-rich-text">{blocks}</div>
}
