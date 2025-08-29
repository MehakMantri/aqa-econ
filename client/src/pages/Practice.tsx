import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import QuestionCard from '../components/QuestionCard'
import { useNavigate } from 'react-router-dom'

type Q = { id: number, question: string, options: Record<string,string>, topics: string, difficulty: number }

export default function Practice() {
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [current, setCurrent] = useState<Q | null>(null)
  const [feedback, setFeedback] = useState<{correct: boolean} | null>(null)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { nav('/login'); return }
    start()
  }, [])

  const start = async () => {
    try {
      const { session_id } = await api.startSession()
      setSessionId(Number(session_id))
      const q = await api.nextQuestion(Number(session_id))
      if (q?.done) { setDone(true); return }
      setCurrent(q)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to start session')
    }
  }

  const submit = async (choice: 'A'|'B'|'C'|'D') => {
    if (!sessionId || !current) return
    const res = await api.answer({ session_id: sessionId, question_id: current.id, selected: choice })
    setFeedback({ correct: res.correct })
    if (res.done) {
      const fin = await api.finish(sessionId)
      setScore(fin.score)
      setDone(true)
    } else if (res.next) {
      setTimeout(() => {
        setCurrent(res.next)
        setFeedback(null)
      }, 600)
    }
  }

  if (error) return <div className="text-red-600">{error}</div>
  if (done) return (
    <div className="card text-center">
      <h2 className="text-2xl font-bold mb-2">Session Complete</h2>
      {score !== null && <div className="text-lg">Your score: <span className="font-semibold">{score}%</span></div>}
      <div className="mt-4 flex gap-3 justify-center">
        <button className="btn btn-outline" onClick={() => nav('/dashboard')}>Go to Dashboard</button>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Start New Session</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Practice Session</h1>
      {current ? (
        <QuestionCard question={current} onSubmit={submit} feedback={feedback} />
      ) : (
        <div className="card">Loading question...</div>
      )}
    </div>
  )
}
