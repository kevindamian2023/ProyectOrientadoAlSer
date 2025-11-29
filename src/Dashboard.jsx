import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
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

  // 🔹 Exportar a Excel
  const exportarExcel = () => {
    console.log("Iniciando exportación a Excel...");
    try {
      const datos = vista === "productos" ? productos : proveedores;
      console.log("Datos a exportar:", datos);

      if (datos.length === 0) {
        alert("No hay datos para exportar");
        return;
      }

      // Preparar datos para Excel
      const datosExcel = datos.map((item) => {
        if (vista === "productos") {
          return {
            Nombre: item.nombre,
            Precio: `$${item.precio?.toFixed(2) || "0.00"}`
          };
        } else {
          return {
            Nombre: item.nombre,
            Contacto: item.contacto
          };
        }
      });

      console.log("Datos formateados:", datosExcel);

      // Crear libro de trabajo
      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, vista === "productos" ? "Productos" : "Proveedores");

      // Descargar archivo
      const nombreArchivo = `${vista}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
      console.log("Descargando archivo:", nombreArchivo);
      XLSX.writeFile(wb, nombreArchivo);
      alert(`✅ Archivo Excel descargado: ${nombreArchivo}`);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      alert(`Error al exportar a Excel: ${error.message}`);
    }
  };

  // 🔹 Exportar a PDF
  const exportarPDF = () => {
    console.log("Iniciando exportación a PDF...");
    try {
      const datos = vista === "productos" ? productos : proveedores;
      console.log("Datos a exportar:", datos);

      if (datos.length === 0) {
        alert("No hay datos para exportar");
        return;
      }

      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text(vista === "productos" ? "Lista de Productos" : "Lista de Proveedores", 14, 20);

      // Fecha
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 28);

      // Preparar datos para la tabla
      const columnas = vista === "productos"
        ? ["Nombre", "Precio"]
        : ["Nombre", "Contacto"];

      const filas = datos.map((item) => {
        if (vista === "productos") {
          return [item.nombre, `$${item.precio?.toFixed(2) || "0.00"}`];
        } else {
          return [item.nombre, item.contacto];
        }
      });

      console.log("Columnas:", columnas);
      console.log("Filas:", filas);

      // Crear tabla
      doc.autoTable({
        head: [columnas],
        body: filas,
        startY: 35,
        theme: 'grid',
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Descargar PDF
      const nombreArchivo = `${vista}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      console.log("Descargando archivo:", nombreArchivo);
      doc.save(nombreArchivo);
      alert(`✅ Archivo PDF descargado: ${nombreArchivo}`);
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
      alert(`Error al exportar a PDF: ${error.message}`);
    }
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
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button className="btn-export btn-excel" onClick={exportarExcel}>
          <span className="export-icon">📊</span>
          Exportar a Excel
        </button>
        <button className="btn-export btn-pdf" onClick={exportarPDF}>
          <span className="export-icon">📄</span>
          Exportar a PDF
        </button>
      </div>

      {/* Form Card */}
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

      {/* List Card */}
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

      {/* Modal */}
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
    </div>
  );
}
