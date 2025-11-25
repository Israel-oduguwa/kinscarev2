// global.d.ts (or types/global.d.ts)
export {};

type Role = "admin" | "provider" | "caregiver" | "agent";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Role;
      onboardingComplete?: boolean | "true" | "false";
      // optional extra fields if you add more metadata later
      [key: string]: unknown;
    };
  }
}

// Shared app types
export interface Thread {
  id: string;
  title: string;
  replies: number;
  views: number;
}

export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
