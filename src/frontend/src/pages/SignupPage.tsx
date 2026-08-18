import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { FormField } from "../components/auth/FormField";
import { PasswordField } from "../components/auth/PasswordField";
import { SubmitButton } from "../components/auth/SubmitButton";
import { useAuth } from "../hooks/useAuth";
import { fieldErrorsFrom, topLevelErrorFrom } from "../lib/fieldErrors";

export function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await signup(email, password, name, companyName);
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
          Te enviamos un enlace de verificación a <strong>{email}</strong>. Ábrelo para activar tu cuenta.
        </p>
        <Link to="/login" className="mt-4 inline-block text-sm text-slate-900 underline">
          Volver a iniciar sesión
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crea tu cuenta">
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="name"
          label="Nombre"
          type="text"
          autoComplete="name"
          required
          value={name}
          error={fieldErrors.name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          id="companyName"
          label="Nombre de la empresa"
          type="text"
          autoComplete="organization"
          required
          value={companyName}
          error={fieldErrors.companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
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
          autoComplete="new-password"
          required
          value={password}
          error={fieldErrors.password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <SubmitButton disabled={submitting}>{submitting ? "Creando…" : "Crear cuenta"}</SubmitButton>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link to="/login" className="text-slate-500 hover:text-slate-900">
          Ya tengo cuenta
        </Link>
      </div>
    </AuthLayout>
  );
}
