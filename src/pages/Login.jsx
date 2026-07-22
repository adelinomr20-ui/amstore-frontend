import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/productos");
    } catch {
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-ink">
      {/* Panel de marca */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-panel border-r border-line flex-col justify-between p-12 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-2xl">AM</span>
            <span className="font-display font-bold text-2xl text-signal">Store</span>
          </div>
        </div>

        <div className="relative z-10 max-w-sm">
          <h1 className="font-display text-3xl font-semibold leading-tight text-paper">
            Inventario y pedidos,
            <br />
            en un solo panel.
          </h1>
          <p className="text-dim mt-4 text-sm leading-relaxed">
            Gestiona productos, revisa el estado de cada pedido y controla el
            catálogo desde un mismo lugar.
          </p>

          {/* Elemento de firma: estado de pedido escalonado */}
          <div className="mt-10 flex items-center gap-0 font-mono text-[11px] text-dim">
            {["RECIBIDO", "PENDIENTE", "ENVIADO"].map((step, i) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      i === 0 ? "bg-ok" : i === 1 ? "bg-signal" : "bg-line"
                    }`}
                  />
                  <span className={i === 2 ? "text-line" : ""}>{step}</span>
                </div>
                {i < 2 && <div className="w-10 h-px bg-line mx-2 -mt-4" />}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-dim font-mono">
          conectado a spring boot · localhost:8080
        </p>
      </div>

      {/* Formulario */}
      <div className="flex-1 flex items-center justify-center px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-baseline gap-1.5">
            <span className="font-display font-bold text-xl">AM</span>
            <span className="font-display font-bold text-xl text-signal">Store</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-paper mb-1">
            Iniciar sesión
          </h2>
          <p className="text-dim text-sm mb-8">Ingresa con tu correo y contraseña.</p>

          <label className="block text-xs font-medium text-dim mb-1.5">Correo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@amstore.com"
            className="w-full mb-4 bg-panel border border-line rounded-md px-3.5 py-2.5 text-sm text-paper placeholder:text-dim/60"
          />

          <label className="block text-xs font-medium text-dim mb-1.5">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full mb-2 bg-panel border border-line rounded-md px-3.5 py-2.5 text-sm text-paper placeholder:text-dim/60"
          />

          {error && (
            <p className="text-danger text-xs mt-2 mb-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-signal text-ink font-medium text-sm rounded-md py-2.5 hover:bg-signal-dim transition-colors disabled:opacity-60"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>

          <p className="text-xs text-dim mt-6 font-mono">
            usuarios de prueba: admin@amstore.com / admin123
            <br />
            ana@gmail.com / 123456
          </p>
        </form>
      </div>
    </div>
  );
}
