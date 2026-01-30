import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import {
  authApi,
  type UserInfo,
  type InventoryInfo,
} from "./api";

interface AuthState {
  user: UserInfo | null;
  inventories: InventoryInfo[];
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  register: (name: string) => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    inventories: [],
    isLoading: true,
  });

  // Check if user is already logged in
  useEffect(() => {
    authApi
      .me()
      .then((data) => {
        setState({
          user: data.user,
          inventories: data.inventories ?? [],
          isLoading: false,
        });
      })
      .catch(() => {
        setState({ user: null, inventories: [], isLoading: false });
      });
  }, []);

  const register = useCallback(async (name: string) => {
    // Get registration options from server
    const { options, tempId } = await authApi.registerStart(name);

    // Start WebAuthn registration
    const credential = await startRegistration({ optionsJSON: options });

    // Finish registration on server
    const result = await authApi.registerFinish(tempId, name, credential);

    setState({
      user: result.user,
      inventories: [{ id: result.inventoryId, isOwner: true }],
      isLoading: false,
    });
  }, []);

  const login = useCallback(async () => {
    // Get authentication options from server
    const { options, tempId } = await authApi.loginStart();

    // Start WebAuthn authentication
    const credential = await startAuthentication({ optionsJSON: options });

    // Finish login on server
    const result = await authApi.loginFinish(tempId, credential);

    setState({
      user: result.user,
      inventories: result.inventories,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setState({ user: null, inventories: [], isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
