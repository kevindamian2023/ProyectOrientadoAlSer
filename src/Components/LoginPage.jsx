import { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // 👈 Hook para redirigir

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Inicio de sesión exitoso ✅");
      navigate("/dashboard"); // 👈 Te envía al Dashboard
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: "28rem" }} className="shadow-lg border-0 rounded-4">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Iniciar Sesión</h2>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Iniciar Sesión
              </Button>
            </div>
          </Form>

          <div className="d-flex justify-content-between mt-3">
            <Link to="/register">¿No tienes cuenta? Regístrate</Link>
            <Link to="/reset-password">¿Olvidaste tu contraseña?</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginPage;
