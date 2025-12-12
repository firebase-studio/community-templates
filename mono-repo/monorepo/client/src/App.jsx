import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import nodeLogo from './assets/node.svg'
import './App.css'

function App() {
  const [msg, setMsg] = useState('')

  const getMsg = async () => {
    const response = await fetch('http://localhost:3000')
    const data = await response.json()
    setMsg(data.message)
  }

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://expressjs.com/" target="_blank">
          <img src={nodeLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>React + Express </h1>
      {msg && <p>{msg}</p>}
      <div className="card">
        <button onClick={() => getMsg()}>
          Get Message
        </button>
      </div>
    </>
  )
}

export default App
