import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const loggedIn = !!localStorage.getItem('token');

  return (
    <nav className="bg-white border-b">
      <div className="container flex items-center justify-between py-4">
        <Link to="/practice" className="font-bold text-lg">AQA Econ MVP</Link>
        <div className="flex gap-3 items-center">
          <Link to="/practice" className={`btn btn-outline ${loc.pathname === '/practice' ? 'bg-gray-100' : ''}`}>Practice</Link>
          <Link to="/dashboard" className={`btn btn-outline ${loc.pathname === '/dashboard' ? 'bg-gray-100' : ''}`}>Dashboard</Link>
          {!loggedIn ? (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-outline">Register</Link>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => { localStorage.removeItem('token'); nav('/login'); }}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  )
}
