import type { ButtonHTMLAttributes } from "react";

export function SubmitButton({ children, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      disabled={disabled}
      {...props}
      className="w-full rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
