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
  <div
  style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
"linear-gradient(135deg,#edf4ff 0%,#f3f8ff 40%,#ffffff 100%)",
    fontFamily: "Arial, sans-serif",
    position: "relative",
overflow: "hidden"
  }}
>
  <div
  style={{
    position: "absolute",
    top: "-80px",
    left: "-80px",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    border: "5px solid #4f7cff",
    opacity: 0.4
  }}
></div>
  <div
  style={{
    position: "absolute",
    bottom: "-70px",
    right: "-70px",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    border: "4px solid #b8cbff",
    opacity: 0.5
  }}
></div>

<div
  style={{
    position: "absolute",
    top: "220px",
    left: "680px",
    color: "#7aa6ff",
    fontSize: "14px",
    lineHeight: "10px",
    opacity: 0.6
  }}
>
  • • • •<br/>
  • • • •<br/>
  • • • •<br/>
  • • • •
</div>

<div
  style={{
    position: "absolute",
    bottom: "120px",
    left: "50px",
    color: "#7aa6ff",
    fontSize: "14px",
    lineHeight: "10px",
    opacity: 0.6
  }}
>
  • • • •<br/>
  • • • •<br/>
  • • • •<br/>
  • • • •
</div>

    <div
  style={{
    display: "flex",
    width: "100%",
    maxWidth: "1100px",
    minHeight: "650px",
    background:
"linear-gradient(135deg,#f5f9ff,#ffffff)",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow:
"0 20px 60px rgba(0,0,0,0.10)"
  }}
>

  <div
  style={{
    flex: 1.2,
    padding: "60px",
    background:
      "linear-gradient(135deg,#edf4ff,#f5f9ff)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden"
  }}
>
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "30px"
  }}
>
  <div
    style={{
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      background: "#eef4ff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "24px"
    }}
  >
    🎓
  </div>

  <div>
    <h2
      style={{
        margin: 0
      }}
    >
      Campus
      <span
        style={{
          color: "#3b82f6"
        }}
      >
        {" "}Hub
      </span>
    </h2>

    <p
      style={{
        margin: 0,
        color: "#666"
      }}
    >
      Discover. Connect. Participate.
    </p>
  </div>
</div>

<h1
  style={{
    fontSize: "72px",
fontWeight: "800",
    margin: 0,
    lineHeight: 1.05
  }}
>
  Welcome
  <br />
  <span style={{ color: "#3b82f6" }}>
    Back!
  </span>
</h1>

<div
  style={{
    width: "80px",
    height: "6px",
    background: "#3b82f6",
    borderRadius: "10px",
    marginTop: "20px",
    marginBottom: "30px"
  }}
></div>

  <p
    style={{
      marginTop: "25px",
      fontSize: "20px",
      color: "#555",
      maxWidth: "500px"
    }}
  >
    Find empty classrooms, discover campus events and connect with teammates and game mates effortlessly.
  </p>

  <div
    style={{
      marginTop: "40px",
      background: "rgba(255,255,255,0.75)",
backdropFilter: "blur(12px)",
border: "1px solid rgba(255,255,255,0.7)",
      padding: "16px",
      borderRadius: "16px",
      width: "320px",
      boxShadow:
        "0 4px 15px rgba(0,0,0,0.08)"
    }}
  >
    🛡️ Secure & Trusted
    <br />
    <span
      style={{
        color: "#666",
        fontSize: "14px"
      }}
    >
      Your data is encrypted and safe.
    </span>
    <div
  style={{
    position: "absolute",
    bottom: "-30px",
    left: "50px",
    width: "450px",
    height: "140px",
    background:
      "linear-gradient(180deg, rgba(59,130,246,0.15), transparent)",
    borderRadius: "120px 120px 0 0",
    filter: "blur(25px)"
  }}
></div>
  </div>
</div>

      <div
  style={{
    width: "450px",
    minHeight: "600px",
    padding: "35px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "white",
    borderRadius: "36px",
    margin: "0 40px",
    boxShadow:
  "0 25px 60px rgba(59,130,246,0.12)"
  }}
>
    <div
  style={{
    position: "absolute",
    top: "70px",
    left: "120px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#c7d8ff"
  }}
/>

<div
  style={{
    position: "absolute",
    top: "90px",
    right: "120px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#c7d8ff"
  }}
/>
    <div
  style={{
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background:
"linear-gradient(135deg,#eef4ff,#dbeafe)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 20px",
    fontSize: "30px",
    boxShadow:
      "0 5px 15px rgba(59,130,246,0.25)"
  }}
>
  🔒
</div>
      <h2
  style={{
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "42px",
    fontWeight:"700",
    color: "#0f172a"
  }}
>
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

      <div
  style={{
    position: "relative",
    marginBottom: "15px"
  }}
>
  <span
    style={{
      position: "absolute",
      left: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#666"
    }}
  >
    ✉️
  </span>

  <input
    type="email"
    placeholder="College Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    style={{
      width: "100%",
      padding: "14px",
      paddingLeft: "45px",
      background: "#f8fafc",
      fontSize: "15px",
      borderRadius: "12px",
      border: "1px solid #ddd",
      boxSizing: "border-box"
    }}
  />
</div>
      {role === "admin" && (
  <div
    style={{
      position: "relative",
      marginBottom: "15px"
    }}
  >
    <span
      style={{
        position: "absolute",
        left: "15px",
        top: "50%",
        transform: "translateY(-50%)"
      }}
    >
      🔑
    </span>

    <input
      type="password"
      placeholder="Enter Admin Secret Key"
      value={secretKey}
      onChange={(e) => setSecretKey(e.target.value)}
      style={{
        width: "100%",
        padding: "14px",
        paddingLeft: "45px",
        background: "#f8fafc",
        fontSize: "15px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        boxSizing: "border-box"
      }}
    />
  </div>
)}

      <div style={{ position: "relative", marginBottom: "15px" }}>

  <input
    type={showPass ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={{
      width: "100%",
      padding: "14px",
      background: "#f8fafc",
      fontSize: "15px",
      paddingLeft: "45px",
      paddingRight: "40px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      boxSizing: "border-box"
    }}
  />
  <span
  style={{
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)"
  }}
>
  🔒
</span>
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
  padding: "18px",
  background:
"linear-gradient(90deg,#4f8cff,#2d5bff)",
  color: "white",
  border: "none",
  fontSize: "16px",
borderRadius: "12px",
boxShadow:
  "0 5px 15px rgba(59,130,246,0.3)",
  cursor: "pointer",
  fontWeight: "bold"
}}
      >
        {isNew ? "Sign Up" : "Login"}
      </button>

      <div
  style={{
    display: "flex",
    alignItems: "center",
    marginTop: "25px",
    marginBottom: "20px"
  }}
>
  <div
    style={{
      flex: 1,
      height: "1px",
      background: "#ddd"
    }}
  />

  <span
    style={{
      margin: "0 12px",
      color: "#777"
    }}
  >
    or
  </span>

  <div
    style={{
      flex: 1,
      height: "1px",
      background: "#ddd"
    }}
  />
</div>

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
  </div>
);
}