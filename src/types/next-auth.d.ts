import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extend the built-in session type to include custom properties
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      requirePasswordChange: boolean;
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user type to include custom properties
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    requirePasswordChange: boolean;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT type to include custom properties
   */
  interface JWT extends DefaultJWT {
    role?: string;
    requirePasswordChange?: boolean;
  }
}
