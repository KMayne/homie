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
  currentInventoryId: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  register: (name: string) => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setCurrentInventoryId: (id: string) => void;
  setInventories: (inventories: InventoryInfo[]) => void;
  addInventory: (inventory: InventoryInfo) => void;
  removeInventory: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    inventories: [],
    currentInventoryId: null,
    isLoading: true,
  });

  // Check if user is already logged in
  useEffect(() => {
    authApi
      .me()
      .then((data) => {
        const inventories = data.inventories ?? [];
        setState({
          user: data.user,
          inventories,
          currentInventoryId: inventories[0]?.id ?? null,
          isLoading: false,
        });
      })
      .catch(() => {
        setState({ user: null, inventories: [], currentInventoryId: null, isLoading: false });
      });
  }, []);

  const register = useCallback(async (name: string) => {
    // Get registration options from server
    const { options, tempId } = await authApi.registerStart(name);

    // Start WebAuthn registration
    const credential = await startRegistration({ optionsJSON: options });

    // Finish registration on server
    const result = await authApi.registerFinish(tempId, name, credential);

    const inventories = [{ id: result.inventoryId, name: "Inventory", isOwner: true }];
    setState({
      user: result.user,
      inventories,
      currentInventoryId: result.inventoryId,
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
      currentInventoryId: result.inventories[0]?.id ?? null,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setState({ user: null, inventories: [], currentInventoryId: null, isLoading: false });
  }, []);

  const setCurrentInventoryId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, currentInventoryId: id }));
  }, []);

  const setInventories = useCallback((inventories: InventoryInfo[]) => {
    setState((prev) => ({
      ...prev,
      inventories,
      // If current inventory was removed, switch to first one
      currentInventoryId: inventories.find((i) => i.id === prev.currentInventoryId)
        ? prev.currentInventoryId
        : inventories[0]?.id ?? null,
    }));
  }, []);

  const addInventory = useCallback((inventory: InventoryInfo) => {
    setState((prev) => ({
      ...prev,
      inventories: [...prev.inventories, inventory],
      currentInventoryId: inventory.id,
    }));
  }, []);

  const removeInventory = useCallback((id: string) => {
    setState((prev) => {
      const inventories = prev.inventories.filter((i) => i.id !== id);
      return {
        ...prev,
        inventories,
        currentInventoryId:
          prev.currentInventoryId === id
            ? inventories[0]?.id ?? null
            : prev.currentInventoryId,
      };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        setCurrentInventoryId,
        setInventories,
        addInventory,
        removeInventory,
      }}
    >
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
