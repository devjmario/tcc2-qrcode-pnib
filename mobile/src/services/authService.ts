import * as SecureStore from "expo-secure-store";
import { API_URL } from "./apiConfig";

export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  criado_em: string;
};

type Session = {
  usuario: AuthUser;
  token: string;
  expiresAt: number;
};

const SESSION_KEY = "tcc_auth_session_v1";
const OWNER_KEY = "tcc_device_owner_v1";

function expires(token: string): number {
  try {
    const part = token
      .split(".")[0]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const obj = JSON.parse(atob(part));
    return obj.exp * 1000;
  } catch {
    return 0;
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);

    if (!raw) return null;

    const session = JSON.parse(raw) as Session;

    if (
      !session.token ||
      !session.usuario?.id ||
      session.expiresAt <= Date.now()
    ) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function logout() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

async function request(
  path: string,
  body: object
): Promise<Session> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API. O primeiro login exige conexão com o servidor."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.erro || `Erro HTTP ${response.status}`
    );
  }

  const session: Session = {
    usuario: data.usuario,
    token: data.token,
    expiresAt: expires(data.token),
  };

  if (!session.expiresAt) {
    throw new Error("Resposta de autenticação inválida.");
  }

  const owner = await SecureStore.getItemAsync(OWNER_KEY);

  if (owner && owner !== session.usuario.id) {
    throw new Error(
      "Este dispositivo contém dados vinculados a outra conta. Use a conta original; a troca de contas requer migração/isolamento dos dados."
    );
  }

  if (!owner) {
    await SecureStore.setItemAsync(
      OWNER_KEY,
      session.usuario.id
    );
  }

  await SecureStore.setItemAsync(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return session;
}

export const login = (email: string, senha: string) =>
  request("/auth/login", { email, senha });

export const register = (
  nome: string,
  email: string,
  senha: string
) =>
  request("/auth/register", { nome, email, senha });