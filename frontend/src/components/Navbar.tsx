import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/employees", label: "Employees", icon: "👥" },
  { to: "/attendance", label: "Attendance", icon: "📋" },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-0 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-2 py-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <h1 className="text-lg font-bold text-gray-800">
            HRMS <span className="text-blue-600">Lite</span>
          </h1>
        </div>

        {/* Nav Links */}
        <div className="flex items-center">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-5 text-sm font-medium border-b-2 transition-colors duration-150
                  ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                  }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

      </div>
    </nav>
  );
}