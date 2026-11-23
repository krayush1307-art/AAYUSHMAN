import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../config/api.js";

const API_URL = `${API_BASE_URL}/auth`;
function Login() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const toastTimer = useRef(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Patient",
    password: "",
    confirmPassword: "",
  });

  // Show temporary notifications.
  const showToast = (message, type = "success") => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast({ message, type });

    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3500);
  };

  const closeToast = () => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast(null);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // Allow the voice assistant to switch tabs and fill form fields.
  useEffect(() => {
    const handleVoiceForm = (event) => {
      const { action, tab, field, value } = event.detail || {};

      if (action === "switchTab") {
        if (tab === "login" || tab === "register") {
          setActiveTab(tab);
          setNotice("");
          setShowPassword(false);
        }
        return;
      }

      if (action === "setField") {
        if (activeTab === "login") {
          setLoginData((previous) => ({
            ...previous,
            [field]: value,
          }));
        } else {
          setRegisterData((previous) => ({
            ...previous,
            [field]: value,
          }));
        }
      }
    };

    window.addEventListener("aayushman-voice-form", handleVoiceForm);

    return () => {
      window.removeEventListener("aayushman-voice-form", handleVoiceForm);
    };
  }, [activeTab]);

  // Save authentication and notify the application.
  const saveAuthentication = (data, message) => {
    localStorage.setItem("aayushman-token", data.token);
    localStorage.setItem("aayushman-user", JSON.stringify(data.user));

    window.dispatchEvent(
      new CustomEvent("aayushman-auth-changed", {
        detail: { message },
      }),
    );
  };

  // Login using the backend API.
  const handleLogin = async (e) => {
    e.preventDefault();
    setNotice("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      saveAuthentication(
        data,
        `Welcome back, ${data.user.name}! Login successful.`,
      );

      showToast(`Welcome back, ${data.user.name}!`);

      setLoginData({
        email: "",
        password: "",
      });

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check whether the backend is running."
          : error.message;

      setNotice(message);
      setNoticeType("error");
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Register a new account using the backend API.
  const handleRegister = async (e) => {
    e.preventDefault();
    setNotice("");

    if (registerData.password !== registerData.confirmPassword) {
      const message = "Passwords do not match. Please try again.";
      setNotice(message);
      setNoticeType("error");
      showToast(message, "error");
      return;
    }

    if (registerData.password.length < 8) {
      const message = "Password must contain at least 8 characters.";
      setNotice(message);
      setNoticeType("error");
      showToast(message, "error");
      return;
    }

    const roleMapping = {
      Patient: "patient",
      Doctor: "doctor",
      Pharmacy: "pharmacy",
      "Ambulance Operator": "ambulance",
    };

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          role: roleMapping[registerData.role],
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      saveAuthentication(
        data,
        `Welcome to AAYUSHMAN, ${data.user.name}! Account created successfully.`,
      );

      showToast(`Welcome to AAYUSHMAN, ${data.user.name}!`);

      setRegisterData({
        name: "",
        email: "",
        phone: "",
        role: "Patient",
        password: "",
        confirmPassword: "",
      });

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check whether the backend is running."
          : error.message;

      setNotice(message);
      setNoticeType("error");
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Switch between login and registration.
  const switchTab = (tab) => {
    setActiveTab(tab);
    setNotice("");
    setShowPassword(false);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-[#F5F7F5] dark:focus:border-[#39B982] dark:focus:ring-[#39B982]/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700 dark:text-[#D0DAD3]";

  return (
    <section
      id="login"
      className="min-h-screen bg-gradient-to-br from-[#F5F9FE] via-[#EAF6FF] to-[#DCEEFF] px-4 py-10 transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#171C1B] dark:via-[#202A2D] dark:to-[#263B32] sm:px-6 lg:px-8"
    >
      {/* Authentication toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-24 z-[1000] flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl border bg-white p-4 shadow-2xl dark:bg-[#242C29] sm:right-6 ${
            toast.type === "error"
              ? "border-red-200 text-red-700 dark:border-red-400/30 dark:text-red-300"
              : "border-green-200 text-green-800 dark:border-[#39B982]/30 dark:text-[#55CD96]"
          }`}
        >
          <span className="text-xl">{toast.type === "error" ? "⚠️" : "✓"}</span>

          <p className="flex-1 text-sm font-semibold">{toast.message}</p>

          <button
            type="button"
            onClick={closeToast}
            aria-label="Close notification"
            className="text-xl opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left: Healthcare welcome panel */}
        <div>
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-xs font-bold tracking-wider text-blue-700 dark:bg-[#39B982]/10 dark:text-[#55CD96]">
            YOUR HEALTHCARE PARTNER
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-[#183B56] dark:text-[#F5F7F5] sm:text-5xl lg:text-6xl">
            Healthcare,
            <span className="block text-blue-600 dark:text-[#39B982]">
              Closer to You.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-8 text-slate-600 dark:text-[#A0AEA5]">
            Join AAYUSHMAN and access healthcare services, medical information
            and support through one simple platform.
          </p>

          {/* Healthcare image */}
          <div className="relative mt-8 h-[260px] overflow-hidden rounded-3xl bg-blue-100 dark:bg-[#242C29] sm:h-[340px]">
            {/* Image: Indian rural doctor or community health worker helping a patient at a village healthcare centre */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 text-7xl dark:from-[#303C36] dark:to-[#1E2522]">
              🏥
            </div>

            <img
              src="/images/login-healthcare-community.jpg"
              alt="Healthcare worker helping a patient"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-xs font-bold tracking-widest text-white/80">
                AAYUSHMAN COMMUNITY
              </p>
              <h2 className="mt-2 max-w-md text-2xl font-extrabold sm:text-3xl">
                Better access to healthcare starts here.
              </h2>
            </div>
          </div>

          {/* Platform highlights */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: "🏥", title: "Find Care", text: "Healthcare facilities" },
              { icon: "👨‍⚕️", title: "Find Doctors", text: "Doctor directory" },
              { icon: "🤖", title: "AI Support", text: "Health information" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#3C4942] dark:bg-[#242C29]"
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-[#F5F7F5]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Authentication form */}
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-[#3C4942] dark:bg-[#242C29] dark:shadow-black/20 sm:p-9">
            <div className="mb-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-[#39B982]/15">
                {activeTab === "login" ? "🔐" : "✨"}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-[#F5F7F5] sm:text-3xl">
                {activeTab === "login"
                  ? "Welcome Back!"
                  : "Create Your Account"}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-[#A0AEA5]">
                {activeTab === "login"
                  ? "Login to continue your healthcare journey."
                  : "Join the AAYUSHMAN healthcare community today."}
              </p>
            </div>

            {/* Login and registration tabs */}
            <div className="mb-7 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-[#1E2522]">
              <button
                type="button"
                onClick={() => switchTab("login")}
                className={`rounded-lg py-3 text-sm font-bold transition ${
                  activeTab === "login"
                    ? "bg-blue-600 text-white shadow dark:bg-[#39B982] dark:text-[#10251B]"
                    : "text-slate-500 hover:text-slate-800 dark:text-[#A0AEA5] dark:hover:text-[#F5F7F5]"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => switchTab("register")}
                className={`rounded-lg py-3 text-sm font-bold transition ${
                  activeTab === "register"
                    ? "bg-blue-600 text-white shadow dark:bg-[#39B982] dark:text-[#10251B]"
                    : "text-slate-500 hover:text-slate-800 dark:text-[#A0AEA5] dark:hover:text-[#F5F7F5]"
                }`}
              >
                Register
              </button>
            </div>

            {/* Inline API feedback */}
            {notice && (
              <div
                role="alert"
                className={`mb-5 rounded-xl border p-3 text-sm leading-relaxed ${
                  noticeType === "success"
                    ? "border-green-200 bg-green-50 text-green-800 dark:border-[#39B982]/30 dark:bg-[#1E2522] dark:text-[#55CD96]"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-[#1E2522] dark:text-red-300"
                }`}
              >
                {notice}
              </div>
            )}

            {/* Login form */}
            {activeTab === "login" ? (
              <form
                id="aayushman-login-form"
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData((previous) => ({
                        ...previous,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter your email"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Password</label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData((previous) => ({
                          ...previous,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Enter your password"
                      className={`${inputClass} pr-20`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 dark:text-[#55CD96]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#39B982] dark:text-[#10251B] dark:shadow-none dark:hover:bg-[#55CD96]"
                >
                  {isLoading ? "Please wait..." : "Login to AAYUSHMAN →"}
                </button>
              </form>
            ) : (
              /* Registration form */
              <form
                id="aayushman-register-form"
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData((previous) => ({
                        ...previous,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData((previous) => ({
                        ...previous,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter your email"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Mobile Number</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    autoComplete="tel"
                    value={registerData.phone}
                    onChange={(e) =>
                      setRegisterData((previous) => ({
                        ...previous,
                        phone: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="10-digit mobile number"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Register As</label>
                  <select
                    value={registerData.role}
                    onChange={(e) =>
                      setRegisterData((previous) => ({
                        ...previous,
                        role: e.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="Patient">Patient</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Ambulance Operator">
                      Ambulance Operator
                    </option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData((previous) => ({
                        ...previous,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Minimum 8 characters"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData((previous) => ({
                        ...previous,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Re-enter your password"
                    className={inputClass}
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-slate-600 dark:text-[#A0AEA5]">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600 dark:accent-[#39B982]"
                  />
                  <span>I agree to the Terms and Privacy Policy.</span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#39B982] dark:text-[#10251B] dark:shadow-none dark:hover:bg-[#55CD96]"
                >
                  {isLoading ? "Creating account..." : "Create My Account →"}
                </button>
              </form>
            )}

            <div className="mt-7 border-t border-slate-100 pt-5 dark:border-[#3C4942]">
              <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-[#A0AEA5]">
                Your account is connected to the AAYUSHMAN backend. Keep your
                login credentials private.
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-slate-500 dark:text-[#A0AEA5]">
            AAYUSHMAN · Healthcare, Closer to You.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
