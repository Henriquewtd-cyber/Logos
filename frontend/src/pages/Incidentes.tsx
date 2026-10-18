import { useCallback, useEffect, useMemo, useState } from "react";
import IncidenteForm, {
    CATEGORIAS,
    CRITICIDADES,
    STATUS,
    type Incidente,
    type IncidenteValues,
} from "../components/incidentes/IncidentesForm";
import IncidentesTable from "../components/incidentes/IncidentesTable";
import { ToastContainer, useToast } from "../components/toast";
import { requisicaoProtegida } from "../services/auth";

type Filtros = { categoria: string; criticidade: string; status: string };

const FILTROS_VAZIOS: Filtros = { categoria: "", criticidade: "", status: "" };

const FILTROS_CONFIG: {
    campo: keyof Filtros;
    label: string;
    todos: string;
    opcoes: readonly string[];
}[] = [
        { campo: "categoria", label: "Categoria", todos: "Todas", opcoes: CATEGORIAS },
        { campo: "criticidade", label: "Criticidade", todos: "Todas", opcoes: CRITICIDADES },
        { campo: "status", label: "Status", todos: "Todos", opcoes: STATUS },
    ];

const CRITICIDADE_RANK: Record<string, number> = { Alta: 0, Média: 1, Baixa: 2 };

const selectClass =
    "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

function mensagemDeErro(error: unknown): string {
    if (error instanceof TypeError) return "Não foi possível conectar à API.";
    if (error instanceof Error) return error.message;
    return "Ocorreu um erro inesperado. Tente novamente.";
}

// Lê a mensagem de erro do FastAPI (`detail` como texto ou lista de erros).
async function lerErro(response: Response): Promise<string> {
    if (response.status === 404) {
        return "Incidente não encontrado. Ele pode ter sido removido por outro analista; atualize a lista.";
    }
    const data = await response.json().catch(() => null);
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) {
        return data.detail.map((d: { msg: string }) => d.msg).join("; ");
    }
    return `A API retornou um erro (${response.status}). Tente novamente.`;
}

// Campos que mudaram em relação ao original (para o PATCH).
function alterados(values: IncidenteValues, original: Incidente): Partial<IncidenteValues> {
    const changes: Partial<IncidenteValues> = {};
    for (const key of Object.keys(values) as (keyof IncidenteValues)[]) {
        if (values[key] !== original[key]) changes[key] = values[key];
    }
    return changes;
}

export default function Incidentes() {
    const { toasts, addToast, removeToast } = useToast();

    const [incidentes, setIncidentes] = useState<Incidente[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);

    const [formOpen, setFormOpen] = useState<boolean>(false);
    const [editing, setEditing] = useState<Incidente | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [toDelete, setToDelete] = useState<Incidente | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const carregar = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setLoadError(null);
        try {
            const response = await requisicaoProtegida("/incidentes", { signal });
            if (!response.ok) {
                setLoadError(await lerErro(response));
                return;
            }
            setIncidentes(await response.json());
        } catch (error) {
            if (signal?.aborted) return;
            setLoadError(mensagemDeErro(error));
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        void carregar(controller.signal);
        return () => controller.abort();
    }, [carregar]);

    const filtrosAtivos = Object.values(filtros).some((valor) => valor !== "");

    // Filtros combinados (E) + ordenação: criticidade alta primeiro, mais recentes antes.
    const visiveis = useMemo(() => {
        return incidentes
            .filter(
                (i) =>
                    (filtros.categoria === "" || i.categoria === filtros.categoria) &&
                    (filtros.criticidade === "" || i.criticidade === filtros.criticidade) &&
                    (filtros.status === "" || i.status === filtros.status),
            )
            .sort((a, b) => {
                const ra = CRITICIDADE_RANK[a.criticidade] ?? 3;
                const rb = CRITICIDADE_RANK[b.criticidade] ?? 3;
                return ra !== rb ? ra - rb : b.id - a.id;
            });
    }, [incidentes, filtros]);

    function abrirForm(incidente: Incidente | null) {
        setEditing(incidente);
        setFormError(null);
        setFormOpen(true);
    }

    const fecharForm = useCallback(() => {
        setFormOpen(false);
        setEditing(null);
        setFormError(null);
    }, []);

    const fecharExclusao = useCallback(() => {
        setToDelete(null);
        setDeleteError(null);
    }, []);

    // Esc fecha os diálogos, exceto durante uma requisição em andamento.
    useEffect(() => {
        if (!formOpen && !toDelete) return;
        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== "Escape") return;
            if (formOpen && !submitting) fecharForm();
            if (toDelete && !deleting) fecharExclusao();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [formOpen, toDelete, submitting, deleting, fecharForm, fecharExclusao]);

    async function handleSubmit(values: IncidenteValues) {
        if (submitting) return;

        // Edição: PATCH só com o que mudou. Sem mudanças, apenas fecha.
        const body = editing ? alterados(values, editing) : values;
        if (editing && Object.keys(body).length === 0) {
            fecharForm();
            return;
        }

        setSubmitting(true);
        setFormError(null);
        try {
            const response = await requisicaoProtegida(
                editing ? `/incidentes/${editing.id}` : "/incidentes/",
                {
                    method: editing ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                },
            );

            if (!response.ok) {
                setFormError(await lerErro(response));
                return;
            }

            const salvo: Incidente = await response.json();
            setIncidentes((prev) =>
                editing
                    ? prev.map((i) => (i.id === salvo.id ? salvo : i))
                    : [salvo, ...prev],
            );
            addToast(
                editing
                    ? "Incidente atualizado com sucesso."
                    : "Incidente cadastrado com sucesso.",
                "success",
            );
            fecharForm();
        } catch (error) {
            setFormError(mensagemDeErro(error));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!toDelete || deleting) return;
        const { id } = toDelete;

        setDeleting(true);
        setDeleteError(null);
        try {
            const response = await requisicaoProtegida(`/incidentes/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                setDeleteError(await lerErro(response));
                return;
            }

            setIncidentes((prev) => prev.filter((i) => i.id !== id));
            addToast("Incidente excluído com sucesso.", "success");
            fecharExclusao();
        } catch (error) {
            setDeleteError(mensagemDeErro(error));
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="space-y-5">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-semibold text-slate-900">Incidentes</h1>
                <button
                    type="button"
                    onClick={() => abrirForm(null)}
                    className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                    Novo incidente
                </button>
            </div>

            <section
                aria-label="Filtros"
                className="rounded-lg border border-slate-200 bg-white p-4"
            >
                <div className="grid gap-3 sm:grid-cols-3">
                    {FILTROS_CONFIG.map(({ campo, label, todos, opcoes }) => (
                        <div key={campo}>
                            <label
                                htmlFor={`filtro-${campo}`}
                                className="mb-1 block text-xs font-medium text-slate-500"
                            >
                                {label}
                            </label>
                            <select
                                id={`filtro-${campo}`}
                                value={filtros[campo]}
                                onChange={(e) =>
                                    setFiltros((f) => ({ ...f, [campo]: e.target.value }))
                                }
                                className={selectClass}
                            >
                                <option value="">{todos}</option>
                                {opcoes.map((opcao) => (
                                    <option key={opcao} value={opcao}>
                                        {opcao}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-500">
                        {loadError
                            ? "Lista indisponível"
                            : `Exibindo ${visiveis.length} de ${incidentes.length}`}
                    </span>
                    <div className="flex gap-2">
                        {filtrosAtivos && (
                            <button
                                type="button"
                                onClick={() => setFiltros(FILTROS_VAZIOS)}
                                className="rounded border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                            >
                                Limpar filtros
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => void carregar()}
                            disabled={loading}
                            className="rounded border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            {loading ? "Atualizando…" : "Atualizar lista"}
                        </button>
                    </div>
                </div>
            </section>

            {loading && incidentes.length === 0 && !loadError ? (
                <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Carregando incidentes…
                </p>
            ) : loadError ? (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700"
                >
                    <p>{loadError}</p>
                    <button
                        type="button"
                        onClick={() => void carregar()}
                        disabled={loading}
                        className="mt-3 rounded border border-red-300 bg-white px-3 py-1.5 text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                        Tentar novamente
                    </button>
                </div>
            ) : incidentes.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Nenhum incidente cadastrado.
                </p>
            ) : visiveis.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Nenhum incidente corresponde aos filtros selecionados.
                </p>
            ) : (
                <IncidentesTable
                    incidentes={visiveis}
                    onEdit={abrirForm}
                    onDelete={(incidente) => {
                        setDeleteError(null);
                        setToDelete(incidente);
                    }}
                />
            )}

            {formOpen && (
                <div className="overlay-entrada fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="form-titulo"
                        className="pagina-entrada max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 text-slate-900 shadow-lg"
                    >
                        <h2 id="form-titulo" className="mb-4 text-lg font-semibold text-slate-900">
                            {editing ? "Editar incidente" : "Novo incidente"}
                        </h2>
                        <IncidenteForm
                            key={editing?.id ?? "novo"}
                            incidente={editing}
                            submitting={submitting}
                            error={formError}
                            onSubmit={(values) => void handleSubmit(values)}
                            onCancel={fecharForm}
                        />
                    </div>
                </div>
            )}

            {toDelete && (
                <div className="overlay-entrada fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="exclusao-titulo"
                        className="pagina-entrada max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 text-slate-900 shadow-lg"
                    >
                        <h2 id="exclusao-titulo" className="text-lg font-semibold text-slate-900">
                            Excluir incidente?
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Esta ação não pode ser desfeita.
                        </p>
                        <p className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 [wrap:anywhere]">
                            <span className="font-medium">{toDelete.categoria}</span>
                            {" — "}
                            {toDelete.descricao}
                        </p>
                        {deleteError && (
                            <p
                                role="alert"
                                className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                            >
                                {deleteError}
                            </p>
                        )}
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={fecharExclusao}
                                disabled={deleting}
                                className="rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleDelete()}
                                disabled={deleting}
                                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? "Excluindo…" : "Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}