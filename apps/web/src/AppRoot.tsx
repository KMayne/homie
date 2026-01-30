import { LoginPage, useAuth } from "./auth";
import { SyncProvider } from "./sync";
import { App } from "./ui/App";

export function AppRoot() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <SyncProvider>
      <App />
    </SyncProvider>
  );
}
