import { useState } from "react";

import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

import Dashboard from "./pages/Dashboard";
import AI from "./pages/AI";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";

import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "AI":
        return <AI />;

      case "Analysis":
        return <Analysis />;

      case "Settings":
        return <Settings />;

      case "Dashboard":
      default:
        return <Dashboard />;
    }
  };

  const showNavbar = activePage === "Dashboard";

  return (
    <div className="app">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="main-area">

        {showNavbar && (
          <Navbar activePage={activePage} />
        )}

        <main>
          {renderPage()}
        </main>

      </div>

    </div>
  );
}

export default App;