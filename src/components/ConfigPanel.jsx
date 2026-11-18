// Panel where user chooses cache settings
function ConfigPanel({ config, info, onChange }) {
  let mappingName = info.ways + '-way set associative'
  if (info.ways === 1) mappingName = 'Direct mapped'
  if (info.numSets === 1) mappingName = 'Fully associative'

  return (
    <div className="panel">
      <h2>1. Cache Settings</h2>

      <div className="row">
        <div>
          <label>Cache size (bytes)</label>
          <select value={config.cacheSize} onChange={(e) => onChange('cacheSize', Number(e.target.value))}>
            {[32, 64, 128, 256, 512, 1024, 2048].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Block size (bytes)</label>
          <select value={config.blockSize} onChange={(e) => onChange('blockSize', Number(e.target.value))}>
            {[4, 8, 16, 32, 64].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div>
          <label>Mapping</label>
          <select
            value={config.ways}
            onChange={(e) => onChange('ways', e.target.value === 'full' ? 'full' : Number(e.target.value))}
          >
            <option value={1}>Direct mapped</option>
            <option value={2}>2-way set associative</option>
            <option value={4}>4-way set associative</option>
            <option value={8}>8-way set associative</option>
            <option value="full">Fully associative</option>
          </select>
        </div>
        <div>
          <label>Replacement</label>
          <select value={config.policy} onChange={(e) => onChange('policy', e.target.value)}>
            <option>LRU</option>
            <option>FIFO</option>
            <option>Random</option>
          </select>
        </div>
      </div>

      <div className="row">
        <div>
          <label>Write policy</label>
          <select value={config.writePolicy} onChange={(e) => onChange('writePolicy', e.target.value)}>
            <option>Write Back</option>
            <option>Write Through</option>
          </select>
        </div>
        <div>
          <label>Address bits</label>
          <input
            type="number" min="8" max="32" value={config.addressBits}
            onChange={(e) => onChange('addressBits', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="row">
        <div>
          <label>Hit time (cycles)</label>
          <input type="number" min="0" value={config.hitTime}
            onChange={(e) => onChange('hitTime', Number(e.target.value))} />
        </div>
        <div>
          <label>Miss penalty (cycles)</label>
          <input type="number" min="0" value={config.missPenalty}
            onChange={(e) => onChange('missPenalty', Number(e.target.value))} />
        </div>
      </div>

      {info.error ? (
        <p className="error">{info.error}</p>
      ) : (
        <div className="info">
          <p>{mappingName}</p>
          <p>Blocks: <b>{info.numBlocks}</b> &nbsp; Sets: <b>{info.numSets}</b> &nbsp; Ways: <b>{info.ways}</b></p>
          <p>
            <span className="tag">Tag {info.tagBits}</span> |{' '}
            <span className="index">Index {info.indexBits}</span> |{' '}
            <span className="offset">Offset {info.offsetBits}</span> bits
          </p>
        </div>
      )}
    </div>
  )
}

export default ConfigPanel
