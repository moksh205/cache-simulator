// Panel to type addresses and control the simulation
function InputPanel({ config, inputText, onInputChange, onStep, onRunAll, onReset, error }) {

  // make some example address patterns
  function loadExample(type) {
    const C = config.cacheSize
    const B = config.blockSize
    const list = []

    if (type === 'sequential') {
      for (let a = 0; a < C * 2; a += 4) list.push('0x' + a.toString(16))
    }
    if (type === 'loop') {
      for (let round = 0; round < 3; round++) {
        for (let a = 0; a < C / 2; a += B / 2) list.push('0x' + a.toString(16))
      }
    }
    if (type === 'conflict') {
      // these addresses go to the same set in direct mapped cache
      for (let round = 0; round < 4; round++) {
        list.push('0x0', '0x' + C.toString(16), '0x' + (2 * C).toString(16))
      }
    }
    if (type === 'random') {
      for (let i = 0; i < 20; i++) {
        const a = Math.floor(Math.random() * C * 4)
        const w = Math.random() < 0.25 ? 'W ' : ''
        list.push(w + '0x' + a.toString(16))
      }
    }
    onInputChange(list.join(' '))
  }

  return (
    <div className="panel">
      <h2>2. Memory Addresses</h2>
      <label>Write hex (0x..) or decimal. Put W before an address for write.</label>
      <textarea value={inputText} onChange={(e) => onInputChange(e.target.value)} />

      <label>Examples</label>
      <div className="buttons">
        <button onClick={() => loadExample('sequential')}>Sequential</button>
        <button onClick={() => loadExample('loop')}>Loop</button>
        <button onClick={() => loadExample('conflict')}>Conflict</button>
        <button onClick={() => loadExample('random')}>Random</button>
      </div>

      <div className="buttons">
        <button className="main-btn" onClick={onStep}>Step</button>
        <button className="main-btn" onClick={onRunAll}>Run All</button>
        <button onClick={onReset}>Reset</button>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default InputPanel
