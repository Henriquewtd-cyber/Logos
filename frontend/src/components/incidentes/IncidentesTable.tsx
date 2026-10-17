import type { Incidente } from "./IncidentesForm";

type IncidentesTableProps = {
    incidentes: Incidente[];
    onEdit: (incidente: Incidente) => void;
    onDelete: (incidente: Incidente) => void;
};

const NEUTRAL_BADGE = "bg-slate-100 text-slate-700 ring-slate-200";

const CRITICIDADE_CLASS: Record<string, string> = {
    "Alta": "bg-red-100 text-red-800 ring-red-200",
    "Média": "bg-amber-100 text-amber-800 ring-amber-200",
    "Baixa": "bg-slate-100 text-slate-600 ring-slate-200",
};

const STATUS_DOT_CLASS: Record<string, string> = {
    "Aberto": "bg-blue-500",
    "Em Investigação": "bg-violet-500",
    "Fechado": "bg-slate-400",
    "Inconclusivo": "bg-white ring-1 ring-inset ring-slate-400",
};

export default function IncidentesTable({
    incidentes,
    onEdit,
    onDelete,
}: IncidentesTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Categoria
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Descrição
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Criticidade
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-right font-medium">
                            <span className="sr-only">Ações</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {incidentes.map((incidente) => {
                        const isAlta = incidente.criticidade === "Alta";
                        return (
                            <tr
                                key={incidente.id}
                                className={isAlta ? "bg-red-50/60" : "hover:bg-slate-50"}
                            >
                                <td
                                    className={`px-4 py-3 align-top font-medium text-slate-900 ${isAlta ? "shadow-[inset_3px_0_0_0_#dc2626]" : ""
                                        }`}
                                >
                                    {incidente.categoria}
                                </td>
                                <td className="max-w-md break-words px-4 py-3 align-top text-slate-700">
                                    {incidente.descricao}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 align-top">
                                    <span
                                        className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CRITICIDADE_CLASS[incidente.criticidade] ?? NEUTRAL_BADGE
                                            }`}
                                    >
                                        {incidente.criticidade}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 align-top text-slate-700">
                                    <span className="inline-flex items-center gap-2">
                                        <span
                                            aria-hidden="true"
                                            className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[incidente.status] ?? "bg-slate-300"
                                                }`}
                                        />
                                        {incidente.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-right align-top">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(incidente)}
                                        className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(incidente)}
                                        className="rounded px-2 py-1 text-slate-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}