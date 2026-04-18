const URL_PATTERN = /https?:\/\/[^\s<]+/g

function escapeAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

function linkifyText(text: string) {
  return text.replace(URL_PATTERN, (match) => {
    const trailing = match.match(/[),.;!?]+$/)?.[0] ?? ''
    const url = trailing ? match.slice(0, -trailing.length) : match

    return `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${url}</a>${trailing}`
  })
}

export function linkifyHtmlContent(html: string) {
  return html
    .split(/(<a\b[\s\S]*?<\/a>)/gi)
    .map((chunk) => {
      if (/^<a\b[\s\S]*<\/a>$/i.test(chunk)) return chunk

      return chunk
        .split(/(<[^>]+>)/g)
        .map((part) => (part.startsWith('<') ? part : linkifyText(part)))
        .join('')
    })
    .join('')
}
