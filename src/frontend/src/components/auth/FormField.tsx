import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, ...props }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent ${
          error ? "border-red-300 focus:ring-red-500" : "border-slate-300 focus:ring-slate-900"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
