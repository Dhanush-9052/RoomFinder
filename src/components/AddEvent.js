import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddEvent({ darkMode }) {

  const [eventName, setEventName] = useState("");
  const [clubName, setClubName] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("Technical");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [fee, setFee] = useState("");
  const [image, setImage] = useState(null);

  const handleAddEvent = async () => {

  // ✅ Validation
  if (
    !eventName ||
    !clubName ||
    !venue ||
    !date ||
    !time ||
    !description
  ) {
    alert("Please fill all required fields");
    return;
  }

  try {

    // ✅ Save event to Firestore
    await addDoc(collection(db, "events"), {

      eventName,
      clubName,
      venue,
      date,
      time,
      type,
      description,
      link,
      fee,
      image,

      createdAt: new Date()

    });

    alert("Event added successfully!");

    // ✅ Clear form
    setEventName("");
    setClubName("");
    setVenue("");
    setDate("");
    setTime("");
    setType("Technical");
    setDescription("");
    setLink("");
    setFee("");
    setImage("");

  } catch (err) {

    alert(err.message);

  }

};

  return (

    <div>

      <h2 style={{
        textAlign: "center",
        marginBottom: "20px"
      }}>
        Add Event
      </h2>

      <input
        placeholder="Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Club Name"
        value={clubName}
        onChange={(e) => setClubName(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Venue"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        style={inputStyle}
      />

      <input
        type="date"
        min={new Date().toISOString().split("T")[0]}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={inputStyle}
        />

      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        style={inputStyle}
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={inputStyle}
      >
        <option>Technical</option>
        <option>Non-Technical</option>
      </select>

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{
          ...inputStyle,
          height: "100px",
          resize: "none"
        }}
      />

      <input
        placeholder="Registration Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Entry Fee"
        value={fee}
        onChange={(e) => setFee(e.target.value)}
        style={inputStyle}
      />

      <input
  type="file"
  accept="image/*"

  onChange={(e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {

      setImage(reader.result);

    };

    reader.readAsDataURL(file);

  }}

  style={inputStyle}
/>

      <button
        onClick={handleAddEvent}
        style={{
          width: "100%",
          padding: "12px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          marginTop: "10px"
        }}
      >
        Add Event
      </button>

    </div>

  );

}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box"
};