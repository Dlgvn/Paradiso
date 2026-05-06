export interface OlSearchResult {
  key: string // "/works/OL...W"
  title: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number // internal cover ID
}

export async function searchOpenLibrary(
  query: string
): Promise<{ results: OlSearchResult[]; error?: string }> {
  const url =
    `https://openlibrary.org/search.json` +
    `?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,first_publish_year,cover_i`

  const res = await fetch(url, {
    next: { revalidate: 300 },
  })

  if (!res.ok) {
    return { results: [], error: 'Open Library unavailable' }
  }

  const data = await res.json()
  return { results: data.docs ?? [] }
}

export function getOlCoverUrl(
  coverId: number,
  size: 'S' | 'M' | 'L' = 'M'
): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
}

export function getOlWorkId(key: string): string {
  return key.replace('/works/', '')
}
