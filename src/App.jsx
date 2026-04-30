import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingAJR from './pages/LandingAJR'
import BookingPage from './pages/BookingPage'
import AdminLogin from './pages/AdminLogin'
import AdminRegister from './pages/AdminRegister'
import AdminDashboard from './pages/AdminDashboard'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('barber_token')
  return token ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingAJR />} />
        <Route path="/agendar/:slug" element={<BookingPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/cadastro" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={
          <PrivateRoute><AdminDashboard /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
