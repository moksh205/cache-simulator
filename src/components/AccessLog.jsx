import { toHex } from '../cacheLogic.js'

// Table of all accesses done (newest on top)
function AccessLog({ log, config }) {
  const rows = [...log].reverse()

  return (
    <div className="panel">
      <h2>Access Log</h2>
      <div className="log">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Type</th><th>Address</th><th>Tag</th><th>Set</th><th>Offset</th>
              <th>Result</th><th>Miss type</th><th>Removed block</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.number}>
                <td>{row.number}</td>
                <td>{row.type}</td>
                <td>{toHex(row.address, config.addressBits)}</td>
                <td>{row.tag}</td>
                <td>{row.index}</td>
                <td>{row.offset}</td>
                <td>
                  <span className={row.isHit ? 'badge hit' : 'badge miss'}>{row.isHit ? 'HIT' : 'MISS'}</span>
                </td>
                <td>{row.missType}</td>
                <td>{row.evicted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AccessLog
