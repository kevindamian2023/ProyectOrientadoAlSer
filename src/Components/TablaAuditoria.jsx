import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.js";

export default function TablaAuditoria({ mostrar, onCerrar }) {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (mostrar) {
      obtenerAuditoria();
    }
  }, [mostrar]);

  const obtenerAuditoria = async () => {
    try {
      setCargando(true);
      const q = query(
        collection(db, "auditoria"),
        orderBy("fecha", "desc"),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const datos = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          fecha: data.fecha?.toDate ? data.fecha.toDate() : new Date(),
          inicioSesion: data.inicioSesion?.toDate ? data.inicioSesion.toDate() : null,
          finSesion: data.finSesion?.toDate ? data.finSesion.toDate() : null,
        };
      });
      setRegistros(datos);
    } catch (error) {
      console.error("Error al obtener auditoría:", error);
    } finally {
      setCargando(false);
    }
  };

  if (!mostrar) return null;

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerIconoAccion = (accion) => {
    switch (accion) {
      case "crear":
        return <i className="bi bi-plus-circle text-success"></i>;
      case "editar":
        return <i className="bi bi-pencil-square text-warning"></i>;
      case "eliminar":
        return <i className="bi bi-trash text-danger"></i>;
      case "login":
        return <i className="bi bi-box-arrow-in-right text-primary"></i>;
      case "logout":
        return <i className="bi bi-box-arrow-left text-secondary"></i>;
      default:
        return <i className="bi bi-circle"></i>;
    }
  };

  const calcularTiempoActivo = (inicioSesion, finSesion) => {
    if (!inicioSesion || !finSesion) return "N/A";
    
    const diferencia = new Date(finSesion) - new Date(inicioSesion);
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
    
    if (horas > 0) {
      return `${horas}h ${minutos}m ${segundos}s`;
    } else if (minutos > 0) {
      return `${minutos}m ${segundos}s`;
    } else {
      return `${segundos}s`;
    }
  };

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-clock-history me-2"></i>
              Historial de Auditoría
            </h5>
            <button
              className="btn-close btn-close-white"
              onClick={onCerrar}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-0">
            {cargando ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : registros.length === 0 ? (
              <div className="text-center p-5 text-muted">
                <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                <p>No hay registros de auditoría</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
<thead className="table-light sticky-top">
  <tr>
    <th style={{ width: "50px" }}>#</th>
    <th style={{ width: "80px" }}>Acción</th>
    <th style={{ width: "120px" }}>Tipo</th>
    <th style={{ width: "160px" }}>Inicio Sesión</th>
    <th style={{ width: "160px" }}>Fin Sesión</th>
    <th style={{ width: "120px" }}>Tiempo Activo</th>
    <th style={{ width: "150px" }}>Nombre/Correo</th>
  </tr>
</thead>

<tbody>
  {registros.map((registro, index) => (
    <tr key={registro.id}>
      <td className="text-muted">{index + 1}</td>
      <td className="text-center fs-5">
        {obtenerIconoAccion(registro.accion)}
      </td>
      <td>
        <span className={`badge ${
          registro.accion === "login" ? "bg-success" :
          registro.accion === "logout" ? "bg-danger" :
          "bg-secondary"
        }`}>
          {registro.tipo || "sistema"}
        </span>
      </td>
      <td className="text-muted small">
        {registro.inicioSesion
          ? formatearFecha(registro.inicioSesion)
          : "-"}
      </td>
      <td className="text-muted small">
        {registro.finSesion
          ? formatearFecha(registro.finSesion)
          : registro.accion === "login"
          ? <span className="badge bg-success">Activo</span>
          : "-"}
      </td>
      <td className="text-primary fw-bold">
        {registro.accion === "logout"
          ? calcularTiempoActivo(registro.inicioSesion, registro.finSesion)
          : registro.accion === "login"
          ? <span className="badge bg-info">En sesión</span>
          : "-"}
      </td>
      <td className="text-muted">
        {registro.usuario || "Sistema"}
      </td>
    </tr>
  ))}
</tbody>

                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light">
            <button className="btn btn-secondary" onClick={onCerrar}>
              Cerrar
            </button>
            <button
              className="btn btn-primary"
              onClick={obtenerAuditoria}
              disabled={cargando}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}