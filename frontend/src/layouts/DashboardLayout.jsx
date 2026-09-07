import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "▦" },
  { name: "Leads", path: "/leads", icon: "◉" },
  { name: "Properties", path: "/properties", icon: "⌂" },
  { name: "Bookings", path: "/bookings", icon: "▣" },
  ...(user?.role === "ADMIN"
    ? [{ name: "Employees", path: "/employees", icon: "♙" }]
    : []),
];

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">

        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              EstateCRM
            </h1>
            <p className="text-xs text-slate-500">
              Real Estate Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <span className="text-lg w-5">
                {item.icon}
              </span>

              {item.name}
            </NavLink>
          ))}

        </nav>

        {/* User section */}
        <div className="border-t border-slate-200 p-4">

          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-900">
              {user?.name || user?.sub || "User"}
            </p>

            <p className="text-xs text-slate-500">
              {user?.role || "Sales Employee"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Logout
          </button>

        </div>

      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Real Estate CRM
            </h2>
          </div>

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
              {(user?.name || user?.sub || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

          </div>

        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}