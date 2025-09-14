import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import HookUseState from './playground/HookUseState.jsx'
import HomeHooks from './playground/HomeHooks.jsx'
import HookUseNavigate from './playground/HookUseNavigate.jsx'
import HookUseEffect from './playground/HookUseEffect.jsx'
import HookUseActionState from './playground/HookUseActionState.jsx'
import HookUseDebugValue from './playground/HookUseDebugValue.jsx'
import HookUseFormState from './playground/HookUseFormState.jsx'
import HookUseFormStatus from './playground/HookUseFormStatus.jsx'
import HookUseId from './playground/HookUseId.jsx'
import HookUseImperativeHandle from './playground/HookUseImperativeHandle.jsx'
import HookUseOptimistic from './playground/HookUseOptimistic.jsx'
import HookUseSyncExternalStore from './playground/HookUseSyncExternalStore.jsx'
import HookUseInsertionEffect from './playground/useInsertionEffect.jsx'
import HookuseCallback from './playground/HookuseCallback.jsx'
import HookuseMemo from './playground/HookuseMemo.jsx'
import HookuseRef from './playground/HookuseRef.jsx'
import HookuseContext from './playground/HookuseContext.jsx'
import HookuseReducer from './playground/HookuseReducer.jsx'
import HookuseLayoutEffect from './playground/HookuseLayoutEffect.jsx'
import HookuseTransition from './playground/HookuseTransition.jsx'
import HookuseDeferredValue from './playground/HookuseDeferredValue.jsx'

function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        {/* vista principal */}
        <Route path="/" element={<HomeHooks />}></Route>
        {/* vista de ejemplo de hook useState */}
        <Route path="/useState" element={<HookUseState />}></Route>
        <Route path="/useNavigate" element={<HookUseNavigate />}></Route>
        <Route path="/useEffect" element={<HookUseEffect />}></Route>
        <Route path="/useActionState" element={<HookUseActionState />}></Route>
        <Route path="/useDebugValue" element={<HookUseDebugValue />}></Route>
        <Route path="/useFormState" element={<HookUseFormState />}></Route>
        <Route path="/useFormStatus" element={<HookUseFormStatus />}></Route>
        <Route path="/useId" element={<HookUseId />}></Route>
        <Route path="/useImperativeHandle" element={<HookUseImperativeHandle />}></Route>
        <Route path="/useOptimistic" element={<HookUseOptimistic />}></Route>
        <Route path="/useSyncExternalStore" element={<HookUseSyncExternalStore />}></Route>
        <Route path="/useInsertionEffect" element={<HookUseInsertionEffect />}></Route>
        <Route path="/useCallback" element={<HookuseCallback />}></Route>
        <Route path="/useMemo" element={<HookuseMemo />}></Route>
        <Route path="/useRef" element={<HookuseRef />}></Route>
        <Route path="/useContext" element={<HookuseContext />}></Route>
        <Route path="/useReducer" element={<HookuseReducer />}></Route>
        <Route path="/useLayoutEffect" element={<HookuseLayoutEffect />}></Route>
        <Route path="/useTransition" element={<HookuseTransition />}></Route>
        <Route path="/useDeferredValue" element={<HookuseDeferredValue />}></Route>
      </Routes>
     </BrowserRouter >

  )
}

export default App
