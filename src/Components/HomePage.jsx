import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "./Navbar";
import "./HomePage.css";

export default function HomePage() {
    const [productos, setProductos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // Cargar productos
    const obtenerProductos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "productos"));
            const docs = [];
            querySnapshot.forEach((doc) => {
                docs.push({ id: doc.id, ...doc.data() });
            });
            setProductos(docs);
        } catch (error) {
            console.error("Error al obtener productos:", error);
        }
    };

    // Cargar proveedores
    const obtenerProveedores = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "proveedores"));
            const docs = [];
            querySnapshot.forEach((doc) => {
                docs.push({ id: doc.id, ...doc.data() });
            });
            setProveedores(docs);
        } catch (error) {
            console.error("Error al obtener proveedores:", error);
        }
    };

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            await Promise.all([obtenerProductos(), obtenerProveedores()]);
            setLoading(false);
        };
        cargarDatos();
    }, []);

    // Filtrar productos por búsqueda
    const productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="homepage">
            <Navbar />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Bienvenido a Mi Tienda</h1>
                    <p className="hero-subtitle">
                        Explora nuestro catálogo de productos y proveedores
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-info">
                            <h3 className="stat-number">{productos.length}</h3>
                            <p className="stat-label">Productos</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏢</div>
                        <div className="stat-info">
                            <h3 className="stat-number">{proveedores.length}</h3>
                            <p className="stat-label">Proveedores</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3 className="stat-number">
                                ${productos.reduce((sum, p) => sum + (p.precio || 0), 0).toFixed(2)}
                            </h3>
                            <p className="stat-label">Valor Total</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="products-section">
                <div className="section-header">
                    <h2 className="section-title">Nuestros Productos</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="🔍 Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {productosFiltrados.length === 0 ? (
                    <div className="empty-message">
                        <p>📭 No se encontraron productos</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {productosFiltrados.map((producto) => (
                            <div key={producto.id} className="product-card">
                                <div className="product-icon">🛍️</div>
                                <h3 className="product-name">{producto.nombre}</h3>
                                <p className="product-price">${producto.precio?.toFixed(2) || "0.00"}</p>
                                <div className="product-badge">Disponible</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Suppliers Section */}
            <section className="suppliers-section">
                <div className="section-header">
                    <h2 className="section-title">Nuestros Proveedores</h2>
                </div>

                {proveedores.length === 0 ? (
                    <div className="empty-message">
                        <p>📭 No hay proveedores registrados</p>
                    </div>
                ) : (
                    <div className="suppliers-grid">
                        {proveedores.map((proveedor) => (
                            <div key={proveedor.id} className="supplier-card">
                                <div className="supplier-header">
                                    <div className="supplier-icon">🏢</div>
                                    <div className="supplier-info">
                                        <h3 className="supplier-name">{proveedor.nombre}</h3>
                                        <p className="supplier-contact">📞 {proveedor.contacto}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="homepage-footer">
                <p>© 2025 Mi Tienda - Todos los derechos reservados</p>
            </footer>
        </div>
    );
}
