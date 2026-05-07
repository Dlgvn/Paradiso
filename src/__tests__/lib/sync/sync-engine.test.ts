describe('replaySyncQueue (PWA-04)', () => {
  it.todo('dispatches each queued operation to the matching Server Action')
  it.todo('removes successfully-replayed entries from sync_queue')
  it.todo('on failure, increments attempts and leaves entry in queue')
  it.todo('processes entries in queued_at ascending order')
})

describe('last-write-wins merge (D-02)', () => {
  it.todo('server item replaces local when server.updated_at > local.updated_at')
  it.todo('local item is preserved when local.updated_at >= server.updated_at')
})
