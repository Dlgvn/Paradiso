import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

// Polyfill structuredClone for jsdom environments that don't expose it
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj))
}
