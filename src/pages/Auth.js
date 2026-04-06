import { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNew, setIsNew] = useState(false);

  const isValidEmail = (email) => {
    return email.endsWith("@vitapstudent.ac.in");
  };

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      alert("Use only college email");
      return;
    }

    try {
      if (isNew) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(to right, #4facfe, #00f2fe)",
    fontFamily: "Arial, sans-serif"
  }}>

    <div style={{
      background: "white",
      padding: "30px",
      borderRadius: "12px",
      width: "320px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
    }}>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {isNew ? "Create Account" : "Login"}
      </h2>

      <input
        type="email"
        placeholder="College Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "1px solid #ccc"
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "1px solid #ccc"
        }}
      />

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "10px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        {isNew ? "Sign Up" : "Login"}
      </button>

      <p
        onClick={() => setIsNew(!isNew)}
        style={{
          marginTop: "15px",
          textAlign: "center",
          color: "#007bff",
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        {isNew
          ? "Already have an account? Login"
          : "New user? Create account"}
      </p>

    </div>
  </div>
);
}