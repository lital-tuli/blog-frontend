import { Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './App.css'

function App() {
  const { isAuthenticated } = useSelector(state => state.auth || { isAuthenticated: false })

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
        <Route path="/articles" element={<div>Articles Page</div>} />
        <Route path="/articles/:id" element={<div>Article Detail Page</div>} />
      </Routes>
    </div>
  )
}

export default App