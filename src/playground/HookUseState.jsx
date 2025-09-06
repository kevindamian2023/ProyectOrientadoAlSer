import { useState } from 'react';

function Contador() {
  const [ count, setCount ] = useState(0);

  // function aumentar() {
  //   setCount(count + 1);
  // }

  // function disminuir() {
  //   setCount(count - 1);
  // }

  return (
    <div>
      <div className='container text-center'>
        <h1>Contador: {count}</h1>
        <div className='btn-group'>
          {/* <button onClick={aumentar} className='btn btn-success'>Aumentar</button>
          <button onClick={disminuir} className='btn btn-warning'>Disminuir</button> */}
          <button onClick={() => setCount(count+1)} className='btn btn-success'>Aumentar</button>
          <button onClick={() => setCount(count-1)} className='btn btn-warning'>Disminuir</button>
          <a href="/">Ir al Home</a>
        </div>
      </div>
    </div>
  );

}

export default Contador;