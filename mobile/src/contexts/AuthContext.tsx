import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { db, initDatabase } from "../database/database";

import {
  getSession,
  login,
  logout,
  register,
  type AuthUser,
} from "../services/authService";

type ContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (
    nome: string,
    email: string,
    senha: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const Context = createContext<ContextValue | null>(null);

function cacheUser(user: AuthUser) {
  db.runSync(
    `INSERT INTO usuarios
       (id, nome, email, telefone, criado_em)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       nome = excluded.nome,
       email = excluded.email,
       telefone = excluded.telefone`,
    [
      user.id,
      user.nome,
      user.email,
      user.telefone,
      user.criado_em,
    ]
  );
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDatabase();

    getSession()
      .then((session) => {
        if (session) {
          cacheUser(session.usuario);
        }

        setUser(session?.usuario ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (
    email: string,
    senha: string
  ) => {
    const session = await login(email, senha);
    cacheUser(session.usuario);
    setUser(session.usuario);
  };

  const signUp = async (
    nome: string,
    email: string,
    senha: string
  ) => {
    const session = await register(nome, email, senha);
    cacheUser(session.usuario);
    setUser(session.usuario);
  };

  const signOut = async () => {
    await logout();
    setUser(null);
  };

  return (
    <Context.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useAuth() {
  const value = useContext(Context);

  if (!value) {
    throw new Error("AuthProvider ausente");
  }

  return value;
}