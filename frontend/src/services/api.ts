
const API_URL = import.meta.env.VITE_API_URL;

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
    /\/+$/,
    "",
);

export function errorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Ocorreu um erro inesperado. Tente novamente.";
}

// Extrai a mensagem de erro do FastAPI (`detail` como texto ou lista de erros).
export function parseErrorBody(text: string, status: number): string {
    if (status === 404) {
        return "Incidente não encontrado. Ele pode ter sido removido por outro analista; atualize a lista.";
    }
    try {
        const body = JSON.parse(text) as { detail?: unknown };
        if (typeof body.detail === "string") return body.detail;
        if (Array.isArray(body.detail)) {
            const msgs = body.detail
                .map((d) => (d && typeof d === "object" && "msg" in d ? String(d.msg) : ""))
                .filter(Boolean);
            if (msgs.length > 0) return msgs.join("; ");
        }
    } catch {
        // corpo não é JSON; usa mensagem genérica abaixo
    }
    return `A API retornou um erro (${status}). Tente novamente.`;
}

export async function request<T>(
    path: string,
    init?: RequestInit,
): Promise<T | undefined> {
    if (!API_BASE) {
        throw new Error(
            "A variável de ambiente VITE_API_URL não está configurada. Defina-a no arquivo .env e reinicie o servidor de desenvolvimento.",
        );
    }

    let response: Response;
    try {
        response = await fetch(`${API_BASE}${path}`, {
            ...init,
            headers: {
                ...(init?.body ? { "Content-Type": "application/json" } : {}),
                ...init?.headers,
            },
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
        }
        throw new Error(
            "Não foi possível conectar à API. Verifique sua conexão e tente novamente.",
        );
    }

    const text = await response.text(); // 204 No Content resulta em texto vazio
    if (!response.ok) throw new Error(parseErrorBody(text, response.status));
    if (!text) return undefined;

    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error("A API retornou uma resposta inválida.");
    }
}