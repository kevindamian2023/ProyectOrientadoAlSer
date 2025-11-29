import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.js";

export default function TablaAuditoria({ mostrar, onCerrar }) {
  const [registros, setRegistros] = useState([]);
  const [filtro, setFiltro] = useState("");
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
        orderBy("inicioSesion", "desc"),
        limit(200)
      );
      const snapshot = await getDocs(q);

      const datos = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          inicioSesion: data.inicioSesion?.toDate
            ? data.inicioSesion.toDate()
            : null,
          finSesion: data.finSesion?.toDate
            ? data.finSesion.toDate()
            : null,
        };
      });

      setRegistros(datos);
    } catch (error) {
      console.error("Error al obtener auditoría:", error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularTiempoActivo = (inicio, fin) => {
    if (!inicio || !fin) return "N/A";

    const diff = new Date(fin) - new Date(inicio);
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m " : ""}${s}s`;
  };

  const filtrar = (lista) => {
    return lista.filter((r) => {
      const texto = filtro.toLowerCase();
      return (
        (r.usuario || "").toLowerCase().includes(texto) ||
        (r.metodo || "").toLowerCase().includes(texto)
      );
    });
  };

  if (!mostrar) return null;

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">

          {/* HEADER */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-clock-history me-2"></i>
              Historial de Sesiones
            </h5>
            <button className="btn-close btn-close-white" onClick={onCerrar}></button>
          </div>

          {/* BUSCADOR */}
          <div className="p-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, correo o método (Google, correo, Facebook...)"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          {/* BODY */}
          <div className="modal-body p-0">
            {cargando ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : filtrar(registros).length === 0 ? (
              <div className="text-center p-5 text-muted">
                <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                <p>No hay registros</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">

                  <thead className="table-light sticky-top">
                    <tr>
                      <th>#</th>
                      <th>Usuario</th>
                      <th>Método</th>
                      <th>Inicio</th>
                      <th>Fin</th>
                      <th>Tiempo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtrar(registros).map((r, index) => (
                      <tr key={r.id}>
                        <td>{index + 1}</td>
                        <td>
  <div className="fw-bold">
    {r.usuario || "Sin nombre"}
  </div>
  <div className="text-muted small">
    {r.correo || "Sin correo"}
  </div>
</td>

                        <td>
                          <span className="badge bg-info text-dark">
                            {r.metodo || "N/A"}
                          </span>
                        </td>
                        <td>{r.inicioSesion ? formatearFecha(r.inicioSesion) : "-"}</td>
                        <td>{r.finSesion ? formatearFecha(r.finSesion) : "-"}</td>
                        <td className="fw-bold text-primary">
                          {r.finSesion ? calcularTiempoActivo(r.inicioSesion, r.finSesion) : "En sesión"}
                        </td>
                        <td>
                          <span
                            className={`badge ${r.finSesion ? "bg-secondary" : "bg-success"
                              }`}
                          >
                            {r.finSesion ? "Finalizada" : "Activa"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer bg-light">
            <button className="btn btn-secondary" onClick={onCerrar}>
              Cerrar
            </button>
            <button className="btn btn-primary" onClick={obtenerAuditoria}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Actualizar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
