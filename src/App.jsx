import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'

// tus imports de hooks
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

// dashboard
import Dashboard from "./Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* dashboard como página principal */}
        <Route path="/" element={<Dashboard />} />

        {/* agrupamos hooks en /hooks */}
        <Route path="/hooks" element={<HomeHooks />} />
        <Route path="/hooks/useState" element={<HookUseState />} />
        <Route path="/hooks/useNavigate" element={<HookUseNavigate />} />
        <Route path="/hooks/useEffect" element={<HookUseEffect />} />
        <Route path="/hooks/useActionState" element={<HookUseActionState />} />
        <Route path="/hooks/useDebugValue" element={<HookUseDebugValue />} />
        <Route path="/hooks/useFormState" element={<HookUseFormState />} />
        <Route path="/hooks/useFormStatus" element={<HookUseFormStatus />} />
        <Route path="/hooks/useId" element={<HookUseId />} />
        <Route path="/hooks/useImperativeHandle" element={<HookUseImperativeHandle />} />
        <Route path="/hooks/useOptimistic" element={<HookUseOptimistic />} />
        <Route path="/hooks/useSyncExternalStore" element={<HookUseSyncExternalStore />} />
        <Route path="/hooks/useInsertionEffect" element={<HookUseInsertionEffect />} />
        <Route path="/hooks/useCallback" element={<HookuseCallback />} />
        <Route path="/hooks/useMemo" element={<HookuseMemo />} />
        <Route path="/hooks/useRef" element={<HookuseRef />} />
        <Route path="/hooks/useContext" element={<HookuseContext />} />
        <Route path="/hooks/useReducer" element={<HookuseReducer />} />
        <Route path="/hooks/useLayoutEffect" element={<HookuseLayoutEffect />} />
        <Route path="/hooks/useTransition" element={<HookuseTransition />} />
        <Route path="/hooks/useDeferredValue" element={<HookuseDeferredValue />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
