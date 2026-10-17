
export default function NotFound() {
    return (
        <div className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                404 - Página não encontrada
            </h1>
            <p className="max-w-md text-slate-700">
                A página que você está tentando acessar não existe. Verifique se o endereço está correto ou volte para a página inicial.
            </p>
            <a
                href="/"
                className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
                Voltar para a página inicial
            </a>
        </div>
    );
}