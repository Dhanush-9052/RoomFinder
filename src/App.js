import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import Auth from "./pages/Auth";
import Home from "./pages/Home";

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (u) => {

  setAuthChecking(true);

  setUser(u);

  setLoading(false);

  // ⏳ small delay for role validation
  setTimeout(() => {
    setAuthChecking(false);
  }, 700);

});

    return () => unsubscribe();

  }, []);

  // ⏳ loading screen
  if (loading || authChecking) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        fontWeight: "bold"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      {user ? <Home /> : <Auth />}
    </div>
  );
}

export default App;