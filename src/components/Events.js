import { useState, useEffect } from "react";
import AddEvent from "./AddEvent";
import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

export default function Events({ darkMode }) {

  const [showAddEvent, setShowAddEvent] =
    useState(false);
    const [events, setEvents] = useState([]);

  // ✅ Check admin mode
  const isAdminMode =
    localStorage.getItem("isAdminMode") === "true";

    useEffect(() => {

  const unsubscribe = onSnapshot(

    collection(db, "events"),

    (snapshot) => {

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setEvents(data);

    }

  );

  return () => unsubscribe();

}, []);

  return (

    <div style={{
      padding: "20px",
      position: "relative"
    }}>

      <h2>Campus Events</h2>

      {events.length === 0 ? (

  <p>No events available</p>

) : (

  events.map((event) => (

  <div
    key={event.id}
    style={{
      background:
        darkMode ? "#2c2c3e" : "white",

      color:
        darkMode ? "white" : "black",

      borderRadius: "18px",

      overflow: "hidden",

      marginBottom: "30px",

      boxShadow:
        "0 8px 25px rgba(0,0,0,0.12)"
    }}
  >


    {/* 📦 CONTENT */}
<div style={{
  display: "flex",
  gap: "25px",
  padding: "22px",
  flexWrap: "wrap",
  alignItems: "flex-start"
}}>
    {/* 🖼️ LEFT IMAGE */}
{event.image && (

  <img
    src={event.image}
    alt="event"
    style={{
      width: "260px",
      height: "180px",
      objectFit: "cover",
      borderRadius: "14px",
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.15)",
      flexShrink: 0
    }}
  />

)}


<div style={{ flex: 1 }}>
      {/* TITLE + TYPE */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
        flexWrap: "wrap",
        gap: "10px"
      }}>

        <h2 style={{
          margin: 0,
          fontSize: "30px"
        }}>
          {event.eventName}
        </h2>

        <span
          style={{
            background:
              event.type === "Technical"
                ? "#007bff"
                : "#ff9800",

            color: "white",

            padding: "6px 14px",

            borderRadius: "20px",

            fontSize: "13px",

            fontWeight: "bold"
          }}
        >
          {event.type}
        </span>

      </div>

      {/* CLUB */}
      <p style={{
        marginBottom: "10px",
        fontSize: "16px"
      }}>
        🏛️ <b>Club:</b> {event.clubName}
      </p>

      {/* VENUE */}
      <p style={{
        marginBottom: "10px",
        fontSize: "16px"
      }}>
        📍 <b>Venue:</b> {event.venue}
      </p>

      {/* DATE + TIME */}
      <div style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "15px"
      }}>

        <p style={{ margin: 0 }}>
          📅 <b>Date:</b> {event.date}
        </p>

        <p style={{ margin: 0 }}>
          ⏰ <b>Time:</b> {event.time}
        </p>

      </div>

      {/* FEE */}
      <p style={{
        marginBottom: "15px",
        fontSize: "16px"
      }}>
        💰 <b>Fee:</b> ₹{event.fee || 0}
      </p>

      {/* DESCRIPTION */}
      <div
        style={{
          background:
            darkMode ? "#1e1e2f" : "#f5f5f5",

          padding: "15px",

          borderRadius: "10px",

          lineHeight: "1.6",

          marginBottom: "20px"
        }}
      >
        {event.description}
      </div>

      {/* REGISTER BUTTON */}
      {event.link && (

        <a
          href={event.link}
          target="_blank"
          rel="noreferrer"

          style={{
            display: "inline-block",

            background: "#007bff",

            color: "white",

            padding: "12px 20px",

            borderRadius: "10px",

            textDecoration: "none",

            fontWeight: "bold"
          }}
        >
          Register Now
        </a>

      )}

    </div>
    </div>
  </div>

))

)}

      {/* ➕ ADMIN ONLY BUTTON */}
      {isAdminMode && (

        <button
          onClick={() => setShowAddEvent(true)}
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

      )}

      {/* 📦 POPUP */}
      {showAddEvent && (

        <div
          onClick={() => setShowAddEvent(false)}
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
              background:
                darkMode ? "#2c2c3e" : "white",
              color:
                darkMode ? "white" : "black",
              padding: "25px",
              borderRadius: "12px",
              width: "420px",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >

            <AddEvent darkMode={darkMode} />

          </div>

        </div>

      )}

    </div>

  );

}