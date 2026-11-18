import { toHex } from '../cacheLogic.js'

// Shows every set and every line of the cache
function CacheTable({ cache, info, config, lastAccess }) {
  return (
    <div className="panel">
      <h2>Cache Contents</h2>
      <div className="cache">
        {cache.map((set, setNo) => (
          <div className="set" key={setNo}>
            <div className="set-name">Set {setNo}</div>
            <div className="lines">
              {set.map((line, wayNo) => {
                // colour the line that was just used
                let className = 'line'
                if (!line.valid) className += ' empty'
                if (lastAccess && lastAccess.index === setNo && lastAccess.way === wayNo) {
                  className += lastAccess.isHit ? ' hit' : ' miss'
                }

                if (!line.valid) {
                  return (
                    <div className={className} key={wayNo}>
                      <div>Way {wayNo} | V=0</div>
                      <div>Tag: -</div>
                      <div className="small">empty</div>
                    </div>
                  )
                }

                const start = (line.tag * info.numSets + setNo) * config.blockSize
                const end = start + config.blockSize - 1
                return (
                  <div className={className} key={wayNo}>
                    <div>
                      Way {wayNo} | V=1
                      {config.writePolicy === 'Write Back' && (line.dirty ? <b className="dirty"> D=1</b> : ' D=0')}
                    </div>
                    <div>Tag: {line.tag}</div>
                    <div className="small">
                      {toHex(start, config.addressBits)} - {toHex(end, config.addressBits)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CacheTable
