import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { TrendLine, WeakAreas } from '../components/DashboardCharts'

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.dashboard().then(setData).catch(e => {
      setError(e?.response?.data?.error || 'Failed to load dashboard')
    })
  }, [])

  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return <div className="card">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Current level</div>
          <div className="text-2xl font-bold">{data.level}</div>
          <div className="text-sm text-gray-600">Ability: {Math.round(data.ability)}</div>
        </div>
        <div className="text-sm text-gray-500">
          Total finished sessions: {data.sessions.length}
        </div>
      </div>
      <TrendLine data={data.sessions} />
      <WeakAreas topics={data.topics.slice(0, 8)} />
    </div>
  )
}
