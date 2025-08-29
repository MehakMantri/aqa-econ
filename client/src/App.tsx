import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Practice from './pages/Practice'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container my-6">
        <Routes>
          <Route path="/" element={<Navigate to="/practice" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
