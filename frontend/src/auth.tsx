import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "./api";

const KEY = "prism.user";

interface AuthCtx {
  user: User | null;
  setUser: (u: User | null) => void;
  canApprove: boolean;
  canSubmit: boolean;
  canRecognise: boolean;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  setUser: () => {},
  canApprove: false,
  canSubmit: false,
  canRecognise: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  };

  useEffect(() => {
    /* keep storage in sync handled in setUser */
  }, [user]);

  const value = useMemo<AuthCtx>(() => {
    const role = user?.role ?? "";
    return {
      user,
      setUser,
      // Only PD (and Admin) can approve submissions.
      canApprove: ["PD", "Admin"].includes(role),
      // Only PM (and Admin) can edit/submit monthly actuals.
      canSubmit: ["PM", "Admin"].includes(role),
      // Only Finance (and Admin) can recognise & lock the period.
      canRecognise: ["Finance", "Admin"].includes(role),
    };
  }, [user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
