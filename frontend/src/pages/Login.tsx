import { useState, type FormEvent } from "react";

export type LoginCredentials = {
    email: string;
    senha: string;
};

type LoginProps = {
    // Deve rejeitar (throw) com uma Error de mensagem legível quando o login falhar.
    onSubmit: (credentials: LoginCredentials) => Promise<void> | void;
};

const fieldClass =
    "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100";

export default function Login({ onSubmit }: LoginProps) {
    const [email, setEmail] = useState<string>("");
    const [senha, setSenha] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isValid = email.trim() !== "" && senha !== "";

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting || !isValid) return;

        setSubmitting(true);
        setError(null);
        try {
            await onSubmit({ email: email.trim(), senha });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível entrar. Tente novamente.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-900">
            <div className="w-full max-w-sm">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Logos
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Gestão operacional de incidentes logísticos
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-sm"
                >
                    <h2 className="text-lg font-semibold text-slate-900">Entrar</h2>

                    <div>
                        <label
                            htmlFor="login-email"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            E-mail
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            autoComplete="username"
                            required
                            autoFocus
                            disabled={submitting}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={fieldClass}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="login-senha"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Senha
                        </label>
                        <input
                            id="login-senha"
                            type="password"
                            autoComplete="current-password"
                            required
                            disabled={submitting}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className={fieldClass}
                        />
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || !isValid}
                        className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                    >
                        {submitting ? "Entrando…" : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}