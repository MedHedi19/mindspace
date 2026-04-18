export interface AuthUser {
  userId: string;
}

export interface LoginResponse {
  ok: boolean;
  token: string;
  user: AuthUser;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000';

export async function loginWithId(userId: string, password: string): Promise<LoginResponse> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, password }),
    });
  } catch {
    throw new Error(`Cannot reach backend at ${BACKEND_URL}. Start the Flask server and try again.`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Login failed.');
  }

  return data as LoginResponse;
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(`Cannot reach backend at ${BACKEND_URL}. Start the Flask server and try again.`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Session validation failed.');
  }

  return data.user as AuthUser;
}

export async function logoutSession(token: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(`Cannot reach backend at ${BACKEND_URL}. Start the Flask server and try again.`);
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.error ?? 'Logout failed.');
  }
}
