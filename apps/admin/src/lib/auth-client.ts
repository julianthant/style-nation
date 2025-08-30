// Legacy file - redirects to new auth system
// This file is kept for compatibility during migration

import { authService } from './auth/authService';
import { tokenStorage } from './auth/tokenStorage';

/**
 * @deprecated Use the new auth system instead:
 * - import { useAuth } from '@/lib/auth/authContext';
 * - import { authService } from '@/lib/auth/authService';
 */
export const authClient = {
  signIn: authService.login.bind(authService),
  signOut: authService.logout.bind(authService),
  useSession: () => ({
    data: { user: tokenStorage.getUser() },
    status: tokenStorage.hasAccessToken() ? 'authenticated' : 'unauthenticated'
  })
};

/**
 * @deprecated Use useAuth hook instead
 */
export const { signIn, signOut, useSession } = authClient;