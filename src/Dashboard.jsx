import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js";
import TablaAuditoria from "./Components/TablaAuditoria.jsx";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [vista, setVista] = useState("productos"); // productos | proveedores | auditoria

  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", contacto: "" });
  const [editandoId, setEditandoId] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [idEliminar, setIdEliminar] = useState(null);

  // Estado para mostrar la tabla de auditoría
  const [mostrarAuditoria, setMostrarAuditoria] = useState(false);

  // 🔹 Cargar productos
  const obtenerProductos = async () => {
    const querySnapshot = await getDocs(collection(db, "productos"));
    const docs = [];
    querySnapshot.forEach((doc) => {
      docs.push({ id: doc.id, ...doc.data() });
    });
    setProductos(docs);
  };

  // 🔹 Cargar proveedores
  const obtenerProveedores = async () => {
    const querySnapshot = await getDocs(collection(db, "proveedores"));
    const docs = [];
    querySnapshot.forEach((doc) => {
      docs.push({ id: doc.id, ...doc.data() });
    });
    setProveedores(docs);
  };

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    if (vista === "productos") {
      obtenerProductos();
    } else if (vista === "proveedores") {
      obtenerProveedores();
    }
  }, [vista]);

  // 🔹 Crear o actualizar registro
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (vista === "productos") {
        if (editandoId) {
          // actualizar
          const ref = doc(db, "productos", editandoId);
          await updateDoc(ref, {
            nombre: nuevo.nombre,
            precio: parseFloat(nuevo.precio)
          });
          alert("Producto actualizado ✅");
        } else {
          // crear
          await addDoc(collection(db, "productos"), {
            nombre: nuevo.nombre,
            precio: parseFloat(nuevo.precio)
          });
          alert("Producto agregado ✅");
        }
        obtenerProductos();
      } else {
        if (editandoId) {
          const ref = doc(db, "proveedores", editandoId);
          await updateDoc(ref, {
            nombre: nuevo.nombre,
            contacto: nuevo.contacto
          });
          alert("Proveedor actualizado ✅");
        } else {
          await addDoc(collection(db, "proveedores"), {
            nombre: nuevo.nombre,
            contacto: nuevo.contacto
          });
          alert("Proveedor agregado ✅");
        }
        obtenerProveedores();
      }

      setNuevo({ nombre: "", precio: "", contacto: "" });
      setEditandoId(null);
    } catch (e) {
      console.error("Error al guardar: ", e);
    }
  };

  // 🔹 Editar registro
  const handleEditar = (item) => {
    setEditandoId(item.id);
    setNuevo(item);
  };

  // 🔹 Abrir modal de confirmación
  const abrirModal = (id) => {
    setIdEliminar(id);
    setMostrarModal(true);
  };

  // 🔹 Confirmar eliminación
  const confirmarEliminar = async () => {
    try {
      if (vista === "productos") {
        await deleteDoc(doc(db, "productos", idEliminar));
        obtenerProductos();
      } else {
        await deleteDoc(doc(db, "proveedores", idEliminar));
        obtenerProveedores();
      }
      alert("Registro eliminado ✅");
    } catch (e) {
      console.error("Error al eliminar: ", e);
    }
    setMostrarModal(false);
    setIdEliminar(null);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <button className="btn-back-home" onClick={() => navigate("/home")}>
          ← Volver a Inicio
        </button>
        <h1 className="dashboard-title">Panel de Control</h1>
        <p className="dashboard-subtitle">Gestiona tus productos y proveedores de manera eficiente</p>
      </div>

      {/* Tab Buttons */}
      <div className="tab-buttons">
        <button
          className={vista === "productos" ? "tab-btn tab-btn-active" : "tab-btn tab-btn-inactive"}
          onClick={() => setVista("productos")}
        >
          📦 Productos
        </button>
        <button
          className={vista === "proveedores" ? "tab-btn tab-btn-active" : "tab-btn tab-btn-inactive"}
          onClick={() => setVista("proveedores")}
        >
          🏢 Proveedores
        </button>
        <button
          className="tab-btn tab-btn-inactive"
          onClick={() => setMostrarAuditoria(true)}
        >
          📊 Auditoría
        </button>
      </div>

      {/* Form Card - Solo mostrar para productos y proveedores */}
      {vista !== "auditoria" && (
        <div className="glass-card">
          <h2 className="card-title">
            {editandoId ? "Editar" : "Crear"}{" "}
            {vista === "productos" ? "Producto" : "Proveedor"}
          </h2>
          <form onSubmit={handleGuardar}>
            <div className="form-row">
              <input
                type="text"
                className="input-field"
                placeholder="Nombre"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                required
              />
              {vista === "productos" ? (
                <input
                  type="number"
                  className="input-field"
                  placeholder="Precio"
                  value={nuevo.precio}
                  onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
                  required
                />
              ) : (
                <input
                  type="text"
                  className="input-field"
                  placeholder="Contacto"
                  value={nuevo.contacto}
                  onChange={(e) => setNuevo({ ...nuevo, contacto: e.target.value })}
                  required
                />
              )}
              <button className="btn-primary-custom" type="submit">
                {editandoId ? "✓ Actualizar" : "✓ Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Card - Solo mostrar para productos y proveedores */}
      {vista !== "auditoria" && (
        <div className="glass-card">
          <h2 className="card-title">
            Lista de {vista === "productos" ? "Productos" : "Proveedores"}
          </h2>
          {(vista === "productos" ? productos : proveedores).length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p className="empty-state-text">
                No hay {vista} registrados aún
              </p>
            </div>
          ) : (
            <ul className="items-list">
              {(vista === "productos" ? productos : proveedores).map((item) => (
                <li key={item.id} className="list-item">
                  <span className="item-content">
                    {vista === "productos"
                      ? `${item.nombre} - $${item.precio}`
                      : `${item.nombre} - ${item.contacto}`}
                  </span>
                  <div className="item-actions">
                    <button className="btn-edit" onClick={() => handleEditar(item)}>
                      ✏️ Editar
                    </button>
                    <button className="btn-delete" onClick={() => abrirModal(item.id)}>
                      🗑️ Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">⚠️ Confirmar eliminación</h3>
              <button
                className="btn-close"
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que deseas eliminar este registro?</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-danger" onClick={confirmarEliminar}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Auditoría (Modal Pantalla Completa) */}
      {mostrarAuditoria && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '98%',
            height: '95vh',
            maxWidth: '1800px',
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <TablaAuditoria
              mostrar={true}
              onCerrar={() => setMostrarAuditoria(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}