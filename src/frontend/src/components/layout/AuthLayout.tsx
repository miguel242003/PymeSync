import type { ReactNode } from "react";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">PymeSync</h1>
          <p className="mt-2 text-sm text-slate-500">{title}</p>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">{children}</div>
      </div>
    </div>
  );
}
