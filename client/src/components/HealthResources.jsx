import { useEffect, useRef, useState } from "react";

const resources = [
  {
    id: 1,
    category: "Hygiene",
    icon: "🧼",
    title: "Personal Hygiene",
    description:
      "Learn simple daily habits that help prevent infections and keep you healthy.",
    tips: [
      "Wash your hands with soap regularly.",
      "Keep your surroundings clean.",
      "Drink safe and clean water.",
    ],
  },
  {
    id: 2,
    category: "First Aid",
    icon: "🩹",
    title: "Basic First Aid",
    description:
      "Understand basic first-aid steps for minor injuries while arranging proper medical care.",
    tips: [
      "Clean minor cuts with clean running water.",
      "Cover wounds with a sterile dressing.",
      "Seek urgent help for serious injuries or heavy bleeding.",
    ],
  },
  {
    id: 3,
    category: "Maternal Care",
    icon: "🤰",
    title: "Maternal Healthcare",
    description:
      "Understand why regular pregnancy check-ups and professional guidance matter.",
    tips: [
      "Attend scheduled antenatal check-ups.",
      "Follow advice from qualified healthcare workers.",
      "Seek urgent care for warning signs during pregnancy.",
    ],
  },
  {
    id: 4,
    category: "Child Health",
    icon: "👶",
    title: "Child Healthcare",
    description:
      "Learn about essential healthcare practices for babies and growing children.",
    tips: [
      "Follow the recommended vaccination schedule.",
      "Monitor your child's growth and nutrition.",
      "Consult a healthcare professional when a child is unwell.",
    ],
  },
  {
    id: 5,
    category: "Prevention",
    icon: "🛡️",
    title: "Disease Prevention",
    description:
      "Build healthy habits and learn how preventive care supports your wellbeing.",
    tips: [
      "Maintain a balanced and nutritious diet.",
      "Stay physically active.",
      "Get regular health check-ups when recommended.",
    ],
  },
  {
    id: 6,
    category: "Government Schemes",
    icon: "🏥",
    title: "Healthcare Schemes",
    description:
      "Explore public healthcare programmes and learn how to check your eligibility.",
    tips: [
      "Explore the official Ayushman Bharat PM-JAY website.",
      "Check eligibility through official government channels.",
      "Confirm benefits and participating hospitals before seeking treatment.",
    ],
    link: "https://pmjay.gov.in/",
    linkText: "Visit official PM-JAY website",
  },
];

const categories = [
  "All",
  "Hygiene",
  "First Aid",
  "Maternal Care",
  "Child Health",
  "Prevention",
  "Government Schemes",
];

function HealthResources() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const filteredResources =
    activeCategory === "All"
      ? resources
      : resources.filter((resource) => resource.category === activeCategory);

  // Automatically close notifications and clean up the timer.
  const showToast = (message) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast({ id: Date.now(), message });

    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3000);
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

  const handleCategoryChange = (category) => {
    setActiveCategory(category);

    const count =
      category === "All"
        ? resources.length
        : resources.filter((resource) => resource.category === category).length;

    showToast(
      category === "All"
        ? `Showing all ${count} health resources.`
        : `Showing ${category} resources.`,
    );
  };

  return (
    <section
      id="health-resources"
      className="overflow-hidden bg-gradient-to-br from-[#F5F9FE] via-[#EAF6FF] to-[#DCEEFF] px-4 py-14 transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#171C1B] dark:via-[#202A2D] dark:to-[#263B32] sm:px-6 sm:py-20 lg:px-8"
    >
      {/* Category filter notification */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className="fixed right-4 top-24 z-[1000] flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl border border-green-200 bg-white p-4 text-green-800 shadow-2xl dark:border-[#39B982]/40 dark:bg-[#242C29] dark:text-[#55CD96] sm:right-6"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold dark:bg-[#39B982]/15">
            ✓
          </span>

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

      <div className="mx-auto max-w-7xl">
        {/* Intro: text left and healthcare awareness image right */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-bold tracking-wider text-blue-700 dark:bg-[#39B982]/10 dark:text-[#55CD96]">
              KNOWLEDGE FOR BETTER HEALTH
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-[#183B56] dark:text-[#F5F7F5] sm:text-5xl">
              Health Education,
              <span className="block text-blue-600 dark:text-[#39B982]">
                Better Living.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-gray-600 dark:text-[#A0AEA5]">
              Simple and useful healthcare information for individuals and
              families. Learn about hygiene, first aid, maternal care, child
              health and preventive healthcare.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#resource-library"
                className="rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
              >
                Explore Resources ↓
              </a>

              <a
                href="https://pmjay.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-gray-300 px-6 py-3.5 font-bold text-[#183B56] transition hover:bg-blue-50 dark:border-[#3C4942] dark:text-[#F5F7F5] dark:hover:bg-[#242C29]"
              >
                Government Schemes ↗
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-6">
              <div>
                <p className="text-2xl font-extrabold text-[#183B56] dark:text-[#55CD96]">
                  06
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-[#A0AEA5]">
                  Learning Topics
                </p>
              </div>

              <div className="h-10 w-px bg-gray-200 dark:bg-[#3C4942]" />

              <div>
                <p className="text-2xl font-extrabold text-[#183B56] dark:text-[#55CD96]">
                  Easy
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-[#A0AEA5]">
                  Simple Guidance
                </p>
              </div>

              <div className="h-10 w-px bg-gray-200 dark:bg-[#3C4942]" />

              <div>
                <p className="text-2xl font-extrabold text-[#183B56] dark:text-[#55CD96]">
                  Free
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-[#A0AEA5]">
                  Health Information
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative h-[300px] overflow-hidden rounded-[2rem] bg-blue-100 dark:bg-[#242C29] sm:h-[390px]">
              {/* Image: Indian community health worker educating village women and families about hygiene and preventive healthcare */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 text-7xl dark:from-[#303C36] dark:to-[#1E2522]">
                🩺
              </div>

              <img
                src="/images/health-education-community.jpg"
                alt="Community health worker sharing healthcare information with families"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />

              <div className="absolute bottom-7 left-7 right-7 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                  HEALTH AWARENESS
                </p>
                <h2 className="mt-2 max-w-sm text-2xl font-extrabold sm:text-3xl">
                  Small health habits can make a big difference.
                </h2>
              </div>
            </div>

            <div className="absolute -bottom-5 right-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-[#3C4942] dark:bg-[#242C29] sm:-right-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-2xl dark:bg-[#39B982]/15">
                  🌱
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-[#F5F7F5]">
                    Prevention First
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                    Learn • Practice • Stay Healthy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource library */}
        <div id="resource-library" className="mt-24 scroll-mt-24">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-[#55CD96]">
                LEARNING LIBRARY
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#183B56] dark:text-[#F5F7F5] sm:text-3xl">
                Explore Health Topics
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-[#A0AEA5]">
                Choose a topic to explore useful healthcare tips.
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 dark:bg-[#242C29] dark:text-[#D0DAD3]">
              {filteredResources.length} topics available
            </span>
          </div>

          {/* Category filters */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                aria-pressed={activeCategory === category}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 dark:bg-[#39B982] dark:text-[#10251B] dark:shadow-none"
                    : "border border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:border-[#3C4942] dark:bg-[#242C29] dark:text-[#D0DAD3] dark:hover:border-[#39B982] dark:hover:text-[#55CD96]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Resource cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <article
                key={resource.id}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-gray-50 p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-[#3C4942] dark:bg-[#242C29] dark:hover:border-[#39B982]/50"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl transition group-hover:scale-105 dark:bg-[#303C36]">
                    {resource.icon}
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-[#39B982]/10 dark:text-[#55CD96]">
                    {resource.category}
                  </span>
                </div>

                <h3 className="mb-3 text-xl font-bold text-slate-800 dark:text-[#F5F7F5]">
                  {resource.title}
                </h3>

                <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-[#A0AEA5]">
                  {resource.description}
                </p>

                <div className="mb-6 rounded-xl bg-white p-4 dark:bg-[#1E2522]">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#A0AEA5]">
                    Helpful Tips
                  </p>

                  <ul className="space-y-3">
                    {resource.tips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm leading-relaxed text-slate-700 dark:text-[#D0DAD3]"
                      >
                        <span className="mt-0.5 font-bold text-green-600 dark:text-[#39B982]">
                          ✓
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {resource.link && (
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 font-bold text-blue-600 transition hover:gap-3 hover:underline dark:text-[#55CD96]"
                  >
                    {resource.linkText}
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Health information disclaimer */}
        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-400/20 dark:bg-[#242C29] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-200">
                Health Information Disclaimer
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-900 dark:text-[#D0DAD3]">
                These resources provide general health education only. They are
                not a substitute for professional medical advice, diagnosis, or
                treatment. Always consult a qualified healthcare professional
                for personal medical concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HealthResources;
