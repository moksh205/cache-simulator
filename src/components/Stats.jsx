// Shows hits, misses, hit ratio and AMAT
function Stats({ state, config, done, total }) {
  const accesses = state.hits + state.misses
  let hitRatio = 0
  if (accesses > 0) hitRatio = state.hits / accesses
  const missRatio = accesses > 0 ? 1 - hitRatio : 0

  // AMAT = hit time + miss rate * miss penalty
  const amat = config.hitTime + missRatio * config.missPenalty

  return (
    <div className="panel">
      <h2>Results</h2>
      <div className="stats">
        <Box name="Accesses" value={done + ' / ' + total} />
        <Box name="Hits" value={state.hits} />
        <Box name="Misses" value={state.misses} />
        <Box name="Hit ratio" value={(hitRatio * 100).toFixed(1) + '%'} />
        <Box name="Miss ratio" value={(missRatio * 100).toFixed(1) + '%'} />
        <Box name="AMAT (cycles)" value={accesses > 0 ? amat.toFixed(2) : '-'} />
        <Box name="Compulsory" value={state.compulsory} />
        <Box name="Capacity" value={state.capacity} />
        <Box name="Conflict" value={state.conflict} />
        {config.writePolicy === 'Write Back' ? (
          <Box name="Write backs" value={state.writeBacks} />
        ) : (
          <Box name="Memory writes" value={state.memoryWrites} />
        )}
      </div>
      <div className="bar">
        <div style={{ width: hitRatio * 100 + '%' }}></div>
      </div>
    </div>
  )
}

function Box({ name, value }) {
  return (
    <div className="box">
      <div className="value">{value}</div>
      <div className="name">{name}</div>
    </div>
  )
}

export default Stats
