import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ prevents page reload
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      const token = res.data.access_token;

      if (!token) {
        setError("Invalid server response — no token received.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      console.log("✅ Login successful!");
      navigate("/notes"); 
    } catch (err: any) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
      <h2 className="mb-4 text-light">Hello!</h2>

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control form-control-lg"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control form-control-lg"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-danger">{error}</p>}

        <button
          type="submit"
          className="btn-gradient w-100 py-2 fw-bold"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-3 text-light">
        Don’t have an account?{" "}
        <a href="/register" className="text-info">
          Register here
        </a>
      </p>
      </div>
    </div>
  );
};

export default Login;
