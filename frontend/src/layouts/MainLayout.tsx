import { NavLink, Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
                    <span className="text-lg font-semibold tracking-tight">Logos</span>
                    <nav aria-label="Navegação principal">
                        <NavLink
                            to="/incidentes"
                            className={({ isActive }) =>
                                `rounded px-3 py-1.5 text-sm ${isActive
                                    ? "bg-slate-100 font-medium text-slate-900"
                                    : "text-slate-600 hover:text-slate-900"
                                }`
                            }
                        >
                            Incidentes
                        </NavLink>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}