// =============================================================================
// DevSync AI — Express Request Augmentation
// Adds the `user` property injected by the authenticate middleware.
// =============================================================================

export type AuthUserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  role: AuthUserRole;
}

declare global {
  namespace Express {
    interface Request {
      /** Populated by the `authenticate` middleware on protected routes. */
      user?: AuthenticatedUser;
    }
  }
}
