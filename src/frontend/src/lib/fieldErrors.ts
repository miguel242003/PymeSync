import { ApiError } from "./api";

export function fieldErrorsFrom(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || !err.details) return {};
  const result: Record<string, string> = {};
  for (const [field, messages] of Object.entries(err.details)) {
    if (messages?.[0]) result[field] = messages[0];
  }
  return result;
}

export function topLevelErrorFrom(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Ocurrió un error inesperado";
}
