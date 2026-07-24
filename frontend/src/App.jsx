import { useState, useRef } from 'react'
import './index.css'

const LANGUAGES = [
  { code: 'english', label: 'English' },
  { code: 'singlish', label: 'Singlish' },
  { code: 'malay', label: 'Malay' },
  { code: 'vietnamese', label: 'Vietnamese' },
  { code: 'thai', label: 'Thai' },
  { code: 'tamil', label: 'Tamil' },
  { code: 'telugu', label: 'Telugu' },
  { code: 'marathi', label: 'Marathi' },
  { code: 'malayalam', label: 'Malayalam' },
  { code: 'nepali', label: 'Nepali' },
  { code: 'mongolian', label: 'Mongolian' },
  { code: 'persian', label: 'Persian' },
  { code: 'punjabi', label: 'Punjabi' },
  { code: 'russian', label: 'Russian' },
  { code: 'turkish', label: 'Turkish' },
  { code: 'ukrainian', label: 'Ukrainian' },
  { code: 'romanian', label: 'Romanian' },
  { code: 'swedish', label: 'Swedish' },
]

function WaveformBars({ active }) {
  return (
    <div className={`waveform ${active ? 'waveform-active' : ''}`}>
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
  )
}

export default function App() {
  const [file, setFile] = useState(null)
  const [language, setLanguage] = useState('english')
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState('')
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setStatus('idle')
      setResult('')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      setStatus('idle')
      setResult('')
    }
  }

  const handleTranscribe = async () => {
    if (!file) return
    setStatus('loading')
    setResult('')

    const formData = new FormData()
    formData.append('audio', file)
    formData.append('language', language)

    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed')
      }

      setResult(data.text || 'No text returned.')
      setStatus('done')
    } catch (err) {
      setResult(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="page">
      <div className="chips">
        {['can lah', 'di ba?', 'สวัสดี', 'xin chào', 'नमस्ते', '你好'].map((w, i) => (
          <span className="chip" key={i}>{w}</span>
        ))}
      </div>

      <main className="card">
        <div className="eyebrow">SPEECH INTELLIGENCE DEMO</div>
        <h1>Voice Notes</h1>
        <p className="subtitle">
          Drop an audio file, pick a language, and let VALSEA turn speech into text.
        </p>

        <div
          className={`dropzone ${file ? 'has-file' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            hidden
          />
          <WaveformBars active={status === 'loading'} />
          <p className="dropzone-text">
            {file ? file.name : 'Click or drop an audio file here'}
          </p>
        </div>

        <div className="controls">
          <label htmlFor="lang">Language</label>
          <select
            id="lang"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        <button
          className="transcribe-btn"
          onClick={handleTranscribe}
          disabled={!file || status === 'loading'}
        >
          {status === 'loading' ? 'Transcribing…' : 'Transcribe'}
        </button>

        <div className={`result ${status}`}>
          {status === 'idle' && !result && <span className="muted">Your transcript will appear here.</span>}
          {status === 'loading' && <span className="muted">Listening to your audio…</span>}
          {status === 'done' && <p>{result}</p>}
          {status === 'error' && <p className="error-text">⚠ {result}</p>}
        </div>
      </main>

      <footer>Built with the VALSEA API · localhost:5000</footer>
    </div>
  )
}