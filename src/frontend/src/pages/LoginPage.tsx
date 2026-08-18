import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { FormField } from "../components/auth/FormField";
import { PasswordField } from "../components/auth/PasswordField";
import { SubmitButton } from "../components/auth/SubmitButton";
import { useAuth } from "../hooks/useAuth";
import { fieldErrorsFrom, topLevelErrorFrom } from "../lib/fieldErrors";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
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

  return (
    <AuthLayout title="Inicia sesión en tu cuenta">
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
        <PasswordField
          id="password"
          label="Contraseña"
          autoComplete="current-password"
          required
          value={password}
          error={fieldErrors.password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <SubmitButton disabled={submitting}>{submitting ? "Ingresando…" : "Ingresar"}</SubmitButton>
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <Link to="/forgot-password" className="text-slate-500 hover:text-slate-900">
          Olvidé mi contraseña
        </Link>
        <Link to="/signup" className="text-slate-500 hover:text-slate-900">
          Crear cuenta
        </Link>
      </div>
    </AuthLayout>
  );
}
