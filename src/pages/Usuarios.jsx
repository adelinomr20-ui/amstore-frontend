import { useEffect, useState } from "react";
import api from "../api/client";

const emptyForm = { nombre: "", email: "", password: "", direccion: "", rol: "CLIENTE" };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargarUsuarios() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/usuarios");
      setUsuarios(data);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function handleCrear(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/usuarios", form);
      setForm(emptyForm);
      setShowForm(false);
      cargarUsuarios();
    } catch {
      setError("No se pudo crear el usuario.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">Usuarios</h1>
          <p className="text-dim text-sm mt-1">Clientes y administradores registrados.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-signal text-ink text-sm font-medium px-4 py-2 rounded-md hover:bg-signal-dim transition-colors"
        >
          {showForm ? "Cancelar" : "+ Nuevo usuario"}
        </button>
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
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Nombre</label>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Contraseña</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Rol</label>
            <select
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm"
            >
              <option value="CLIENTE">CLIENTE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-dim mb-1.5">Dirección</label>
            <input
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-signal text-ink text-sm font-medium px-4 py-2 rounded-md hover:bg-signal-dim transition-colors disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar usuario"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-dim text-sm">Cargando usuarios...</p>
      ) : (
        <div className="bg-panel border border-line rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-dim text-xs font-mono uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Nombre</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Dirección</th>
                <th className="text-left px-5 py-3 font-medium">Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">{u.nombre}</td>
                  <td className="px-5 py-3 text-dim">{u.email}</td>
                  <td className="px-5 py-3 text-dim">{u.direccion || "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                        u.rol === "ADMIN" ? "bg-signal/15 text-signal" : "bg-ok/15 text-ok"
                      }`}
                    >
                      {u.rol || "cliente"}
                    </span>
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
