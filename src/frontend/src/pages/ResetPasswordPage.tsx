import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { PasswordField } from "../components/auth/PasswordField";
import { SubmitButton } from "../components/auth/SubmitButton";
import { api } from "../lib/api";
import { fieldErrorsFrom, topLevelErrorFrom } from "../lib/fieldErrors";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Falta el token de restablecimiento en el enlace.");
      return;
    }
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const fields = fieldErrorsFrom(err);
      if (Object.keys(fields).length > 0) {
        setFieldErrors(fields);
      } else {
        setError(topLevelErrorFrom(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthLayout title="Contraseña actualizada">
        <p className="text-sm text-green-700">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <Link to="/login" className="mt-4 inline-block text-sm text-slate-900 underline">
          Ir a iniciar sesión
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Nueva contraseña">
      <form onSubmit={handleSubmit} noValidate>
        <PasswordField
          id="password"
          label="Nueva contraseña"
          autoComplete="new-password"
          required
          value={password}
          error={fieldErrors.password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <SubmitButton disabled={submitting}>{submitting ? "Guardando…" : "Restablecer contraseña"}</SubmitButton>
      </form>
    </AuthLayout>
  );
}
