import { Link } from "react-router-dom";

function Footer() {
  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Find Care", href: "/find-care" },
    { label: "Doctors", href: "/doctors" },
    { label: "Consultation", href: "/consultation" },
    { label: "About Us", href: "/about" },
  ];

  const serviceLinks = [
    { label: "Medicines & Pharmacy", href: "/medicines" },
    { label: "Ambulance Services", href: "/ambulance" },
    { label: "AI Health Assistant", href: "/ai-assistant" },
    { label: "Health Resources", href: "/health-resources" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-blue-200/70 bg-gradient-to-br from-[#E5F2FC] via-[#DCECF8] to-[#C8E2F3] text-slate-700 transition-colors duration-300 dark:border-[#3C594B] dark:bg-gradient-to-br dark:from-[#263B32] dark:via-[#2C4739] dark:to-[#345342] dark:text-[#E0EAE3]">
      {" "}
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-14">
        {/* Footer main content */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand information */}
          <div>
            <Link to="/" className="inline-block">
              <h2 className="text-2xl font-extrabold tracking-wide text-[#1769AA] dark:text-[#39B982]">
                AAYUSHMAN
              </h2>
            </Link>

            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-[#A0AEA5]">
              Healthcare, Closer to You.
            </p>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600 dark:text-[#A0AEA5]">
              Exploring how technology can make healthcare information, services
              and support easier to access for rural communities.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-blue-700 dark:border-[#3C4942] dark:bg-[#242C29] dark:text-[#39B982]">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Built with care
            </div>
          </div>

          {/* Quick navigation */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#183B56] dark:text-[#F5F7F5]">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm transition-colors hover:text-blue-600 dark:hover:text-[#39B982]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Healthcare services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#183B56] dark:text-[#F5F7F5]">
              Explore Services
            </h3>

            <ul className="mt-5 space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm transition-colors hover:text-blue-600 dark:hover:text-[#39B982]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Project disclaimer */}
        <div className="mt-12 rounded-2xl border border-blue-100 bg-white p-5 dark:border-[#3C4942] dark:bg-[#242C29]">
          <p className="text-sm font-bold text-[#183B56] dark:text-[#F5F7F5]">
            Important Notice
          </p>

          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-[#A0AEA5]">
            AAYUSHMAN is a portfolio project and functional prototype, not a
            live healthcare provider. Information and demonstration features
            should not replace professional medical advice or emergency
            services. In an emergency, contact your local emergency service.
          </p>
        </div>

        {/* Bottom copyright section */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-blue-100 pt-6 text-center dark:border-[#3C4942] sm:flex-row sm:text-left">
          <p className="text-xs text-slate-500 dark:text-[#A0AEA5]">
            © {new Date().getFullYear()} AAYUSHMAN. All rights reserved.
          </p>

          <p className="text-xs text-slate-500 dark:text-[#A0AEA5]">
            Built with care for better rural healthcare access.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
