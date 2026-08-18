export interface Tenant {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  tenantId?: string;
  tenant?: Tenant;
}

export interface ApiErrorBody {
  error?: string;
  details?: Record<string, string[]>;
}
