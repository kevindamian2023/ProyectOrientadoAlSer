import React from 'react';

function HomeHooks() {
  return (
    <div className='container justify-content-center align-content-center vh-100'>
      <div className='text-center'>
        <h2>Ejemplos de Hooks</h2>
        <div className='list-group'>
          <a href="/useState" className='list-group-item'>Ir a useState</a>
          <a href="/useNavigate" className='list-group-item'>Ir a useNavigate</a>
          {/* ejemplo para pasar a rama develop */}
          <a href="/useNavigate" className='list-group-item'>Ir a useNavigate 2</a>
          <a href="#" className='list-group-item'>Ir a </a>
        </div>
      </div>
    </div>
  )

}

export default HomeHooks;