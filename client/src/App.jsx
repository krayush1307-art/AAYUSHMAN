import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";

// Global components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import VoiceNavigationAssistant from "./components/VoiceNavigationAssistant";

// Page components
import Hero from "./components/Hero.jsx";
import Services from "./components/Services";
import Dashboard from "./components/Dashboard.jsx";
import FindCare from "./components/FindCare.jsx";
import Doctors from "./components/Doctors.jsx";
import Consultation from "./components/Consultation.jsx";
import Medicines from "./components/Medicines.jsx";
import Ambulance from "./components/Ambulance.jsx";
import AIHealthAssistant from "./components/AIHealthAssistant.jsx";
import HealthResources from "./components/HealthResources.jsx";
import Login from "./components/Login.jsx";
import About from "./components/About.jsx";

// Scroll to the top whenever the user opens another page.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function App() {
  // Load saved theme preference.
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("aayushman-theme") === "dark";
  });

  // Check whether a user is logged in.
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("aayushman-token"));
  });

  // Login and registration success notification.
  const [toast, setToast] = useState("");

  // Apply and save the selected theme globally.
  useEffect(() => {
    localStorage.setItem("aayushman-theme", isDark ? "dark" : "light");

    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Keep authentication state updated.
  useEffect(() => {
    const syncAuthentication = (event) => {
      const token = localStorage.getItem("aayushman-token");

      setIsAuthenticated(Boolean(token));

      if (token && event.detail?.message) {
        setToast(event.detail.message);
      }
    };

    window.addEventListener("aayushman-auth-changed", syncAuthentication);

    return () => {
      window.removeEventListener("aayushman-auth-changed", syncAuthentication);
    };
  }, []);

  // Automatically hide success notification.
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div
      className={
        isDark
          ? "dark min-h-screen bg-[#171C1B] text-[#F5F7F5] transition-colors duration-300"
          : "min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300"
      }
    >
      {/* Global navigation */}
      <Navbar isDark={isDark} setIsDark={setIsDark} />

      <ScrollToTop />

      {/* Login and registration success notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 top-24 z-[100] flex max-w-sm items-center gap-3 rounded-xl border border-green-200 bg-white px-5 py-4 text-sm font-semibold text-green-700 shadow-xl dark:border-[#39B982]/30 dark:bg-[#242C29] dark:text-[#75D9A9]"
        >
          <span className="text-xl">✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Each URL opens its dedicated page */}
      <main>
        <Routes>
          {/* Homepage */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Services />
              </>
            }
          />

          {/* Healthcare pages */}
          <Route path="/find-care" element={<FindCare />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/ambulance" element={<Ambulance />} />
          <Route path="/ai-assistant" element={<AIHealthAssistant />} />
          <Route path="/health-resources" element={<HealthResources />} />

          {/* Dashboard is available only after login */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />

          {/* Login and registration page */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />

          {/* About page */}
          <Route path="/about" element={<About />} />

          {/* Unknown URLs */}
          <Route
            path="*"
            element={
              <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
                <p className="text-7xl font-extrabold text-blue-600 dark:text-[#39B982]">
                  404
                </p>

                <h2 className="mt-4 text-2xl font-bold">Page Not Found</h2>

                <p className="mt-2 text-slate-500 dark:text-[#A9B9B0]">
                  Sorry, the page you are looking for does not exist.
                </p>

                <Link
                  to="/"
                  className="mt-6 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#17221D] dark:hover:bg-[#55CD96]"
                >
                  Back to Home
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Global footer */}
      <Footer />

      {/* Voice assistant remains available on every page */}
      <VoiceNavigationAssistant />
    </div>
  );
}

export default App;
