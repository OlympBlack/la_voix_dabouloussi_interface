const INTERDITS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'form'])

export function nettoyerHtml(html: string | null | undefined): string {
  if (!html) return ''
  if (typeof DOMParser === 'undefined') return html.replace(/<[^>]*>/g, '')
  const document = new DOMParser().parseFromString(html, 'text/html')
  document.querySelectorAll('*').forEach((element) => {
    if (INTERDITS.has(element.tagName.toLowerCase())) {
      element.remove()
      return
    }
    Array.from(element.attributes).forEach((attribute) => {
      const nom = attribute.name.toLowerCase()
      const valeur = attribute.value.trim().toLowerCase()
      if (
        nom.startsWith('on') ||
        (nom === 'href' && valeur.startsWith('javascript:')) ||
        (nom === 'src' && !valeur.startsWith('http') && !valeur.startsWith('/') && !valeur.startsWith('data:image'))
      ) {
        element.removeAttribute(attribute.name)
      }
    })
  })
  return document.body.innerHTML
}
