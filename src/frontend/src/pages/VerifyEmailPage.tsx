import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { api, ApiError } from "../lib/api";

type Status = "loading" | "success" | "error";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Falta el token de verificación en el enlace.");
      return;
    }

    api
      .get<{ message: string }>(`/auth/verify/${token}`)
      .then((data) => {
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "No se pudo verificar la cuenta");
      });
  }, [token]);

  return (
    <AuthLayout title="Verificación de cuenta">
      {status === "loading" && <p className="text-sm text-slate-500">Verificando…</p>}
      {status === "success" && <p className="text-sm text-green-700">{message}</p>}
      {status === "error" && <p className="text-sm text-red-600">{message}</p>}

      <Link to="/login" className="mt-4 inline-block text-sm text-slate-900 underline">
        Ir a iniciar sesión
      </Link>
    </AuthLayout>
  );
}
