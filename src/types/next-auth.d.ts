import "next-auth";
import "next-auth/jwt";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    isSuperAdmin?: boolean;
    isSupport?: boolean;
    tenantId?: string | null;
    tenantName?: string | null;
    role?: Role;
    hasMultipleTenants?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isSuperAdmin?: boolean;
      isSupport?: boolean;
      tenantId?: string | null;
      tenantName?: string | null;
      role?: Role;
      hasMultipleTenants?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isSuperAdmin?: boolean;
    isSupport?: boolean;
    tenantId?: string | null;
    tenantName?: string | null;
    role?: Role;
    hasMultipleTenants?: boolean;
  }
}
