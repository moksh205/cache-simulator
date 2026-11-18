import { toHex, toBinary } from '../cacheLogic.js'

// Shows the last address broken into tag, index and offset
function AddressView({ access, info, config }) {
  if (!access) {
    return (
      <div className="panel">
        <h2>Current Access</h2>
        <p className="light">Press Step to start.</p>
      </div>
    )
  }

  let text = ''
  if (access.isHit) {
    text = 'Tag found in set ' + access.index + ', way ' + access.way + '.'
  } else if (access.evicted === '-') {
    text = 'Block loaded in set ' + access.index + ', way ' + access.way + ' (line was empty).'
  } else {
    text = 'Block loaded in set ' + access.index + ', way ' + access.way + '. Removed block ' + access.evicted + '.'
  }

  return (
    <div className="panel">
      <h2>Current Access</h2>
      <p>
        <b>{access.type === 'W' ? 'WRITE' : 'READ'}</b> {toHex(access.address, config.addressBits)}{' '}
        <span className={access.isHit ? 'badge hit' : 'badge miss'}>
          {access.isHit ? 'HIT' : 'MISS (' + access.missType + ')'}
        </span>
      </p>

      <p className="binary">
        <span className="tag">{toBinary(access.tag, info.tagBits)}</span>{' '}
        <span className="index">{toBinary(access.index, info.indexBits)}</span>{' '}
        <span className="offset">{toBinary(access.offset, info.offsetBits)}</span>
      </p>

      <p>
        <span className="tag">Tag = {access.tag}</span> &nbsp;&nbsp;
        <span className="index">Set = {info.indexBits > 0 ? access.index : 'none'}</span> &nbsp;&nbsp;
        <span className="offset">Offset = {access.offset}</span>
      </p>

      <p className="light">{text}</p>
    </div>
  )
}

export default AddressView
