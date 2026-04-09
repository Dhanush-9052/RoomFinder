import { useState } from "react";
import AddClassroom from "../components/AddClassroom";
import ClassroomList from "../components/ClassroomList";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useEffect, useRef } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "firebase/auth";

export default function Home() {
  const [showAdd, setShowAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null); 
  const addRef = useRef(null); 
  const user = auth.currentUser;
  const firstLetter = user?.email?.charAt(0).toUpperCase();
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmPassword, setConfirmPassword] = useState("");
  useEffect(() => {
  function handleClickOutside(event) {

    // 👉 Close profile popup
    if (
      profileRef.current &&
      !profileRef.current.contains(event.target)
    ) {
      setShowProfile(false);
    }

    // 👉 Close add classroom popup
    if (
      addRef.current &&
      !addRef.current.contains(event.target)
    ) {
      setShowAdd(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
  
  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleVerifyOldPassword = async () => {
  const user = auth.currentUser;

  if (!user) return;

  try {
    const credential = EmailAuthProvider.credential(
      user.email,
      oldPassword
    );

    await reauthenticateWithCredential(user, credential);

    // ✅ correct → go to step 2
    setStep(2);

  } catch (error) {
    alert("Wrong old password ❌");
  }
};

  const handleUpdatePassword = async () => {
  const user = auth.currentUser;

  if (!user) return;

  // ❌ check match
  if (newPassword !== confirmPassword) {
    alert("Passwords do not match ❌");
    return;
  }

  try {
    await updatePassword(user, newPassword);

    alert("Password updated successfully ✅");

    // reset everything
    setShowPassword(false);
    setStep(1);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

  } catch (error) {
    alert(error.message);
  }
};

  return (
    <div style={{
  background: darkMode ? "#1e1e2f" : "#f5f6fa",
  minHeight: "100vh",
  color: darkMode ? "white" : "black"
}}>

      {/* 🔝 HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 25px",
        background: darkMode ? "#2c2c3e" : "white",
color: darkMode ? "white" : "black",
        borderBottom: "1px solid #ddd"
      }}>
        <h2>Available Classrooms</h2>

        {/* 🔒 LOGOUT RIGHT */}
        <div ref={profileRef} style={{ position: "relative" }}>

  {/* 🔵 ROUND ICON */}
  <div
    onClick={(e) => {
  e.stopPropagation();
  setShowProfile(!showProfile);
}}
    style={{
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "#007bff",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      cursor: "pointer"
    }}
  >
    {firstLetter}
  </div>

  {/* 📦 POPUP */}
  {showProfile && (
    <div
  style={{
    position: "absolute",
    top: "55px",
    right: "10px",
    background: darkMode ? "#2c2c3e" : "white",
color: darkMode ? "white" : "black",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
    width: "280px",
    zIndex: 999
  }}
>
  {/* 👤 PROFILE ICON */}
  <div style={{ textAlign: "center", marginBottom: "15px" }}>
    <div
      style={{
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "#ff4d6d",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        margin: "0 auto"
      }}
    >
      {firstLetter}
    </div>

    <h3 style={{ margin: "10px 0 5px 0" }}>
      {user.email.split("@")[0]}
    </h3>

    <p style={{ fontSize: "12px", color: "gray" }}>
      {user.email}
    </p>
  </div>

  <button
  onClick={() => setDarkMode(!darkMode)}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    background: darkMode ? "#444" : "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>
  <button
  onClick={() => setShowPassword(true)}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  🔑 Change Password
</button>

  {/* 🔒 LOGOUT BUTTON */}
  <button
    onClick={handleLogout}
    style={{
      width: "100%",
      padding: "10px",
      background: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer"
    }}
  >
    Logout
  </button>
</div>
  )}

</div>
      </div>

      {/* 📦 MAIN CONTENT */}
      <div style={{
        display: "flex",
        padding: "20px",
        gap: "20px"
      }}>
        
        {/* 📋 CLASSROOM LIST */}
        <div style={{ flex: 3 }}>
          <ClassroomList darkMode={darkMode} />
        </div>

      </div>

      {/* ➕ FLOAT BUTTON */}
      <button
        onClick={(e) => {
  e.stopPropagation();
  setShowAdd(!showAdd);
}}
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          fontSize: "28px",
          background: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        +
      </button>

      {/* ➕ POPUP */}
      {showAdd && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)", // 🔥 overlay
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}
  >
    {/* 🧱 CENTER BOX */}
    <div
      ref={addRef}
      style={{
        background: darkMode ? "#2c2c3e" : "white",
        color: darkMode ? "white" : "black",
        padding: "25px",
        borderRadius: "12px",
        width: "350px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
      }}
    >
      <AddClassroom
        darkMode={darkMode}
        onAdd={() => setShowAdd(false)}
      />
    </div>
  </div>

  
)}
{showPassword && (
  <div
    onClick={() => setShowPassword(false)}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: darkMode ? "#2c2c3e" : "white",
        color: darkMode ? "white" : "black",
        padding: "25px",
        borderRadius: "12px",
        width: "350px"
      }}
    >
      <h2 style={{ textAlign: "center" }}>Change Password</h2>

      {/* 🧱 STEP 1 UI */}
      {step === 1 && (
        <>
          <div style={{ position: "relative", marginTop: "15px" }}>

  <input
    type={showPass ? "text" : "password"}
    placeholder="Enter old password"
    value={oldPassword}
    onChange={(e) => setOldPassword(e.target.value)}
    style={{
  width: "100%",
  padding: "12px",
  paddingRight: "40px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
  outline: "none",
  WebkitAppearance: "none",
  MozAppearance: "textfield"
}}
  />

  <span
    onClick={() => setShowPass(!showPass)}
    style={{
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer"
    }}
  >
    👁
  </span>

</div>

          <button
  onClick={handleVerifyOldPassword}
  style={{
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    background: "#007bff",
    color: "white"
  }}
>
  Next
</button>
        </>
      )}

      {/* 🧱 STEP 2 UI */}
      {step === 2 && (
        <>
          <div style={{ position: "relative", marginTop: "15px" }}>
  <input
    type={showPass ? "text" : "password"}
    placeholder="New password"
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    style={{
      width: "100%",
      padding: "12px",
      paddingRight: "40px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      boxSizing: "border-box",
      outline: "none"
    }}
  />

  {/* 👁 ONLY ONE ICON (move here if you want) */}
  <span
    onClick={() => setShowPass(!showPass)}
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer"
    }}
  >
    👁
  </span>
</div>

          <div style={{ position: "relative", marginTop: "10px" }}>
  <input
    type={showPass ? "text" : "password"}
    placeholder="Confirm password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    style={{
  width: "100%",
  padding: "12px",
  paddingRight: "40px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
  outline: "none",
  WebkitAppearance: "none",
  MozAppearance: "textfield"
}}
  />

  
</div>

          <button
  onClick={handleUpdatePassword}
  style={{
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    background: "#28a745",
    color: "white"
  }}
>
  Update Password
</button>
        </>
      )}

    </div>
  </div>
)}

    </div>
  );
}