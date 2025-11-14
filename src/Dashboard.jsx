import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js";
import LogoutButton from "./Components/LogoutButton.jsx";

export default function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [vista, setVista] = useState("productos");

  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", contacto: "" });
  const [editandoId, setEditandoId] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [idEliminar, setIdEliminar] = useState(null);

  const obtenerProductos = async () => {
    const query = await getDocs(collection(db, "productos"));
    setProductos(query.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const obtenerProveedores = async () => {
    const query = await getDocs(collection(db, "proveedores"));
    setProveedores(query.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    vista === "productos" ? obtenerProductos() : obtenerProveedores();
  }, [vista]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (vista === "productos") {
        if (editandoId) {
          await updateDoc(doc(db, "productos", editandoId), {
            nombre: nuevo.nombre,
            precio: parseFloat(nuevo.precio),
          });
          alert("Producto actualizado");
        } else {
          await addDoc(collection(db, "productos"), {
            nombre: nuevo.nombre,
            precio: parseFloat(nuevo.precio),
          });
          alert("Producto agregado");
        }
        obtenerProductos();
      } else {
        if (editandoId) {
          await updateDoc(doc(db, "proveedores", editandoId), {
            nombre: nuevo.nombre,
            contacto: nuevo.contacto,
          });
          alert("Proveedor actualizado");
        } else {
          await addDoc(collection(db, "proveedores"), {
            nombre: nuevo.nombre,
            contacto: nuevo.contacto,
          });
          alert("Proveedor agregado");
        }
        obtenerProveedores();
      }

      setNuevo({ nombre: "", precio: "", contacto: "" });
      setEditandoId(null);

    } catch (e) {
      console.error("Error al guardar", e);
    }
  };

  const handleEditar = (item) => {
    setEditandoId(item.id);
    setNuevo(item);
  };

  const confirmarEliminar = async () => {
    try {
      await deleteDoc(doc(db, vista, idEliminar));
      vista === "productos" ? obtenerProductos() : obtenerProveedores();
      alert("Eliminado");
    } catch (e) {
      console.error(e);
    }
    setMostrarModal(false);
  };

  return (
    <div className="d-flex">

      {/* ====================== SIDEBAR ====================== */}
      <div
        className="border-end bg-light p-3"
        id="sidebar"
        style={{
          width: "230px",
          minHeight: "100vh",
        }}
      >
        {/* HEADER DEL SIDEBAR */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold m-0">Panel</h5>
        </div>

        {/* MENÚ PRINCIPAL */}
        <ul className="nav flex-column">

          {/* Productos */}
          <li className="nav-item mb-2">
            <button
              className={`btn w-100 text-start d-flex align-items-center gap-2 ${
                vista === "productos" ? "btn-primary text-white" : "btn-outline-primary"
              }`}
              onClick={() => setVista("productos")}
            >
              <i className="bi bi-box-seam"></i>
              <span className="sidebar-text">Productos</span>
            </button>
          </li>

          {/* Proveedores */}
          <li className="nav-item mb-3">
            <button
              className={`btn w-100 text-start d-flex align-items-center gap-2 ${
                vista === "proveedores" ? "btn-primary text-white" : "btn-outline-primary"
              }`}
              onClick={() => setVista("proveedores")}
            >
              <i className="bi bi-people"></i>
              <span className="sidebar-text">Proveedores</span>
            </button>
          </li>

          {/* SUBMENÚ */}
          <li className="nav-item">
            <button
              className="btn btn-outline-secondary w-100 text-start d-flex justify-content-between align-items-center"
              data-bs-toggle="collapse"
              data-bs-target="#submenuConfig"
            >
              <span>
                <i className="bi bi-gear"></i>{" "}
                <span className="sidebar-text">Configuración</span>
              </span>

              <i className="bi bi-chevron-down"></i>
            </button>

            <ul className="collapse ps-4 mt-2" id="submenuConfig">
              <li><a className="d-block py-1 text-secondary" href="#">Perfil</a></li>
              <li><a className="d-block py-1 text-secondary" href="#">Cambiar clave</a></li>
            </ul>
          </li>

          <hr />

          <LogoutButton />
        </ul>
      </div>

      {/* ====================== CONTENIDO ====================== */}
      <div className="container py-4" style={{ flexGrow: 1 }}>
        
        {/* FORMULARIO */}
        <div className="card p-3 shadow mb-4">
          <h5 className="fw-bold">
            {editandoId ? "Editar" : "Crear"} {vista === "productos" ? "Producto" : "Proveedor"}
          </h5>

          <form onSubmit={handleGuardar}>
            <div className="row g-2">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre"
                  value={nuevo.nombre}
                  onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                />
              </div>

              {vista === "productos" ? (
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Precio"
                    value={nuevo.precio}
                    onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
                  />
                </div>
              ) : (
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contacto"
                    value={nuevo.contacto}
                    onChange={(e) => setNuevo({ ...nuevo, contacto: e.target.value })}
                  />
                </div>
              )}

              <div className="col-md-4">
                <button className="btn btn-primary w-100">
                  {editandoId ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* LISTA */}
        <div className="card p-3 shadow">
          <h5 className="fw-bold">Lista de {vista}</h5>

          <ul className="list-group">
            {(vista === "productos" ? productos : proveedores).map((item) => (
              <li key={item.id} className="list-group-item d-flex justify-content-between">
                <span>
                  {vista === "productos"
                    ? `${item.nombre} - $${item.precio}`
                    : `${item.nombre} - ${item.contacto}`}
                </span>

                <div className="d-flex gap-2">
                  <button className="btn btn-warning btn-sm" onClick={() => handleEditar(item)}>
                    Editar
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setIdEliminar(item.id);
                      setMostrarModal(true);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* MODAL */}
        {mostrarModal && (
          <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">Confirmar eliminación</h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setMostrarModal(false)}
                  ></button>
                </div>

                <div className="modal-body">¿Seguro que deseas eliminar este registro?</div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setMostrarModal(false)}>
                    Cancelar
                  </button>
                  <button className="btn btn-danger" onClick={confirmarEliminar}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
