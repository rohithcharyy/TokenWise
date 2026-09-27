import {
  BarChart3,
  Bot,
  LayoutDashboard,
  Settings,
  User,
  Zap,
} from "lucide-react";


function Sidebar({ activePage, setActivePage }) {

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "AI",
      icon: Bot,
    },
    {
      name: "Analysis",
      icon: BarChart3,
    },
  ];


  return (

    <aside className="sidebar">


      {/* =================================================
          BRAND
      ================================================= */}

      <div className="sidebar-brand">

        <div className="sidebar-logo">
          <Zap size={18} />
        </div>

        <div>

          <h1>
            TokenWise
          </h1>

          <span>
            Context Optimization
          </span>

        </div>

      </div>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="sidebar-nav">

        <p className="nav-section-title">
          Workspace
        </p>


        {navigation.map((item) => {

          const Icon = item.icon;

          const isActive =
            activePage === item.name;


          return (

            <button
              key={item.name}
              className={`nav-item ${
                isActive ? "active" : ""
              }`}
              onClick={() =>
                setActivePage(item.name)
              }
              type="button"
            >

              <Icon size={17} />

              <span>
                {item.name}
              </span>

            </button>

          );

        })}


        {/* =================================================
            SYSTEM
        ================================================= */}

        <p className="nav-section-title settings-section">
          System
        </p>


        <button
          className={`nav-item ${
            activePage === "Settings"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("Settings")
          }
          type="button"
        >

          <Settings size={17} />

          <span>
            Settings
          </span>

        </button>

      </nav>


      {/* =================================================
          PROFILE
      ================================================= */}

      <div className="sidebar-footer">

        <div className="sidebar-profile">

          <div className="sidebar-profile-avatar">

            <User size={16} />

          </div>


          <div className="sidebar-profile-info">

            <strong>
              Rohith
            </strong>

            <span>
              Student
            </span>

          </div>

        </div>

      </div>

    </aside>

  );

}


export default Sidebar;