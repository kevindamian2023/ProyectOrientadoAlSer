import React from 'react';
import { Link } from 'react-router-dom';
function HomeHooks() {
  return (
    <div className='container justify-content-center align-content-center vh-195'>
      <div className='text-center'>
        <h2>Ejemplos de Hooks en React</h2>
        <div className='list-group'>
          {/* <a href="/useState" className='list-group-item'>Ir a useState</a>
          <a href="/useNavigate" className='list-group-item'>Ir a useNavigate</a>
          {/* ejemplo para pasar a rama develop */}
          {/* <a href="/useNavigate" className='list-group-item'>Ir a useNavigate 2</a>
          <a href="#" className='list-group-item'>Ir a </a> */} 
          <table className='table table-bordered text-center'>
            <thead className=' text-center bg-black text-white'>
            <th>Hook</th>
            <th>Ruta</th>
            <th>Descripcion</th>
            <th>Categoria</th>
            </thead>
            <tbody>
              <tr>
                <td>useState</td>
                <td>
                  <Link to="/useState" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Maneja valores dinámicos dentro de un componente.</td>
                <td>estado</td>
              </tr>
              <tr>
                <td>useNavigate</td>
                <td>
                  <Link to="/useNavigate" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Cambia de ruta de forma programática.</td>
                <td>navegación</td>
              </tr>
              <tr>
                <td>useEffect</td>
                <td>
                  <Link to="/useEffect" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Ejecuta lógica después del render (ej. fetch, timers).</td>
                <td>Efectos</td>
              </tr>
              <tr>
                <td>UseActionState</td>
                <td>
                  <Link to="/useActionState" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Maneja el estado y resultado de acciones asincrónicas.</td>
                <td>Formularios</td>
              </tr>
              <tr>
                <td>UseDebugValue</td>
                <td>
                  <Link to="/useDebugValue" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Muestra info personalizada en React DevTools.</td>
                <td>Debugging</td>
              </tr>
              <tr>
                <td>UseFormState</td>
                <td>
                  <Link to="/useFormState" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Devuelve el estado y valores actuales de un formulario.</td>
                <td>Formularios</td>
              </tr>
              <tr>
                <td>UseFormStatus</td>
                <td>
                  <Link to="/useFormStatus" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Indica si un formulario está enviando, falló o fue exitoso.</td>
                <td>Formularios</td>
              </tr>
              <tr>
                <td>UseId</td>
                <td>
                  <Link to="/useId" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Genera un ID único para elementos accesibles.</td>
                <td>identificacion</td>
              </tr>
              <tr>
                <td>UseImperativeHandle</td>
                <td>
                  <Link to="/useImperativeHandle" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Controla qué valores expone un ref hacia afuera.</td>
                <td>identificacion</td>
              </tr>
              <tr>
                <td>UseOptimistic</td>
                <td>
                  <Link to="/useOptimistic" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Muestra resultados inmediatos antes de confirmación del servidor.</td>
                <td>estado optimista</td>
              </tr>
              <tr>
                <td>UseSyncExternalStore</td>
                <td>
                  <Link to="/useSyncExternalStore" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Se suscribe a tiendas externas (Redux, Zustand).</td>
                <td>estado externo</td>
              </tr>
              <tr>
                <td>UseInsertionEffect</td>
                <td>
                  <Link to="/useInsertionEffect" className='btn btn-primary'>Ir a ejemplo</Link>
                </td>
                <td>Inserta estilos antes de que el navegador pinte la UI.</td>
                <td>estilos</td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

}

export default HomeHooks;