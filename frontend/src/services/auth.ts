const API_URL = import.meta.env.VITE_API_URL as string;

export function obterToken(): string | null {
    return localStorage.getItem("token");
}

export function logout(): void {
    localStorage.removeItem("token");
    window.location.href = "/login";
}

export async function requisicaoProtegida(
    endpoint: string,
    options: RequestInit = {},
): Promise<Response> {
    const token = obterToken();

    if (!token) {
        logout();
        throw new Error("Usuário não autenticado.");
    }

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        logout();
        throw new Error("Sessão expirada. Faça login novamente.");
    }

    return response;
}