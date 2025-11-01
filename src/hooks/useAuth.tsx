import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type UserRole = "student" | "instructor" | "company" | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  availableRoles: UserRole[];
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    university: string,
    studentStatus: "current_student" | "graduated",
    role: UserRole
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  selectRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async (userId: string, retryCount = 0): Promise<void> => {
      try {
        const { data: rows, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);
        
        if (error) {
          console.error("Error fetching user role:", error);
          return;
        }
        
        if (rows && rows.length > 0) {
          const roles = rows.map(r => r.role as UserRole);
          setAvailableRoles(roles);
          console.log("User roles fetched:", roles);
          
          // Only auto-select if user has single role
          if (roles.length === 1) {
            setUserRole(roles[0]);
          } else {
            console.log("Multiple roles detected, awaiting user selection");
            setUserRole(null);
          }
        } else if (retryCount < 3) {
          // Retry after a short delay for signup scenarios
          console.log(`Role not found, retrying... (${retryCount + 1}/3)`);
          setTimeout(() => fetchUserRole(userId, retryCount + 1), 500);
        } else {
          console.warn("No role found for user after retries");
        }
      } catch (err) {
        console.error("Exception fetching user role:", err);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id, 0).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    university: string,
    studentStatus: "current_student" | "graduated",
    role: UserRole
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone: phone,
            university: university,
            student_status: studentStatus,
          }
        }
      });

      if (error) return { error };
      if (!data.user) return { error: new Error("User creation failed") };

      // Insert user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: data.user.id, role });

      if (roleError) return { error: roleError };

      // Explicitly fetch and set the role
      const { data: rows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      
      if (rows && rows.length > 0) {
        const roles = rows.map(r => r.role as UserRole);
        setAvailableRoles(roles);
        
        // Only auto-select if user has single role
        if (roles.length === 1) {
          setUserRole(roles[0]);
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setAvailableRoles([]);
    navigate("/");
  };

  const selectRole = (role: UserRole) => {
    if (availableRoles.includes(role)) {
      console.log("Role selected:", role);
      setUserRole(role);
    } else {
      console.error("Attempted to select unavailable role:", role);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, availableRoles, loading, signUp, signIn, signOut, selectRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
