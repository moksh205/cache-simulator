import { useState } from 'react'
import ConfigPanel from './components/ConfigPanel.jsx'
import InputPanel from './components/InputPanel.jsx'
import Stats from './components/Stats.jsx'
import AddressView from './components/AddressView.jsx'
import CacheTable from './components/CacheTable.jsx'
import AccessLog from './components/AccessLog.jsx'
import { getCacheInfo, createStartState, parseAddresses, accessCache } from './cacheLogic.js'

const defaultConfig = {
  cacheSize: 128,
  blockSize: 16,
  ways: 1,
  policy: 'LRU',
  writePolicy: 'Write Back',
  addressBits: 16,
  hitTime: 1,
  missPenalty: 100,
}

const defaultInput = '0x00 0x04 0x10 0x80 0x00 0x84 W 0x10 0x100 0x00 0x80 0x14 0x104'

function App() {
  const [config, setConfig] = useState(defaultConfig)
  const [inputText, setInputText] = useState(defaultInput)
  const [simState, setSimState] = useState(createStartState(getCacheInfo(defaultConfig)))
  const [step, setStep] = useState(0) // how many accesses are done
  const [message, setMessage] = useState('')

  const info = getCacheInfo(config)

  // read the addresses from the text box
  let requests = []
  let inputError = ''
  try {
    requests = parseAddresses(inputText, config.addressBits)
  } catch (err) {
    inputError = err.message
  }

  function reset(newConfig) {
    const newInfo = getCacheInfo(newConfig)
    setSimState(createStartState(newInfo))
    setStep(0)
    setMessage('')
  }

  function changeConfig(name, value) {
    const newConfig = { ...config, [name]: value }
    setConfig(newConfig)
    reset(newConfig)
  }

  function changeInput(text) {
    setInputText(text)
    reset(config)
  }

  function doOneStep() {
    if (info.error || inputError) return
    if (step >= requests.length) {
      setMessage('All accesses done. Press Reset to start again.')
      return
    }
    setSimState(accessCache(simState, info, config, requests[step]))
    setStep(step + 1)
  }

  function runAll() {
    if (info.error || inputError) return
    let state = simState
    for (let i = step; i < requests.length; i++) {
      state = accessCache(state, info, config, requests[i])
    }
    setSimState(state)
    setStep(requests.length)
  }

  const lastAccess = simState.log[simState.log.length - 1]

  return (
    <div>
      <header>
        <h1>Cache Memory Simulator</h1>
        <p>Direct mapped, set associative and fully associative cache with LRU / FIFO / Random</p>
      </header>

      <main>
        <div>
          <ConfigPanel config={config} info={info} onChange={changeConfig} />
          <InputPanel
            config={config}
            inputText={inputText}
            onInputChange={changeInput}
            onStep={doOneStep}
            onRunAll={runAll}
            onReset={() => reset(config)}
            error={inputError || message}
          />
        </div>

        <div>
          <Stats state={simState} config={config} done={step} total={requests.length} />
          <AddressView access={lastAccess} info={info} config={config} />
          {!info.error && (
            <CacheTable cache={simState.cache} info={info} config={config} lastAccess={lastAccess} />
          )}
          <AccessLog log={simState.log} config={config} />
        </div>
      </main>
    </div>
  )
}

export default App
