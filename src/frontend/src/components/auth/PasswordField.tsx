import { useState, type InputHTMLAttributes } from "react";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function PasswordField({ label, error, id, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          {...props}
          className={`w-full rounded-lg border px-3 py-2 pr-16 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent ${
            error ? "border-red-300 focus:ring-red-500" : "border-slate-300 focus:ring-slate-900"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          tabIndex={-1}
        >
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
