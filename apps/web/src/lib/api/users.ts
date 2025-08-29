interface UserData {
  supabaseId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface UserProfile {
  id: string;
  supabaseId: string;
  email: string;
  role: 'USER' | 'ADMIN';
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function ensureUserExists(userData: UserData): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      // If user already exists, that's fine - try to get the user instead
      if (response.status === 409) {
        return await getUserBySupabaseId(userData.supabaseId);
      }
      console.error('Failed to create user record:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return null;
  }
}

export async function getUserBySupabaseId(supabaseId: string): Promise<UserProfile | null> {
  try {
    // We'll need to add this endpoint to get user by supabaseId
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/by-supabase-id/${supabaseId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error('Failed to get user by supabaseId:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user by supabaseId:', error);
    return null;
  }
}

export async function getCurrentUser(accessToken: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error('Failed to get current user:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
