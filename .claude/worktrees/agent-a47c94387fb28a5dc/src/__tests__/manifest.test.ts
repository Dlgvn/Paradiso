import manifest from '@/app/manifest'

describe('manifest.json (PWA-01)', () => {
  const m = manifest()

  it('has name, short_name, description', () => {
    expect(m.name).toBe('Media Tracker')
    expect(m.short_name).toBe('MediaTracker')
    expect(typeof m.description).toBe('string')
    expect((m.description as string).length).toBeGreaterThan(0)
  })

  it('display is standalone and start_url is /', () => {
    expect(m.display).toBe('standalone')
    expect(m.start_url).toBe('/')
  })

  it('icons array contains 192x192 and 512x512 entries', () => {
    const sizes = (m.icons ?? []).map((i) => i.sizes)
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']))
  })

  it('icons array includes maskable purpose', () => {
    const purposes = (m.icons ?? []).map((i) => i.purpose).filter(Boolean)
    expect(purposes).toEqual(expect.arrayContaining(['maskable']))
  })

  it('theme_color and background_color match cinematic dark base', () => {
    expect(m.theme_color).toBe('#0a0a0f')
    expect(m.background_color).toBe('#0a0a0f')
  })
})
