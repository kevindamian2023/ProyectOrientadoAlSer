import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.js";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
        (r.correo || "").toLowerCase().includes(texto) ||
        (r.metodo || "").toLowerCase().includes(texto)
      );
    });
  };

  // 🔹 Exportar auditoría a Excel
  const exportarExcelAuditoria = () => {
    console.log("Iniciando exportación de auditoría a Excel...");
    try {
      const datos = filtrar(registros);
      console.log("Datos de auditoría a exportar:", datos);

      if (datos.length === 0) {
        alert("No hay datos de auditoría para exportar");
        return;
      }

      // Preparar datos para Excel
      const datosExcel = datos.map((item, index) => {
        return {
          "#": index + 1,
          Usuario: item.usuario || "Sin nombre",
          Correo: item.correo || "Sin correo",
          Método: item.metodo || "N/A",
          "Inicio de Sesión": item.inicioSesion ? formatearFecha(item.inicioSesion) : "-",
          "Fin de Sesión": item.finSesion ? formatearFecha(item.finSesion) : "En sesión",
          "Tiempo Activo": item.finSesion ? calcularTiempoActivo(item.inicioSesion, item.finSesion) : "En curso",
          Estado: item.finSesion ? "Finalizada" : "Activa"
        };
      });

      console.log("Datos formateados:", datosExcel);

      // Crear libro de trabajo
      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Auditoría");

      // Descargar archivo
      const nombreArchivo = `auditoria_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
      console.log("Descargando archivo:", nombreArchivo);
      XLSX.writeFile(wb, nombreArchivo);
      alert(`✅ Archivo Excel descargado: ${nombreArchivo}`);
    } catch (error) {
      console.error("Error al exportar auditoría a Excel:", error);
      alert(`Error al exportar a Excel: ${error.message}`);
    }
  };

  // 🔹 Exportar auditoría a PDF
  const exportarPDFAuditoria = () => {
    console.log("Iniciando exportación de auditoría a PDF...");
    try {
      const datos = filtrar(registros);
      console.log("Datos de auditoría a exportar:", datos);

      if (datos.length === 0) {
        alert("No hay datos de auditoría para exportar");
        return;
      }

      const doc = new jsPDF({ orientation: 'landscape' });

      // Título
      doc.setFontSize(18);
      doc.text("Historial de Sesiones - Auditoría", 14, 20);

      // Fecha
      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(`Total de registros: ${datos.length}`, 14, 34);

      // Preparar datos para la tabla
      const columnas = ["#", "Usuario", "Correo", "Método", "Inicio de Sesión", "Fin de Sesión", "Tiempo Activo", "Estado"];

      const filas = datos.map((item, index) => {
        return [
          index + 1,
          item.usuario || "Sin nombre",
          item.correo || "Sin correo",
          item.metodo || "N/A",
          item.inicioSesion ? formatearFecha(item.inicioSesion) : "-",
          item.finSesion ? formatearFecha(item.finSesion) : "En sesión",
          item.finSesion ? calcularTiempoActivo(item.inicioSesion, item.finSesion) : "En curso",
          item.finSesion ? "Finalizada" : "Activa"
        ];
      });

      console.log("Columnas:", columnas);
      console.log("Filas:", filas);

      // Crear tabla usando autoTable importado
      autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: 40,
        theme: 'grid',
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 30 },
          2: { cellWidth: 45 },
          3: { cellWidth: 25 },
          4: { cellWidth: 35 },
          5: { cellWidth: 35 },
          6: { cellWidth: 25 },
          7: { cellWidth: 20 }
        }
      });

      // Descargar PDF
      const nombreArchivo = `auditoria_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      console.log("Descargando archivo:", nombreArchivo);
      doc.save(nombreArchivo);
      alert(`✅ Archivo PDF descargado: ${nombreArchivo}`);
    } catch (error) {
      console.error("Error al exportar auditoría a PDF:", error);
      alert(`Error al exportar a PDF: ${error.message}`);
    }
  };

  if (!mostrar) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%'
    }}>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '16px 16px 0 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="bi bi-clock-history" style={{ fontSize: '28px' }}></i>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              Historial de Sesiones
            </h2>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
              {filtrar(registros).length} registro{filtrar(registros).length !== 1 ? 's' : ''} encontrado{filtrar(registros).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={onCerrar}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          ×
        </button>
      </div>

      {/* BUSCADOR Y BOTONES */}
      <div style={{
        padding: '20px 30px',
        background: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        gap: '15px',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <i className="bi bi-search" style={{
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6c757d',
            fontSize: '18px'
          }}></i>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o método de inicio de sesión..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 45px',
              border: '2px solid #dee2e6',
              borderRadius: '10px',
              fontSize: '15px',
              outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
          />
        </div>
        <button
          onClick={exportarExcelAuditoria}
          style={{
            padding: '12px 24px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#218838'}
          onMouseOut={(e) => e.target.style.background = '#28a745'}
        >
          📊 Excel
        </button>
        <button
          onClick={exportarPDFAuditoria}
          style={{
            padding: '12px 24px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#c82333'}
          onMouseOut={(e) => e.target.style.background = '#dc3545'}
        >
          📄 PDF
        </button>
        <button
          onClick={obtenerAuditoria}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#5568d3'}
          onMouseOut={(e) => e.target.style.background = '#667eea'}
        >
          <i className="bi bi-arrow-clockwise"></i>
          Actualizar
        </button>
      </div>

      {/* BODY - TABLA */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        background: 'white'
      }}>
        {cargando ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '20px'
          }}>
            <div className="spinner-border text-primary" style={{ width: '50px', height: '50px' }}></div>
            <p style={{ color: '#6c757d', fontSize: '16px' }}>Cargando registros...</p>
          </div>
        ) : filtrar(registros).length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6c757d'
          }}>
            <i className="bi bi-inbox" style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.3 }}></i>
            <p style={{ fontSize: '18px', margin: 0 }}>No hay registros que coincidan con tu búsqueda</p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead style={{
              position: 'sticky',
              top: 0,
              background: '#f8f9fa',
              zIndex: 10,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Usuario</th>
                <th style={thStyle}>Método</th>
                <th style={thStyle}>Inicio de Sesión</th>
                <th style={thStyle}>Fin de Sesión</th>
                <th style={thStyle}>Tiempo Activo</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filtrar(registros).map((r, index) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: '1px solid #e9ecef',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={tdStyle}>
                    <span style={{
                      background: '#e9ecef',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      {index + 1}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#212529', marginBottom: '4px' }}>
                        {r.usuario || "Sin nombre"}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6c757d' }}>
                        {r.correo || "Sin correo"}
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      background: '#d1ecf1',
                      color: '#0c5460',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {r.metodo || "N/A"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {r.inicioSesion ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="bi bi-calendar-check" style={{ color: '#28a745' }}></i>
                        {formatearFecha(r.inicioSesion)}
                      </div>
                    ) : "-"}
                  </td>
                  <td style={tdStyle}>
                    {r.finSesion ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="bi bi-calendar-x" style={{ color: '#dc3545' }}></i>
                        {formatearFecha(r.finSesion)}
                      </div>
                    ) : (
                      <span style={{ color: '#6c757d', fontStyle: 'italic' }}>En sesión</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      fontWeight: '700',
                      color: r.finSesion ? '#667eea' : '#28a745',
                      fontSize: '15px'
                    }}>
                      {r.finSesion ? calcularTiempoActivo(r.inicioSesion, r.finSesion) : "En curso"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: r.finSesion ? '#e9ecef' : '#d4edda',
                      color: r.finSesion ? '#495057' : '#155724'
                    }}>
                      {r.finSesion ? "Finalizada" : "● Activa"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FOOTER */}
      <div style={{
        padding: '15px 30px',
        background: '#f8f9fa',
        borderTop: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '0 0 16px 16px'
      }}>
        <div style={{ color: '#6c757d', fontSize: '14px' }}>
          <i className="bi bi-info-circle me-2"></i>
          Mostrando los últimos 200 registros
        </div>
        <button
          onClick={onCerrar}
          style={{
            padding: '10px 24px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#5a6268'}
          onMouseOut={(e) => e.target.style.background = '#6c757d'}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// Estilos para las celdas
const thStyle = {
  padding: '16px',
  textAlign: 'left',
  fontWeight: '700',
  color: '#495057',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tdStyle = {
  padding: '16px',
  color: '#212529'
};