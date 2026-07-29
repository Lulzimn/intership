import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './Pages/Auth/LoginPage.jsx'
import Signup from './Pages/Auth/Singup.jsx'
import ResetPassword from './Pages/Auth/ResetPassword.jsx'
import Homepage from './components/Shared/HomeFrom.jsx'
import { Dashboard } from './Pages/Dashboard.jsx'
import Goals from './Pages/Goals.jsx'
import RegisterForm from './components/Shared/Auth/RegisterFrom.jsx'
import Moods from './Pages/Moods.jsx'
import Chat from './Pages/Chat.jsx'
import { ProtectedRoute } from './components/Auth/ProtectedRoute.jsx'
import DemoFormPage from './components/Shared/DemoFormPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/demo" element={<DemoFormPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moods"
          element={
            <ProtectedRoute>
              <Moods />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
