import { Link } from "react-router-dom";

// Simple SVG icons keep the service cards consistent without extra packages.
function ServiceIcon({ type }) {
  const common = {
    width: 27,
    height: 27,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    hospital: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-5h6v5" />
        <path d="M12 8v5M9.5 10.5h5" />
      </>
    ),
    doctor: (
      <>
        <path d="M8 4a4 4 0 0 0 8 0" />
        <path d="M6 4a6 6 0 0 0 12 0" />
        <path d="M6 13a6 6 0 0 0 12 0" />
        <path d="M12 13v3" />
        <path d="M8 21v-2a4 4 0 0 1 8 0v2" />
        <path d="M10 17h4" />
      </>
    ),
    consultation: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M8 10h8M12 7v6" />
      </>
    ),
    medicine: (
      <>
        <path d="m10.5 3.5 10 10a4.24 4.24 0 0 1-6 6l-10-10a4.24 4.24 0 0 1 6-6Z" />
        <path d="m8 6 10 10" />
        <path d="M12 10h.01M15 13h.01" />
      </>
    ),
    ambulance: (
      <>
        <path d="M3 7h11v11H3z" />
        <path d="M14 11h4l3 3v4h-7z" />
        <circle cx="7.5" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M8 10v5M5.5 12.5h5" />
      </>
    ),
    ai: (
      <>
        <rect x="4" y="7" width="16" height="13" rx="3" />
        <path d="M12 3v4M9 3h6M8 12h.01M16 12h.01" />
        <path d="M9 16h6" />
        <path d="m4 11-2-2M20 11l2-2" />
      </>
    ),
  };

  return <svg {...common}>{icons[type]}</svg>;
}

function Services() {
  const services = [
    {
      icon: "hospital",
      title: "Find Healthcare",
      description:
        "Explore healthcare facilities and discover available medical support in your area.",
      link: "/find-care",
      label: "Explore Facilities",
    },
    {
      icon: "doctor",
      title: "Find Doctors",
      description:
        "Explore doctor profiles and book appointments through the platform.",
      link: "/doctors",
      label: "Find Doctors",
    },
    {
      icon: "consultation",
      title: "Online Consultation",
      description:
        "Access appointment-based video consultation features with doctors.",
      link: "/consultation",
      label: "Explore Consultation",
    },
    {
      icon: "medicine",
      title: "Medicine Support",
      description:
        "Browse the medicine catalogue and explore the pharmacy ordering workflow.",
      link: "/medicines",
      label: "Explore Medicines",
    },
    {
      icon: "ambulance",
      title: "Ambulance Services",
      description:
        "Explore the demo ambulance booking and location-tracking experience.",
      link: "/ambulance",
      label: "Explore Ambulance",
    },
    {
      icon: "ai",
      title: "AI Health Assistant",
      description:
        "Get general health information through a multilingual AI assistant.",
      link: "/ai-assistant",
      label: "Ask AI Assistant",
    },
  ];

  return (
    <section
      id="services"
      className="py-20 md:py-24 bg-white dark:bg-[#171C1B] transition-colors duration-500"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section introduction */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-[#39B982]/10 text-blue-700 dark:text-[#55CD96] text-sm font-bold tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-[#39B982]" />
            OUR SERVICES
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-[#F5F7F5] leading-tight">
            Healthcare Services,
            <span className="block text-blue-600 dark:text-[#39B982] mt-2">
              Connected in One Place
            </span>
          </h2>

          <p className="mt-5 text-slate-600 dark:text-[#A0AEA5] leading-7">
            Explore digital healthcare features designed to make accessing
            medical information and services simpler and more convenient.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.link}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-[#3C4942] bg-white dark:bg-[#242C29] p-7 shadow-sm hover:shadow-xl dark:hover:shadow-black/20 hover:-translate-y-2 hover:border-blue-300 dark:hover:border-[#39B982] transition-all duration-300"
            >
              {/* Subtle top accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 dark:bg-[#39B982] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />

              {/* Service icon */}
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-[#303C36] text-blue-600 dark:text-[#39B982] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-[#39B982] dark:group-hover:text-[#10251B] group-hover:scale-110 transition-all duration-300">
                <ServiceIcon type={service.icon} />
              </div>

              {/* Card content */}
              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-[#F5F7F5] group-hover:text-blue-600 dark:group-hover:text-[#55CD96] transition-colors">
                {service.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-[#A0AEA5] flex-grow">
                {service.description}
              </p>

              {/* Card link */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-[#3C4942] pt-5">
                <span className="text-sm font-bold text-blue-600 dark:text-[#39B982]">
                  {service.label}
                </span>

                <span className="text-xl text-blue-600 dark:text-[#39B982] group-hover:translate-x-2 transition-transform duration-300">
                  →
                </span>
              </div>

              {/* Decorative number */}
              <span className="absolute top-7 right-7 text-xs font-bold text-slate-300 dark:text-[#A0AEA5]/30">
                0{index + 1}
              </span>
            </Link>
          ))}
        </div>

        {/* Demo disclaimer */}
        <p className="mt-10 text-center text-xs text-slate-400 dark:text-[#A0AEA5]/70 leading-6">
          Services shown are part of the AAYUSHMAN portfolio prototype. Actual
          healthcare services and provider availability are not guaranteed.
        </p>
      </div>
    </section>
  );
}

export default Services;
