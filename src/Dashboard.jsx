import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js";
import LogoutButton from "./Components/LogoutButton.jsx";
import TablaAuditoria from "./Components/TablaAuditoria.jsx";
import { sessionManager } from "./Components/SessionManager.js";

export default function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [vista, setVista] = useState("productos");

  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", contacto: "" });
  const [editandoId, setEditandoId] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [idEliminar, setIdEliminar] = useState(null);

  const [mostrarAuditoria, setMostrarAuditoria] = useState(false);

  // SIDEBAR móvil open/close
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---------------- session init ----------------
  useEffect(() => {
    const inicializarSesion = async () => {
      if (!sessionManager.recuperarSesion()) {
        await sessionManager.registrarLogin();
      }
    };
    inicializarSesion();

    const handleBeforeUnload = () => sessionManager.registrarLogout();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ------------- auditoría helper --------------
  const registrarAuditoria = async (accion, tipo, descripcion) => {
    await sessionManager.registrarActividad(accion, tipo, descripcion);
  };

  // --------------- Firestore reads --------------
  const obtenerProductos = async () => {
    const query = await getDocs(collection(db, "productos"));
    setProductos(query.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const obtenerProveedores = async () => {
    const query = await getDocs(collection(db, "proveedores"));
    setProveedores(query.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (vista === "productos") obtenerProductos();
    else obtenerProveedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista]);

  // --------------- Guardar / Editar --------------
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (vista === "productos") {
        if (editandoId) {
          await updateDoc(doc(db, "productos", editandoId), {
            nombre: nuevo.nombre,
            precio: parseFloat(nuevo.precio),
          });
          await registrarAuditoria("editar", "productos", `Producto actualizado: ${nuevo.nombre}`);
          alert("Producto actualizado");
        } else {
          await addDoc(collection(db, "productos"), {
            nombre: nuevo.nombre,
            precio: parseFloat(nuevo.precio),
          });
          await registrarAuditoria("crear", "productos", `Producto creado: ${nuevo.nombre}`);
          alert("Producto agregado");
        }
        obtenerProductos();
      } else {
        if (editandoId) {
          await updateDoc(doc(db, "proveedores", editandoId), {
            nombre: nuevo.nombre,
            contacto: nuevo.contacto,
          });
          await registrarAuditoria("editar", "proveedores", `Proveedor actualizado: ${nuevo.nombre}`);
          alert("Proveedor actualizado");
        } else {
          await addDoc(collection(db, "proveedores"), {
            nombre: nuevo.nombre,
            contacto: nuevo.contacto,
          });
          await registrarAuditoria("crear", "proveedores", `Proveedor creado: ${nuevo.nombre}`);
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
      const itemEliminado = (vista === "productos" ? productos : proveedores)
        .find((item) => item.id === idEliminar);

      await deleteDoc(doc(db, vista, idEliminar));
      await registrarAuditoria("eliminar", vista, `${itemEliminado?.nombre ?? "Registro"}`);

      vista === "productos" ? obtenerProductos() : obtenerProveedores();
      alert("Eliminado");
    } catch (e) {
      console.error(e);
    }
    setMostrarModal(false);
  };
  

  // ----------------- JSX -----------------
  // Nota: incluimos un <style> con CSS puro para manejar el slide en móvil (Bootstrap + CSS)
  return (
    <div className="d-flex">

      {/* --------------------- CSS LOCAL (Bootstrap compatible) --------------------- */}
      <style>
        {`
          /* Evita scroll horizontal */
          body { overflow-x: hidden; }

          /* Sidebar básico */
          .dashboard-sidebar {
            width: 230px;
            z-index: 2000;
            background: #f8f9fa; /* bg-light */
            border-right: 1px solid rgba(0,0,0,0.08);
          }

          /* Desktop: sidebar estática */
          @media (min-width: 768px) {
            .dashboard-sidebar {
              position: fixed;
              left: 0;
              top: 0;
              height: 100vh;
              transform: none !important;
            }
            .dashboard-content {
              margin-left: 230px;
            }
            .dashboard-overlay { display: none !important; }
            .mobile-menu-button { display: none !important; }
          }

          /* Mobile: sidebar off-canvas by default, slides in */
          @media (max-width: 767.98px) {
            .dashboard-sidebar {
              position: fixed;
              left: 0;
              top: 0;
              height: 100vh;
              transform: translateX(-100%); /* hidden */
              transition: transform 0.28s ease-in-out;
            }
            .dashboard-sidebar.open {
              transform: translateX(0); /* visible */
            }

            /* overlay that sits above content when menu open */
            .dashboard-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.45);
              z-index: 1900;
            }

            /* ensure the open sidebar is above overlay */
            .dashboard-sidebar { z-index: 2000; }

            .mobile-menu-button { display: inline-block; }
          }
            /* Aumenta la prioridad del modal */
          .modal {
              z-index: 2000 !important;
          }

          /* Aumenta el fondo oscuro */
          .modal-backdrop {
              z-index: 1500 !important;
          }

          /* Mantén el sidebar por debajo del modal */
          #sidebar {
              z-index: 1000 !important;
          }
        `}
      </style>

      {/* ------------------ BOTÓN MENÚ MÓVIL ------------------ */}
      <button
        type="button"
        className="btn btn-primary mobile-menu-button d-md-none position-fixed m-3"
        style={{ zIndex: 2100 }}
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        ☰ Menú
      </button>

      {/* ------------------ SIDEBAR ------------------ */}
      {/* Desktop: visible; Mobile: off-canvas */}
      <div
        className={`dashboard-sidebar p-3 ${sidebarOpen ? "open" : ""}`}
        role="navigation"
        aria-label="Panel lateral"
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold m-0">Panel</h5>

          {/* botón cerrar visible sólo en móvil */}
          <button
            type="button"
            className="btn btn-danger btn-sm d-md-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            X
          </button>
        </div>

        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <button
              className={`btn w-100 text-start ${vista === "productos" ? "btn-primary text-white" : "btn-outline-primary"}`}
              onClick={() => { setVista("productos"); setSidebarOpen(false); }}
            >
              Productos
            </button>
          </li>

          <li className="nav-item mb-2">
            <button
              className={`btn w-100 text-start ${vista === "proveedores" ? "btn-primary text-white" : "btn-outline-primary"}`}
              onClick={() => { setVista("proveedores"); setSidebarOpen(false); }}
            >
              Proveedores
            </button>
          </li>

          <li className="nav-item mb-3">
            <button
              className="btn btn-outline-info w-100 text-start"
              onClick={() => { setMostrarAuditoria(true); setSidebarOpen(false); }}
            >
              Auditoría
            </button>
          </li>

          {/* LogoutButton ya es tu componente */}
          <div className="mt-2">
            <LogoutButton />
          </div>
        </ul>
      </div>

      {/* Overlay: solo aparece en móvil cuando sidebarOpen === true */}
      {sidebarOpen && (
        <div
          className="dashboard-overlay d-md-none"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ------------------ CONTENIDO (se mantiene siempre visible) ------------------ */}
      <div className="container py-4 dashboard-content" style={{ width: "100%" }}>
        {/* FORMULARIO */}
        <div className="card p-3 shadow mb-4">
          <h5 className="fw-bold">
            {editandoId ? "Editar" : "Crear"} {vista === "productos" ? "Producto" : "Proveedor"}
          </h5>

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
              <div className="col-12 col-md-4">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Precio"
                  value={nuevo.precio}
                  onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
                />
              </div>
            ) : (
              <div className="col-12 col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contacto"
                  value={nuevo.contacto}
                  onChange={(e) => setNuevo({ ...nuevo, contacto: e.target.value })}
                />
              </div>
            )}

            <div className="col-12 col-md-4">
              <button className="btn btn-primary w-100" onClick={handleGuardar}>
                {editandoId ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>

        {/* LISTA */}
        <div className="card p-3 shadow">
          <h5 className="fw-bold">Lista de {vista}</h5>

          <ul className="list-group">
            {(vista === "productos" ? productos : proveedores).map((item) => (
              <li
                key={item.id}
                className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center"
              >
                <span className="mb-2 mb-md-0">
                  {vista === "productos" ? `${item.nombre} - $${item.precio}` : `${item.nombre} - ${item.contacto}`}
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
                  <button className="btn-close btn-close-white" onClick={() => setMostrarModal(false)} />
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

        {/* AUDITORÍA */}
        <TablaAuditoria mostrar={mostrarAuditoria} onCerrar={() => setMostrarAuditoria(false)} />
      </div>
    </div>
  );
}
