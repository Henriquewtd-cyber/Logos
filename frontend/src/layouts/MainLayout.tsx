import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout, obterToken, requisicaoProtegida } from "../services/auth";
import { ToastContainer, useToast } from "../components/toast";

type UsuarioLogado = { nome: string };

const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded px-3 py-1.5 text-sm ${isActive
        ? "bg-slate-100 font-medium text-slate-900"
        : "text-slate-600 hover:text-slate-900"
    }`;

export default function MainLayout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { toasts, addToast, removeToast } = useToast();
    const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

    // Lido a cada render; o layout re-renderiza a cada mudança de rota (useLocation).
    const logado = obterToken() !== null;

    // Busca o nome do usuário logado (GET /me) ao entrar e a cada troca de rota.
    useEffect(() => {
        if (!obterToken()) return;

        const controller = new AbortController();

        async function carregarUsuario() {
            try {
                const response = await requisicaoProtegida("/usuarios/me", {
                    signal: controller.signal,
                });
                if (!response.ok) return;
                const data: UsuarioLogado = await response.json();
                if (!controller.signal.aborted) setUsuario(data);
            } catch {
                // Sem o nome, o cabeçalho segue funcionando (e um 401 já leva ao login).
            }
        }

        void carregarUsuario();
        return () => controller.abort();
    }, [pathname]);


    function navegarParaIncidentes() {
        if (!obterToken()) {
            addToast("Você precisa entrar para acessar os incidentes.", "error");
            return;
        }

        navigate("/incidentes");
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
                    <span className="text-lg font-semibold tracking-tight">Logos</span>

                    <nav aria-label="Navegação principal">
                        <NavLink
                            to="/incidentes"
                            onClick={(event) => {
                                event.preventDefault();
                                navegarParaIncidentes();
                            }}
                            className={linkClass}
                        >
                            Incidentes
                        </NavLink>
                        {!logado && (
                            <NavLink to="/login" className={linkClass}>
                                Login
                            </NavLink>
                        )}
                    </nav>

                    {logado && (
                        <div className="ml-auto flex min-w-0 items-center gap-3">
                            {usuario && (
                                <span className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                                    <span
                                        aria-hidden="true"
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700"
                                    >
                                        {usuario.nome.trim().charAt(0).toUpperCase()}
                                    </span>
                                    <span className="sr-only">Usuário logado:</span>
                                    <span
                                        className="max-w-32 truncate sm:max-w-xs"
                                        title={usuario.nome}
                                    >
                                        {usuario.nome}
                                    </span>
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => logout()}
                                className="shrink-0 rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main key={pathname} className="pagina-entrada mx-auto max-w-6xl px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}