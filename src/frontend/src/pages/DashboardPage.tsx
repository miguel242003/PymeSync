import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-sm w-full text-center">
        <h1 className="text-xl font-semibold text-slate-900">Hola, {user?.name}</h1>
        <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
        {user?.tenant && (
          <p className="mt-1 text-xs text-slate-400">Empresa: {user.tenant.name}</p>
        )}
        <p className="mt-6 text-xs text-slate-400">
          Sesión iniciada correctamente. El resto de la app (bandeja de mensajes) se construirá en los próximos
          milestones.
        </p>
        <button
          onClick={() => logout()}
          className="mt-6 w-full rounded-lg border border-slate-300 text-sm font-medium py-2.5 hover:bg-slate-50 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
