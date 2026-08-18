import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { FormField } from "../components/auth/FormField";
import { SubmitButton } from "../components/auth/SubmitButton";
import { api } from "../lib/api";
import { fieldErrorsFrom, topLevelErrorFrom } from "../lib/fieldErrors";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setDone(true);
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
      <AuthLayout title="Revisa tu correo">
        <p className="text-sm text-slate-600">
          Si el correo <strong>{email}</strong> está registrado, recibirás instrucciones para restablecer tu
          contraseña.
        </p>
        <Link to="/login" className="mt-4 inline-block text-sm text-slate-900 underline">
          Volver a iniciar sesión
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Recupera tu contraseña" subtitle="Te enviaremos un enlace para restablecerla">
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          value={email}
          error={fieldErrors.email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <SubmitButton disabled={submitting}>{submitting ? "Enviando…" : "Enviar enlace"}</SubmitButton>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link to="/login" className="text-slate-500 hover:text-slate-900">
          Volver a iniciar sesión
        </Link>
      </div>
    </AuthLayout>
  );
}
