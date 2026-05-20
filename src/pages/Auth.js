import { useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState("student");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const ADMIN_SECRET = "dS@94!";

  const isValidEmail = (email) => {
    return email.endsWith("@vitapstudent.ac.in");
  };

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setError("Use only college email");
      return;
    }

    setError("");
    try {
      if (isNew) {

  // ❌ Wrong admin key
  if (role === "admin" && secretKey !== ADMIN_SECRET) {
    setError("Invalid admin secret key");
    return;
  }

  // ✅ Create account
  const userCredential =
    await createUserWithEmailAndPassword(auth, email, password);

  // ✅ Save role in Firestore
  await setDoc(doc(db, "users", userCredential.user.uid), {
    email,
    role
  });

  alert("Account created!");

} else {

  // 👨‍💼 Admin login validation FIRST
  

  // ❌ Empty email
  if (!email) {
    setError("Please enter email");
    return;
  }

  // ❌ Empty password
  if (!password) {
    setError("Please enter password");
    return;
  }

  // ✅ Login user first
  const userCredential =
    await signInWithEmailAndPassword(auth, email, password);

  const uid = userCredential.user.uid;

  // ✅ Get user role from Firestore
  const userDoc = await getDoc(doc(db, "users", uid));

  // ❌ No Firestore data
  if (!userDoc.exists()) {

  // 👨‍🎓 Student login
  if (role === "student") {

    // ✅ Automatically create student role
    await setDoc(doc(db, "users", uid), {
      email,
      role: "student"
    });

  }

  // 👨‍💼 Admin login
  else {

    await signOut(auth);
    setError("Admin account data missing");
    return;

  }
}

  const updatedUserDoc = await getDoc(doc(db, "users", uid));
  const userData = updatedUserDoc.data();

  // =========================
  // 👨‍💼 ADMIN LOGIN
  // =========================
  if (role === "admin") {


    // ❌ student trying admin login
   if (userData.role !== "admin") {

  localStorage.removeItem("isAdminMode");
  localStorage.removeItem("loginRole");

  setError("No access to admin login");

  await signOut(auth);

  return;
}

// ✅ ONLY REAL ADMINS REACH HERE

if (!secretKey) {

  setError("Please enter admin secret key");

  await signOut(auth);

  return;
}

if (secretKey !== ADMIN_SECRET) {

  setError("Invalid admin secret key");

  await signOut(auth);

  return;
}
  }

  // =========================
  // 👨‍🎓 STUDENT LOGIN
  // =========================
  
  if (role === "admin") {

  localStorage.setItem("isAdminMode", "true");
  localStorage.setItem("loginRole", "admin");

} else {

  localStorage.setItem("isAdminMode", "false");
  localStorage.setItem("loginRole", "student");

}
}
    } catch (err) {

  if (
    err.message.includes("auth/invalid-credential")
  ) {

    setError("Invalid email or password");

  } else {

    setError(err.message);

  }

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

<div style={{
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  marginBottom: "20px"
}}>
  <label>
    <input
      type="radio"
      value="student"
      checked={role === "student"}
      onChange={(e) => {
  setRole(e.target.value);
  setError("");
}}
    />
    Student
  </label>

  <label>
    <input
      type="radio"
      value="admin"
      checked={role === "admin"}
      onChange={(e) => {
  setRole(e.target.value);
  setError("");
}}
    />
    Admin
  </label>
</div>

      <input
        type="email"
        placeholder="College Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
          marginBottom: "15px"
        }}
      />
      {role === "admin" && (
  <input
    type="password"
    placeholder="Enter Admin Secret Key"
    value={secretKey}
    onChange={(e) => setSecretKey(e.target.value)}
    style={{
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      boxSizing: "border-box",
      marginBottom: "15px"
    }}
  />
)}

      <div style={{ position: "relative", marginBottom: "15px" }}>

  <input
    type={showPass ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={{
      width: "100%",
      padding: "12px",
      paddingRight: "40px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      boxSizing: "border-box"
    }}
  />

  <span
    onClick={() => setShowPass(!showPass)}
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      fontSize: "16px",
      color: "#555"
    }}
  >
    👁
  </span>

</div>
      {error && (
  <p style={{
    color: "red",
    textAlign: "center",
    marginBottom: "10px",
    fontSize: "14px"
  }}>
    {error}
  </p>
)}
      <button
        onClick={handleSubmit}
        style={{
  width: "100%",
  marginTop: "15px",   // ✅ spacing fix
  padding: "12px",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "8px",
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