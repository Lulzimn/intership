
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './Pages/Auth/LoginPage.jsx'
import Signup from './Pages/Auth/Singup.jsx'

import Homepage from './components/Shared/HomeFrom.jsx'
import { Dashboard } from './Pages/Dashboard.jsx'
import RegisterForm from './components/Shared/Auth/RegisterFrom.jsx'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
       
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<RegisterForm/>} />
      </Routes>
    </BrowserRouter>
  )
}



export default App
