import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const { token } = await api.register({ name, email, password })
      localStorage.setItem('token', token)
      nav('/practice')
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form className="card space-y-3" onSubmit={submit}>
        <div>
          <div className="label">Name</div>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <div className="label">Email</div>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <div className="label">Password</div>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn btn-primary w-full">Create account</button>
        <div className="text-sm">Have an account? <Link to="/login" className="text-blue-600">Login</Link></div>
      </form>
    </div>
  )
}
