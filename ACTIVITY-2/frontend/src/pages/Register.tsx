import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { name, email, password });
      setMessage("✅ Registration successful! You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setMessage("⚠️ Registration failed. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control mb-3"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control mb-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control mb-3"
            required
          />
          <button type="submit" className="btn-gradient w-100 py-2 fw-bold">
            Register
          </button>
        </form>

        {message && <p className="text-light mt-3 text-center">{message}</p>}

        <div className="text-center mt-4">
          <p className="text-light">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="btn btn-link text-info p-0 fw-bold"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
