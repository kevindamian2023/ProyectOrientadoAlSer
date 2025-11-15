import { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      // Guardar registro del usuario en Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          provider: "password",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      alert("Cuenta creada exitosamente 🎉");
      // navigate("/login"); // redirige al login si quieres
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: "28rem" }} className="shadow-lg border-0 rounded-4">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Crear Cuenta</h2>
          <Form onSubmit={handleRegister}>
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
                placeholder="Crea una contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Registrarse
              </Button>
            </div>
          </Form>

          <div className="d-flex justify-content-between mt-3">
            <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RegisterPage;
