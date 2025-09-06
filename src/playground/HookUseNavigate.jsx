import { Link, useNavigate } from "react-router-dom";

function HookUseNavigate() {
    const navigate = useNavigate();

    function GoRoute(){
      navigate('/useState')
    }

    return (
    <div className='container justify-content-center align-content-center vh-100'>
      <div className='text-center'>
        <h2>Ejemplos de useNavigate</h2>
        <div className='list-group'>
          <button onClick={GoRoute} className="btn btn-secondary">Ruta Navigate a UseState</button>
          <Link to="name-route">Ruta de ejemplo</Link>
          <a href="/">Ir a Home</a>
        </div>
      </div>
    </div>
    );
}

export default HookUseNavigate;