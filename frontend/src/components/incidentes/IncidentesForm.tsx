import { useEffect, useRef, useState, type FormEvent } from "react";

export const CATEGORIAS = [
    "Acidente com Veículo",
    "Acidente com Vítimas",
    "Condição Climática Atípica na Pista",
    "Problema Mecânico",
    "Bloqueio de Pista",
] as const;

export const CRITICIDADES = ["Alta", "Média", "Baixa"] as const;

export const STATUS = [
    "Aberto",
    "Em Investigação",
    "Fechado",
    "Inconclusivo",
] as const;

export const DESCRICAO_MAX = 80;

export type Incidente = {
    id: number;
    categoria: string;
    criticidade: string;
    descricao: string;
    status: string;
};

export type IncidenteValues = Omit<Incidente, "id">;

type IncidenteFormProps = {
    incidente?: Incidente | null;
    submitting: boolean;
    error: string | null;
    onSubmit: (values: IncidenteValues) => void;
    onCancel: () => void;
};

const EMPTY: IncidenteValues = {
    categoria: "",
    criticidade: "",
    descricao: "",
    status: "Aberto",
};

const fieldClass =
    "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100";

// Mantém o valor atual selecionável mesmo que não esteja na lista conhecida.
function withCurrent(list: readonly string[], current: string): string[] {
    return current && !list.includes(current) ? [...list, current] : [...list];
}

export default function IncidenteForm({
    incidente,
    submitting,
    error,
    onSubmit,
    onCancel,
}: IncidenteFormProps) {
    const [values, setValues] = useState<IncidenteValues>(() =>
        incidente
            ? {
                categoria: incidente.categoria,
                criticidade: incidente.criticidade,
                descricao: incidente.descricao,
                status: incidente.status,
            }
            : EMPTY,
    );
    const descricaoRef = useRef<HTMLTextAreaElement>(null);

    // Mensagens da validação nativa do navegador para o que o `required` não cobre:
    // descrição só com espaços ou acima do limite (ex.: texto antigo já salvo).
    useEffect(() => {
        let mensagem = "";
        if (values.descricao.trim() === "") {
            mensagem = "Preencha este campo.";
        } else if (values.descricao.length > DESCRICAO_MAX) {
            mensagem = `A descrição deve ter no máximo ${DESCRICAO_MAX} caracteres.`;
        }
        descricaoRef.current?.setCustomValidity(mensagem);
    }, [values.descricao]);

    function update<K extends keyof IncidenteValues>(
        key: K,
        value: IncidenteValues[K],
    ) {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    // O navegador só dispara o submit se todos os campos forem válidos.
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        onSubmit({ ...values, descricao: values.descricao.trim() });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label
                    htmlFor="incidente-categoria"
                    className="mb-1 block text-sm font-medium text-slate-700"
                >
                    Categoria
                </label>
                <select
                    id="incidente-categoria"
                    required
                    disabled={submitting}
                    value={values.categoria}
                    onChange={(e) => update("categoria", e.target.value)}
                    className={fieldClass}
                >
                    <option value="" disabled>
                        Selecione…
                    </option>
                    {withCurrent(CATEGORIAS, values.categoria).map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="incidente-criticidade"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        Criticidade
                    </label>
                    <select
                        id="incidente-criticidade"
                        required
                        disabled={submitting}
                        value={values.criticidade}
                        onChange={(e) => update("criticidade", e.target.value)}
                        className={fieldClass}
                    >
                        <option value="" disabled>
                            Selecione…
                        </option>
                        {withCurrent(CRITICIDADES, values.criticidade).map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="incidente-status"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        Status
                    </label>
                    <select
                        id="incidente-status"
                        required
                        disabled={submitting}
                        value={values.status}
                        onChange={(e) => update("status", e.target.value)}
                        className={fieldClass}
                    >
                        {withCurrent(STATUS, values.status).map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label
                    htmlFor="incidente-descricao"
                    className="mb-1 block text-sm font-medium text-slate-700"
                >
                    Descrição
                </label>
                <textarea
                    id="incidente-descricao"
                    ref={descricaoRef}
                    required
                    rows={4}
                    maxLength={DESCRICAO_MAX}
                    disabled={submitting}
                    value={values.descricao}
                    onChange={(e) => update("descricao", e.target.value)}
                    className={`${fieldClass} resize-y`}
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>Máximo de {DESCRICAO_MAX} caracteres.</span>
                    <span
                        className={
                            values.descricao.length > DESCRICAO_MAX ? "text-red-700" : ""
                        }
                    >
                        {values.descricao.length}/{DESCRICAO_MAX}
                    </span>
                </div>
            </div>

            {error && (
                <p
                    role="alert"
                    className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                    {error}
                </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                >
                    {submitting ? "Salvando…" : incidente ? "Salvar alterações" : "Cadastrar"}
                </button>
            </div>
        </form>
    );
}