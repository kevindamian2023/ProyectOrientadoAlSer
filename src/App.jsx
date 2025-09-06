import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import HookUseState from './playground/HookUseState.jsx'
import HomeHooks from './playground/HomeHooks.jsx'
import HookUseNavigate from './playground/HookUseNavigate.jsx'
function App() {
  return (

    <BrowserRouter>
      <Routes>
        {/* vista principal */}
        <Route path="/" element={<HomeHooks />}></Route>
        {/* vista de ejemplo de hook useState */}
        <Route path="/useState" element={<HookUseState />}></Route>
        <Route path="/useNavigate" element={<HookUseNavigate />}></Route>
      </Routes>
     </BrowserRouter >

  )
}

export default App
