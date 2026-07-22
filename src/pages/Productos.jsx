import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  imagenUrl: "",
  categoria: "PC",
};

// Medidor de stock: 10 segmentos, cada uno representa ~10% del nivel definido como "stock saludable"
function StockMeter({ stock }) {
  const healthy = 20; // referencia de stock "lleno"
  const filled = Math.max(0, Math.min(10, Math.round((stock / healthy) * 10)));
  const color = stock === 0 ? "bg-danger" : stock < 5 ? "bg-signal" : "bg-ok";

  return (
    <div>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-sm ${i < filled ? color : "bg-line"}`}
          />
        ))}
      </div>
      <p className="font-mono text-[11px] text-dim mt-1.5">
        {stock} {stock === 1 ? "unidad" : "unidades"}
      </p>
    </div>
  );
}

export default function Productos() {
  const { isAdmin } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargarProductos() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/productos");
      setProductos(data);
    } catch {
      setError("No se pudieron cargar los productos. ¿Está corriendo el backend?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  async function handleCrear(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/productos", {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock, 10),
      });
      setForm(emptyForm);
      setShowForm(false);
      cargarProductos();
    } catch {
      setError("No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await api.delete(`/productos/${id}`);
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("No se pudo eliminar el producto.");
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">Productos</h1>
          <p className="text-dim text-sm mt-1">Catálogo de PCs y móviles.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-signal text-ink text-sm font-medium px-4 py-2 rounded-md hover:bg-signal-dim transition-colors"
          >
            {showForm ? "Cancelar" : "+ Nuevo producto"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCrear}
          className="mb-8 bg-panel border border-line rounded-lg p-6 grid grid-cols-2 gap-4"
        >
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-dim mb-1.5">Nombre</label>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-dim mb-1.5">Categoría</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm"
            >
              <option value="PC">PC</option>
              <option value="MOVIL">MÓVIL</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-dim mb-1.5">Descripción</label>
            <input
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Precio</label>
            <input
              required
              type="number"
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Stock</label>
            <input
              required
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm font-mono"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-dim mb-1.5">URL de imagen</label>
            <input
              value={form.imagenUrl}
              onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-signal text-ink text-sm font-medium px-4 py-2 rounded-md hover:bg-signal-dim transition-colors disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar producto"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-dim text-sm">Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p className="text-dim text-sm">No hay productos todavía.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos.map((p) => (
            <div
              key={p.id}
              className="bg-panel border border-line rounded-lg p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-dim">
                  {p.categoria}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleEliminar(p.id)}
                    className="text-dim hover:text-danger text-xs transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <h3 className="font-display font-semibold text-paper mb-1">{p.nombre}</h3>
              {p.descripcion && (
                <p className="text-dim text-sm mb-4 line-clamp-2">{p.descripcion}</p>
              )}
              <div className="mt-auto">
                <p className="font-mono text-lg text-signal mb-3">
                  ${Number(p.precio).toFixed(2)}
                </p>
                <StockMeter stock={p.stock ?? 0} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
