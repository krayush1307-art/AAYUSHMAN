import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/aayushman-logo.png";
import darkLogo from "../assets/aayushman-logo-dark.jpg";

function Navbar({ isDark, setIsDark }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [localTheme, setLocalTheme] = useState("light");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [exploreMenu, setExploreMenu] = useState(false);

  const theme =
    typeof isDark === "boolean" ? (isDark ? "dark" : "light") : localTheme;

  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem("aayushman-user");
        setUser(savedUser ? JSON.parse(savedUser) : null);
      } catch {
        setUser(null);
      }
    };

    const savedTheme = localStorage.getItem("aayushman-theme") || "light";

    setLocalTheme(savedTheme);

    if (setIsDark) {
      setIsDark(savedTheme === "dark");
    }

    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    loadUser();

    window.addEventListener("aayushman-auth-changed", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("aayushman-auth-changed", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, [setIsDark]);

  const closeMenus = () => {
    setMobileMenu(false);
    setExploreMenu(false);
  };

  // Change theme and save the user's preference.
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setLocalTheme(newTheme);
    localStorage.setItem("aayushman-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    if (setIsDark) {
      setIsDark(newTheme === "dark");
    }
  };

  // Logout the current user.
  const handleLogout = () => {
    localStorage.removeItem("aayushman-token");
    localStorage.removeItem("aayushman-user");

    setUser(null);
    closeMenus();

    window.dispatchEvent(new Event("aayushman-auth-changed"));
    navigate("/");
  };

  // Common links are always visible to everyone.
  const commonLinks = [
    { label: "Home", href: "/" },

    { label: "About", href: "/about" },
  ];

  // Explore links are available to logged-in and logged-out users.
  const exploreLinks = [
    { label: "Medicines & Pharmacy", href: "/medicines", icon: "💊" },
    { label: "Ambulance Services", href: "/ambulance", icon: "🚑" },
    { label: "AI Health Assistant", href: "/ai-assistant", icon: "🤖" },
    { label: "Health Resources", href: "/health-resources", icon: "📚" },
  ];

  // Navigation changes according to the logged-in user's role.
  const roleLinks = {
    patient: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Find Care", href: "/find-care" },
      { label: "Doctors", href: "/doctors" },
      { label: "Consultation", href: "/consultation" },
    ],
    doctor: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Appointments", href: "/dashboard" },
      { label: "Doctor Directory", href: "/doctors" },
      { label: "Consultation", href: "/consultation" },
    ],
    pharmacy: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Medicines", href: "/medicines" },
      { label: "Find Care", href: "/find-care" },
    ],
    ambulance: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Ambulance Services", href: "/ambulance" },
      { label: "Find Care", href: "/find-care" },
    ],
    admin: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Find Care", href: "/find-care" },
      { label: "Doctors", href: "/doctors" },
    ],
  };

  const currentRole = user?.role?.toLowerCase();

  // Common links + public or role-specific links.
  const navigationLinks = [
    ...commonLinks,
    ...(user
      ? roleLinks[currentRole] || roleLinks.patient
      : [
          { label: "Find Care", href: "/find-care" },
          { label: "Consultation", href: "/consultation" },
        ]),
  ];

  const linkStyle =
    "text-sm font-medium text-slate-700 dark:text-[#D0DAD3] hover:text-blue-600 dark:hover:text-[#55CD96] transition-colors duration-200";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-gradient-to-r from-[#FFFFFF]/95 via-[#F5F9FE]/95 to-[#EAF4FC]/95 backdrop-blur-xl transition-colors duration-300 dark:border-[#3C4942] dark:bg-gradient-to-r dark:from-[#202B27]/95 dark:via-[#263831]/95 dark:to-[#202D29]/95">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4 ">
          {/* Brand and homepage link */}
          <Link
            to="/"
            onClick={closeMenus}
            className="group flex shrink-0 items-center gap-3 transition-transform duration-300 ease-out hover:scale-[1.04]"
          >
            <img
              src={theme === "dark" ? darkLogo : logo}
              alt="AAYUSHMAN Logo"
              className="h-11 w-11 object-contain"
            />

            <div className="leading-tight">
              <h1 className="text-xl font-extrabold tracking-wide text-[#1769AA] dark:text-[#39B982]">
                AAYUSHMAN
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-[#A0AEA5] sm:text-xs">
                Healthcare, Closer to You.
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-5 lg:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={closeMenus}
                className={linkStyle}
              >
                {link.label}
              </Link>
            ))}

            {/* Explore dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setExploreMenu(true)}
              onMouseLeave={() => setExploreMenu(false)}
              onFocus={() => setExploreMenu(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setExploreMenu(false);
                }
              }}
            >
              <button
                type="button"
                onClick={() => setExploreMenu((prev) => !prev)}
                className={`${linkStyle} flex items-center gap-2 py-3`}
                aria-expanded={exploreMenu}
              >
                Explore
                <span className="text-xs">{exploreMenu ? "▲" : "▼"}</span>
              </button>

              {exploreMenu && (
                <div className="absolute left-0 top-full z-50 w-64 pt-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-[#3C4942] dark:bg-[#242C29]">
                    {exploreLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.href}
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 transition-colors hover:bg-blue-50 dark:text-[#D0DAD3] dark:hover:bg-[#303C36]"
                      >
                        <span>{link.icon}</span>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              title={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-blue-100 dark:bg-[#242C29] dark:text-[#39B982] dark:hover:bg-[#303C36]"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {!user ? (
              <Link
                to="/login"
                onClick={closeMenus}
                className="hidden items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96] sm:inline-flex"
              >
                Login / Register
              </Link>
            ) : (
              <div className="hidden items-center gap-3 sm:flex">
                <div className="text-right leading-tight">
                  <p className="max-w-28 truncate text-sm font-semibold text-slate-800 dark:text-[#F5F7F5]">
                    {user.name || "Welcome"}
                  </p>
                  <p className="text-xs capitalize text-slate-500 dark:text-[#39B982]">
                    {currentRole || "User"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenu((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 dark:text-[#F5F7F5] dark:hover:bg-[#242C29] lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenu}
            >
              <span className="text-2xl">{mobileMenu ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenu && (
          <div className="max-h-[75vh] space-y-2 overflow-y-auto border-t border-slate-200 py-4 dark:border-[#3C4942] lg:hidden">
            {navigationLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={closeMenus}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 dark:text-[#D0DAD3] dark:hover:bg-[#303C36]"
              >
                {link.label}
              </Link>
            ))}

            {/* Explore menu */}
            <button
              type="button"
              onClick={() => setExploreMenu((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 dark:text-[#D0DAD3] dark:hover:bg-[#303C36]"
              aria-expanded={exploreMenu}
            >
              Explore
              <span>{exploreMenu ? "▲" : "▼"}</span>
            </button>

            {exploreMenu && (
              <div className="ml-3 border-l-2 border-blue-200 pl-2 dark:border-[#39B982]">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 dark:text-[#D0DAD3] dark:hover:bg-[#303C36]"
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {!user ? (
              <Link
                to="/login"
                onClick={closeMenus}
                className="mx-4 mt-3 block rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
              >
                Login / Register
              </Link>
            ) : (
              <div className="border-t border-slate-200 px-4 pt-3 dark:border-[#3C4942]">
                <p className="text-sm font-semibold text-slate-800 dark:text-[#F5F7F5]">
                  {user.name || "Welcome"}
                </p>
                <p className="mt-1 text-xs capitalize text-slate-500 dark:text-[#39B982]">
                  {currentRole || "User"}
                </p>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-400/10 dark:text-red-300
                  "
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
