import { useState } from "react";
import AddClassroom from "../components/AddClassroom";
import ClassroomList from "../components/ClassroomList";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Home() {
  const [showAdd, setShowAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const user = auth.currentUser;
  const firstLetter = user?.email?.charAt(0).toUpperCase();
  const [darkMode, setDarkMode] = useState(false);
  
  const handleLogout = async () => {
    await signOut(auth);
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
        <div style={{ position: "relative" }}>

  {/* 🔵 ROUND ICON */}
  <div
    onClick={() => setShowProfile(!showProfile)}
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
        onClick={() => setShowAdd(!showAdd)}
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
        <div style={{
          position: "fixed",
          bottom: "100px",
          right: "25px",
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
        }}>
          <AddClassroom onAdd={() => setShowAdd(false)} />
        </div>
      )}

    </div>
  );
}