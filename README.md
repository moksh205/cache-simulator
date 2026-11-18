# Cache Memory Simulator

COA project made with React + Vite.

## How to run

```
npm install
npm run dev
```

Then open the link shown in terminal (usually http://localhost:5173).

## How to use

1. **Choose cache settings** (left side, top panel)
   - Cache size and block size
   - Mapping: Direct mapped, 2/4/8-way set associative or Fully associative
   - Replacement policy: LRU, FIFO or Random
   - Write policy: Write Back or Write Through
   - Address bits, hit time and miss penalty
   - Below the settings you can see the number of blocks, sets, and tag / index / offset bits

2. **Enter memory addresses** (left side, second panel)
   - Type addresses separated by space or comma
   - Hex: start with `0x` (example `0x1A`)
   - Decimal: just the number (example `26`)
   - For a write, put `W` before the address (example `W 0x10`)
   - All other addresses are reads
   - Or click an example button: **Sequential**, **Loop**, **Conflict**, **Random**

3. **Run the simulation**
   - **Step** - does one access at a time
   - **Run All** - does all remaining accesses
   - **Reset** - clears the cache and starts again

4. **Read the output** (right side)
   - **Results** - hits, misses, hit ratio, miss ratio, AMAT and miss types
   - **Current Access** - the address in binary, split into tag, index and offset (in different colours)
   - **Cache Contents** - every set and line. Green = hit, Red = miss, faded = empty line. `V` = valid bit, `D` = dirty bit
   - **Access Log** - table of all accesses, newest on top

### Example

Settings: 128 B cache, 16 B block, Direct mapped, 16 address bits

Input: `0x00 0x04 0x10 0x80 0x00`

| Address | Set | Tag | Result | Why |
|---|---|---|---|---|
| 0x00 | 0 | 0 | MISS | Compulsory (first time) |
| 0x04 | 0 | 0 | HIT | Same block as 0x00 |
| 0x10 | 1 | 0 | MISS | Compulsory |
| 0x80 | 0 | 1 | MISS | Compulsory, removes block 0x00 |
| 0x00 | 0 | 0 | MISS | Conflict (0x80 took its place) |

Change the mapping to **2-way** and run again. The last access becomes a HIT, because set 0 can now hold both blocks.

## Features

- Direct mapped, set associative (2/4/8 way) and fully associative cache
- Replacement policy: LRU, FIFO, Random
- Write policy: Write Back and Write Through
- Shows tag, index and offset bits of each address
- Shows hits, misses, hit ratio and AMAT
- Tells miss type: Compulsory, Capacity or Conflict

## Formulas used

- Number of blocks = Cache size / Block size
- Number of sets = Number of blocks / Ways
- Offset bits = log2(Block size)
- Index bits = log2(Number of sets)
- Tag bits = Address bits - Index bits - Offset bits
- Block number = Address / Block size
- Set index = Block number % Number of sets
- Tag = Block number / Number of sets
- AMAT = Hit time + Miss rate x Miss penalty

## Files

- `src/cacheLogic.js` - all the cache logic
- `src/App.jsx` - main component, keeps the state
- `src/components/` - UI parts (settings, input, results, cache table, log)
