import React, { useState } from "react";

import RoleSelection from "./pages/RoleSelection.jsx";
import PassengerLogin from "./pages/PassengerLogin.jsx";
import PassengerRegister from "./pages/PassengerRegister.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminRegister from "./pages/AdminRegister.jsx";
import AdminHome from "./pages/AdminHome.jsx";
import PassengerHome from "./pages/PassengerHome.jsx";

function App() {
  const [view, setView] = useState("role");
  const [passenger, setPassenger] = useState(null);
  const [admin, setAdmin] = useState(null);

  // ✅ GLOBAL NOTIFICATIONS (Shared Between Passenger & Admin)
  const [notifications, setNotifications] = useState([]);

  function handleLogout() {
    setPassenger(null);
    setAdmin(null);
    setView("role");
  }

  // ✅ FUNCTION PASSENGER USES TO SEND NOTIFICATION TO ADMIN
  function sendNotificationToAdmin(message) {
    setNotifications((prev) => [
      { id: Date.now(), message, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  }

  return (
    <>
      {view === "role" && (
        <RoleSelection
          onSelectPassenger={() => setView("passenger-login")}
          onSelectAdmin={() => setView("admin-login")}
        />
      )}

      {view === "passenger-login" && (
        <PassengerLogin
          onLogin={(user) => {
            setPassenger(user);
            setView("passenger-home");
          }}
          goBackToRole={() => setView("role")}
          goToRegister={() => setView("passenger-register")}
        />
      )}

      {view === "passenger-register" && (
        <PassengerRegister
          onRegistered={() => setView("passenger-login")}
          goBackToLogin={() => setView("passenger-login")}
        />
      )}

      {view === "admin-login" && (
        <AdminLogin
          onLogin={(adm) => {
            setAdmin(adm);
            setView("admin-home");
          }}
          goBackToRole={() => setView("role")}
          goToRegister={() => setView("admin-register")}
        />
      )}

      {view === "admin-register" && (
        <AdminRegister
          onRegistered={() => setView("admin-login")}
          goBackToLogin={() => setView("admin-login")}
        />
      )}

      {/* ✅ ADMIN HOME WITH NOTIFICATIONS */}
      {view === "admin-home" && admin && (
        <AdminHome
          admin={admin}
          onLogout={handleLogout}
          notifications={notifications}
        />
      )}

      {/* ✅ PASSENGER HOME WITH SEND NOTIFICATION FUNCTION */}
      {view === "passenger-home" && passenger && (
        <PassengerHome
          passenger={passenger}
          onLogout={handleLogout}
          sendNotification={sendNotificationToAdmin}
        />
      )}
    </>
  );
}

export default App;
