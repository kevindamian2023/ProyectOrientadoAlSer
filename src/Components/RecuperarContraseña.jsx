import { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

function ResetPasswordPage() {
  const [email, setEmail] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Se envió un correo para restablecer tu contraseña 📧");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: "28rem" }} className="shadow-lg border-0 rounded-4">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Recuperar Contraseña</h2>
          <Form onSubmit={handleReset}>
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

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Enviar enlace
              </Button>
            </div>
          </Form>

          <div className="d-flex justify-content-between mt-3">
            <Link to="/login">Volver al inicio de sesión</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ResetPasswordPage;
