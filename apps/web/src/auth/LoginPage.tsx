import { useState } from "react";
import { useAuth } from "./context";

export function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await register(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Home Inventory</h1>

        <div className="login-tabs">
          <button
            className={`login-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        {mode === "login" ? (
          <div className="login-content">
            <p>Sign in with your passkey to access your inventories.</p>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="btn-passkey"
            >
              {isLoading ? "Signing in..." : "Sign in with Passkey"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="register-form">
            <p>Create an account to start tracking your belongings.</p>
            <div className="form-field">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-passkey"
            >
              {isLoading ? "Creating account..." : "Create Account with Passkey"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
