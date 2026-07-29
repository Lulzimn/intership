import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RegisterForm from './components/Shared/Auth/RegisterFrom.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<RegisterForm />} />
        <Route path="/signup" element={<RegisterForm />} />
        <Route path="/reset-password" element={<RegisterForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
