function Navbar({ activePage }) {
  return (
    <header className="navbar">
      <div>
        <h2>{activePage}</h2>

        <p>
          {activePage === "Dashboard" &&
            "Overview of your LLM usage and token savings."}

          {activePage === "AI" &&
            "Interact with your selected AI model through TokenWise."}

          {activePage === "Analysis" &&
            "Analyze your token usage and compression performance."}

          {activePage === "Settings" &&
            "Manage your TokenWise application settings."}
        </p>
      </div>
    </header>
  );
}

export default Navbar;