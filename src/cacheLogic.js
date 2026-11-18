// All the cache logic is in this file.
// The React components only show the data.

// Find the number of sets, and tag / index / offset bits
export function getCacheInfo(config) {
  const numBlocks = config.cacheSize / config.blockSize
  let ways = config.ways
  if (ways === 'full') {
    ways = numBlocks
  }

  let error = ''
  if (config.blockSize > config.cacheSize) {
    error = 'Block size cannot be bigger than cache size'
  } else if (ways > numBlocks) {
    error = 'Cache has only ' + numBlocks + ' blocks, so it cannot be ' + ways + '-way'
  }

  const numSets = error ? 1 : numBlocks / ways
  const offsetBits = Math.log2(config.blockSize)
  const indexBits = Math.log2(numSets)
  const tagBits = config.addressBits - indexBits - offsetBits

  if (!error && tagBits < 1) {
    error = 'Address bits are too less for this cache'
  }

  return { numBlocks, numSets, ways, offsetBits, indexBits, tagBits, error }
}

// Make an empty cache. Each set has some lines (ways).
export function createEmptyCache(numSets, ways) {
  const cache = []
  for (let i = 0; i < numSets; i++) {
    const set = []
    for (let j = 0; j < ways; j++) {
      set.push({ valid: false, tag: 0, dirty: false, lastUsed: 0, loadedAt: 0 })
    }
    cache.push(set)
  }
  return cache
}

// Starting values of the simulation
export function createStartState(info) {
  return {
    cache: createEmptyCache(info.numSets, info.ways),
    time: 0,
    hits: 0,
    misses: 0,
    compulsory: 0,
    capacity: 0,
    conflict: 0,
    writeBacks: 0,
    memoryWrites: 0,
    seenBlocks: [],   // every block used till now (for compulsory miss)
    recentBlocks: [], // last N blocks used, N = total blocks (for capacity miss)
    log: [],
  }
}

// Read the input text like "0x10 0x20 W 0x30" and make a list
export function parseAddresses(text, addressBits) {
  const words = text.trim().split(/[\s,]+/)
  const list = []
  let type = 'R'

  for (let word of words) {
    if (word === '') continue
    word = word.toUpperCase()

    if (word === 'R' || word === 'W') {
      type = word
      continue
    }

    let address
    if (word.startsWith('0X')) {
      address = parseInt(word.substring(2), 16)
    } else {
      address = parseInt(word, 10)
    }

    if (isNaN(address) || address < 0) {
      throw new Error('Wrong address: ' + word)
    }
    if (address >= Math.pow(2, addressBits)) {
      throw new Error('Address ' + word + ' is too big for ' + addressBits + ' bits')
    }

    list.push({ type: type, address: address })
    type = 'R' // next one is read again
  }
  return list
}

// Choose which line to remove from a full set
function findVictim(set, policy) {
  // first use any empty line
  for (let i = 0; i < set.length; i++) {
    if (!set[i].valid) return i
  }

  if (policy === 'Random') {
    return Math.floor(Math.random() * set.length)
  }

  // LRU -> remove line used longest time ago
  // FIFO -> remove line loaded first
  let victim = 0
  for (let i = 1; i < set.length; i++) {
    if (policy === 'LRU' && set[i].lastUsed < set[victim].lastUsed) victim = i
    if (policy === 'FIFO' && set[i].loadedAt < set[victim].loadedAt) victim = i
  }
  return victim
}

// Do one memory access and return the new state
export function accessCache(oldState, info, config, request) {
  // copy old state (React needs a new object)
  const state = { ...oldState }
  state.cache = oldState.cache.map((set) => set.map((line) => ({ ...line })))
  state.time = oldState.time + 1

  const address = request.address
  const blockNumber = Math.floor(address / config.blockSize)
  const offset = address % config.blockSize
  const index = blockNumber % info.numSets
  const tag = Math.floor(blockNumber / info.numSets)

  const set = state.cache[index]

  // check if tag is present in this set
  let way = -1
  for (let i = 0; i < set.length; i++) {
    if (set[i].valid && set[i].tag === tag) way = i
  }
  const isHit = way !== -1

  // for miss type:
  // compulsory = block never used before
  // capacity  = block not in last N used blocks (even full assoc cache would miss)
  // conflict  = otherwise (miss only because of mapping)
  const isFirstTime = !oldState.seenBlocks.includes(blockNumber)
  const wasRecent = oldState.recentBlocks.includes(blockNumber)

  state.seenBlocks = isFirstTime ? [...oldState.seenBlocks, blockNumber] : oldState.seenBlocks
  state.recentBlocks = oldState.recentBlocks.filter((b) => b !== blockNumber)
  state.recentBlocks.push(blockNumber)
  if (state.recentBlocks.length > info.numBlocks) {
    state.recentBlocks.shift()
  }

  let missType = '-'
  let evicted = '-'

  if (isHit) {
    state.hits++
  } else {
    state.misses++
    if (isFirstTime) {
      missType = 'Compulsory'
      state.compulsory++
    } else if (!wasRecent) {
      missType = 'Capacity'
      state.capacity++
    } else {
      missType = 'Conflict'
      state.conflict++
    }

    way = findVictim(set, config.policy)
    const oldLine = set[way]
    if (oldLine.valid) {
      const oldBlock = oldLine.tag * info.numSets + index
      evicted = toHex(oldBlock * config.blockSize, config.addressBits)
      if (oldLine.dirty) {
        state.writeBacks++
        evicted = evicted + ' (write back)'
      }
    }

    // bring new block into cache
    set[way] = { valid: true, tag: tag, dirty: false, lastUsed: 0, loadedAt: state.time }
  }

  set[way].lastUsed = state.time

  if (request.type === 'W') {
    if (config.writePolicy === 'Write Back') {
      set[way].dirty = true
    } else {
      state.memoryWrites++
    }
  }

  const entry = {
    number: oldState.log.length + 1,
    type: request.type,
    address, tag, index, offset, way,
    isHit, missType, evicted,
  }
  state.log = [...oldState.log, entry]
  return state
}

// helper functions to show numbers
export function toHex(num, bits) {
  const digits = Math.ceil(bits / 4)
  return '0x' + num.toString(16).toUpperCase().padStart(digits, '0')
}

export function toBinary(num, bits) {
  if (bits <= 0) return ''
  return num.toString(2).padStart(bits, '0')
}
