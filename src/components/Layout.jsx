import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkBase =
  "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors";

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ink text-paper flex">
      <aside className="w-60 shrink-0 border-r border-line bg-panel flex flex-col">
        <div className="px-5 py-6 border-b border-line">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-lg tracking-tight">AM</span>
            <span className="font-display font-bold text-lg text-signal tracking-tight">
              Store
            </span>
          </div>
          <p className="text-xs text-dim mt-1 font-mono">panel de control</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <NavLink
            to="/productos"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive ? "bg-panel-2 text-signal" : "text-dim hover:text-paper hover:bg-panel-2"
              }`
            }
          >
            Productos
          </NavLink>
          <NavLink
            to="/pedidos"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive ? "bg-panel-2 text-signal" : "text-dim hover:text-paper hover:bg-panel-2"
              }`
            }
          >
            Pedidos
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/usuarios"
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive ? "bg-panel-2 text-signal" : "text-dim hover:text-paper hover:bg-panel-2"
                }`
              }
            >
              Usuarios
            </NavLink>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-line">
          <div className="px-2 mb-3">
            <p className="text-sm text-paper truncate">{user?.username}</p>
            <span
              className={`inline-block mt-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                isAdmin ? "bg-signal/15 text-signal" : "bg-ok/15 text-ok"
              }`}
            >
              {isAdmin ? "admin" : "cliente"}
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-2 py-2 text-sm text-dim hover:text-danger transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
