import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js";

export default function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [vista, setVista] = useState("productos"); // productos | proveedores

  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", contacto: "" });
  const [editandoId, setEditandoId] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [idEliminar, setIdEliminar] = useState(null);

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
    vista === "productos" ? obtenerProductos() : obtenerProveedores();
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
    <div className="container py-4">
      {/* Botones de vista */}
      <div className="d-flex justify-content-center mb-4">
        <button
          className={`btn me-2 ${vista === "productos" ? "btn-primary" : "btn-outline-primary"
            }`}
          onClick={() => setVista("productos")}
        >
          Productos
        </button>
        <button
          className={`btn ${vista === "proveedores" ? "btn-primary" : "btn-outline-primary"
            }`}
          onClick={() => setVista("proveedores")}
        >
          Proveedores
        </button>
      </div>

      {/* Formulario */}
      <div className="card p-3 shadow mb-4">
        <h5 className="fw-bold">
          {editandoId ? "Editar" : "Crear"}{" "}
          {vista === "productos" ? "Producto" : "Proveedor"}
        </h5>
        <form onSubmit={handleGuardar}>
          <div className="row g-2">
            <div className="col-12 col-md-4">
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
                  onChange={(e) =>
                    setNuevo({ ...nuevo, contacto: e.target.value })
                  }
                />
              </div>
            )}
            <div className="col-md-4">
              <button className="btn btn-primary w-100" type="submit">
                {editandoId ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Listado */}
      <div className="card p-3 shadow">
        <h5 className="fw-bold">Lista de {vista}</h5>
        <ul className="list-group">
          {(vista === "productos" ? productos : proveedores).map((item) => (
            <li
              key={item.id}
              className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center"
            >
              <span>
                {vista === "productos"
                  ? `${item.nombre} - $${item.precio}`
                  : `${item.nombre} - ${item.contacto}`}
              </span>
              <div className="d-flex flex-wrap gap-2 justify-content-end">
                <button className="btn btn-sm btn-warning" onClick={() => handleEditar(item)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => abrirModal(item.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal confirmación */}
      {mostrarModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">⚠️ Confirmar eliminación</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMostrarModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  ¿Estás seguro de que deseas eliminar este registro?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={confirmarEliminar}>
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
