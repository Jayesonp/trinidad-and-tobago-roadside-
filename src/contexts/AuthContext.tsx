import { PropsWithChildren, createContext, useEffect, useState, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthCtx = { user: User | null; session: Session | null };
export const AuthContext = createContext<AuthCtx>({ user: null, session: null });

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthCtx>({ user: null, session: null });

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setState({ user: session?.user ?? null, session })
    );
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
