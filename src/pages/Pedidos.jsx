import { useEffect, useState } from "react";
import api from "../api/client";

const ESTADOS = ["PENDIENTE", "ENVIADO"];

function EstadoStepper({ estado }) {
  const idx = ESTADOS.indexOf(estado);
  return (
    <div className="flex items-center gap-0 font-mono text-[10px] text-dim">
      {ESTADOS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                i <= idx ? "bg-signal" : "bg-line"
              }`}
            />
            <span className={i <= idx ? "text-paper" : ""}>{step}</span>
          </div>
          {i < ESTADOS.length - 1 && <div className="w-6 h-px bg-line mx-2" />}
        </div>
      ))}
    </div>
  );
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [usuarioId, setUsuarioId] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedPedido, setSelectedPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [detalleForm, setDetalleForm] = useState({ productoId: "", cantidad: 1 });

  async function cargarTodo() {
    setLoading(true);
    setError("");
    try {
      const [pedidosRes, usuariosRes, productosRes] = await Promise.all([
        api.get("/pedidos"),
        api.get("/usuarios"),
        api.get("/productos"),
      ]);
      setPedidos(pedidosRes.data);
      setUsuarios(usuariosRes.data);
      setProductos(productosRes.data);
    } catch {
      setError("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  async function handleCrearPedido(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/pedidos", {
        fecha: new Date().toISOString().split("T")[0].split("-").reverse().join("-"),
        total: 0,
        estado: "PENDIENTE",
        usuario: { id: parseInt(usuarioId, 10) },
      });
      setUsuarioId("");
      setShowForm(false);
      cargarTodo();
    } catch {
      setError("No se pudo crear el pedido.");
    } finally {
      setSaving(false);
    }
  }

  async function abrirPedido(pedido) {
    setSelectedPedido(pedido);
    try {
      const { data } = await api.get(`/detalles/pedido/${pedido.id}`);
      setDetalles(data);
    } catch {
      setDetalles([]);
    }
  }

  async function handleAgregarDetalle(e) {
    e.preventDefault();
    try {
      await api.post("/detalles", {
        cantidad: parseInt(detalleForm.cantidad, 10),
        pedido: { id: selectedPedido.id },
        producto: { id: parseInt(detalleForm.productoId, 10) },
      });
      setDetalleForm({ productoId: "", cantidad: 1 });
      const { data } = await api.get(`/detalles/pedido/${selectedPedido.id}`);
      setDetalles(data);
      cargarTodo(); // refresca el total del pedido
    } catch {
      setError("No se pudo agregar el producto al pedido.");
    }
  }

  if (selectedPedido) {
    return (
      <div>
        <button
          onClick={() => setSelectedPedido(null)}
          className="text-dim hover:text-paper text-sm mb-6 transition-colors"
        >
          ← Volver a pedidos
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold">
              Pedido #{selectedPedido.id}
            </h1>
            <p className="text-dim text-sm mt-1">{selectedPedido.fecha}</p>
          </div>
          <EstadoStepper estado={selectedPedido.estado} />
        </div>

        <div className="bg-panel border border-line rounded-lg p-6 mb-6">
          <h3 className="font-display font-semibold mb-4">Agregar producto</h3>
          <form onSubmit={handleAgregarDetalle} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-dim mb-1.5">Producto</label>
              <select
                required
                value={detalleForm.productoId}
                onChange={(e) =>
                  setDetalleForm({ ...detalleForm, productoId: e.target.value })
                }
                className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm"
              >
                <option value="">Seleccionar...</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — ${Number(p.precio).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-dim mb-1.5">Cantidad</label>
              <input
                required
                type="number"
                min="1"
                value={detalleForm.cantidad}
                onChange={(e) =>
                  setDetalleForm({ ...detalleForm, cantidad: e.target.value })
                }
                className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-signal text-ink text-sm font-medium px-4 py-2 rounded-md hover:bg-signal-dim transition-colors"
            >
              Agregar
            </button>
          </form>
        </div>

        <div className="bg-panel border border-line rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-dim text-xs font-mono uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Producto</th>
                <th className="text-right px-5 py-3 font-medium">Cantidad</th>
                <th className="text-right px-5 py-3 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-dim">
                    Sin productos agregados aún.
                  </td>
                </tr>
              ) : (
                detalles.map((d) => (
                  <tr key={d.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3">{d.producto?.nombre}</td>
                    <td className="px-5 py-3 text-right font-mono">{d.cantidad}</td>
                    <td className="px-5 py-3 text-right font-mono text-signal">
                      ${Number(d.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">Pedidos</h1>
          <p className="text-dim text-sm mt-1">Historial y estado de pedidos.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-signal text-ink text-sm font-medium px-4 py-2 rounded-md hover:bg-signal-dim transition-colors"
        >
          {showForm ? "Cancelar" : "+ Nuevo pedido"}
        </button>
      </div>

      {error && (
        <div className="mb-6 text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCrearPedido}
          className="mb-8 bg-panel border border-line rounded-lg p-6 flex gap-3 items-end"
        >
          <div className="flex-1">
            <label className="block text-xs font-medium text-dim mb-1.5">Cliente</label>
            <select
              required
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm"
            >
              <option value="">Seleccionar...</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} — {u.email}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-signal text-ink text-sm font-medium px-4 py-2 rounded-md hover:bg-signal-dim transition-colors disabled:opacity-60"
          >
            {saving ? "Creando..." : "Crear pedido"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-dim text-sm">Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p className="text-dim text-sm">No hay pedidos todavía.</p>
      ) : (
        <div className="bg-panel border border-line rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-dim text-xs font-mono uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">ID</th>
                <th className="text-left px-5 py-3 font-medium">Cliente</th>
                <th className="text-left px-5 py-3 font-medium">Fecha</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-right px-5 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => abrirPedido(p)}
                  className="border-b border-line last:border-0 cursor-pointer hover:bg-panel-2 transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-dim">#{p.id}</td>
                  <td className="px-5 py-3">{p.usuario?.nombre ?? "—"}</td>
                  <td className="px-5 py-3 text-dim">{p.fecha}</td>
                  <td className="px-5 py-3">
                    <EstadoStepper estado={p.estado} />
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-signal">
                    ${Number(p.total ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
