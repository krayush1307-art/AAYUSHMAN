import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Village and healthcare photos.
// Save these files inside client/public/images/
const villageSlides = [
  {
    id: "village",
    image: "/images/balha-village.jpg",
    alt: "A view of Balha village in Bihar",
    label: "OUR COMMUNITY",
    title: "Every village deserves better healthcare.",
    description:
      "Inspired by the people and healthcare needs of our community.",
  },
  {
    id: "health-centre",
    image: "/images/gaighat-health-centre.jpg",
    alt: "A rural healthcare centre",
    label: "LOCAL HEALTHCARE",
    title: "Healthcare closer to home.",
    description: "Helping people discover nearby healthcare facilities.",
  },

  {
    id: "health-worker",
    image: "/images/village-health-worker.jpg",
    alt: "A community health worker helping village residents",
    label: "COMMUNITY CARE",
    title: "Stronger communities, healthier lives.",
    description:
      "Supporting awareness and better access to health information.",
  },
  {
    id: "ambulance",
    image: "/images/rural-ambulance.jpg",
    alt: "An ambulance on a rural Indian road",
    label: "EMERGENCY SUPPORT",
    title: "Every moment matters.",
    description:
      "Bringing emergency healthcare awareness closer to rural communities.",
  },
];

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [failedImages, setFailedImages] = useState({});

  // Automatically change the carousel photo every five seconds.
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % villageSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setActiveSlide((current) => (current + 1) % villageSlides.length);
  };

  const previousSlide = () => {
    setActiveSlide(
      (current) => (current - 1 + villageSlides.length) % villageSlides.length,
    );
  };

  const currentSlide = villageSlides[activeSlide];

  const features = [
    {
      icon: "🏥",
      title: "Find Healthcare",
      description: "Explore nearby healthcare facilities",
      link: "/find-care",
    },
    {
      icon: "👨‍⚕️",
      title: "Doctor Consultation",
      description: "Connect with healthcare professionals",
      link: "/doctors",
    },
    {
      icon: "💊",
      title: "Medicine Support",
      description: "Explore medicine information",
      link: "/medicines",
    },
    {
      icon: "🤖",
      title: "AI Health Assistant",
      description: "Get multilingual health guidance",
      link: "/ai-assistant",
    },
  ];

  return (
    <section
      id="home"
      className="
    overflow-hidden
    bg-gradient-to-r
    from-[#F5F9FE]
    via-[#EAF6FF]
    to-[#B9E5FF]
    transition-colors duration-300
    dark:bg-gradient-to-r
    dark:from-[#171C1B]
    dark:via-[#1E2522]
    dark:to-[#263B32]
  "
    >
      {/* HERO INTRO */}
      <div className="mx-auto max-w-7xl px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* LEFT: HERO TEXT */}
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-blue-200/80 bg-white px-4 py-2.5 shadow-sm dark:border-[#39B982]/25 dark:bg-[#242C29]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50 dark:bg-[#39B982]" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500 dark:bg-[#39B982]" />
              </span>

              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-700 dark:text-[#55CD96]">
                Rural Healthcare, Reimagined
              </span>
            </div>

            <h1 className="max-w-2xl text-[42px] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-[64px] dark:text-[#F5F7F5]">
              Healthcare,
              <span className="mt-2 block text-blue-600 dark:text-[#39B982]">
                Closer to You.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg dark:text-[#C0CCC5]">
              Distance should never stand between you and better healthcare.
              Discover nearby health facilities, connect with doctors, explore
              medicine information and access digital health assistance — all in
              one place.
            </p>

            {/* MAIN ACTION BUTTONS */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/find-care"
                className="group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl dark:bg-[#39B982] dark:text-[#10251B] dark:shadow-[#39B982]/15 dark:hover:bg-[#55CD96]"
              >
                Find Healthcare
                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                to="/ai-assistant"
                className="group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 dark:border-[#3C4942] dark:bg-[#242C29] dark:text-[#F5F7F5] dark:hover:border-[#39B982] dark:hover:bg-[#303C36]"
              >
                <span className="text-lg dark:text-[#39B982]">✦</span>
                Talk to AI Assistant
              </Link>
            </div>

            {/* SUPPORTING HIGHLIGHTS */}
            <div className="mt-11 grid max-w-xl grid-cols-3 border-t border-slate-200 pt-7 dark:border-[#3C4942]">
              <div className="pr-3">
                <div className="mb-2 text-xl">🩺</div>
                <p className="text-sm font-bold text-slate-800 dark:text-[#F5F7F5]">
                  Healthcare
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                  Discovery
                </p>
              </div>

              <div className="border-l border-slate-200 px-4 dark:border-[#3C4942]">
                <div className="mb-2 text-xl">🌐</div>
                <p className="text-sm font-bold text-slate-800 dark:text-[#F5F7F5]">
                  Digital
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                  Consultation
                </p>
              </div>

              <div className="border-l border-slate-200 pl-4 dark:border-[#3C4942]">
                <div className="mb-2 text-xl">💬</div>
                <p className="text-sm font-bold text-slate-800 dark:text-[#F5F7F5]">
                  Multilingual
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                  Assistance
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: SINGLE HEALTHCARE PHOTO */}
          <div className="relative mx-auto w-full h-full max-w-[540px]">
            <div className="relative h-[350px] overflow-hidden rounded-[28px] bg-slate-200 shadow-xl sm:h-[430px] dark:bg-[#242C29]">
              {!failedImages.hero ? (
                <img
                  src="/images/rural-doctor-consultation.jpg"
                  alt="A rural doctor helping a patient"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() =>
                    setFailedImages((previous) => ({
                      ...previous,
                      hero: true,
                    }))
                  }
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-[#303C36] dark:to-[#171C1B]">
                  <div className="px-6 text-center">
                    <div className="text-6xl">🩺</div>
                    <p className="mt-4 text-lg font-bold text-blue-900 dark:text-[#F5F7F5]">
                      Community Healthcare
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#102F45]/70 via-transparent to-transparent dark:from-[#101713]/75" />

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/25 bg-black/25 p-5 text-white backdrop-blur-sm sm:bottom-8 sm:left-8 sm:right-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200 dark:text-[#55CD96]">
                  AAYUSHMAN
                </p>
                <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
                  Healthcare support for every community.
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH VILLAGE AND HEALTHCARE CAROUSEL */}
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <div className="relative h-[360px] overflow-hidden bg-slate-300 sm:h-[460px] lg:h-[520px] dark:bg-[#242C29]">
          {/* FULL BLEED SLIDE PHOTO */}
          {!failedImages[currentSlide.id] ? (
            <img
              key={currentSlide.id}
              src={currentSlide.image}
              alt={currentSlide.alt}
              className="absolute inset-0 h-full w-full object-cover object-center"
              onError={() =>
                setFailedImages((previous) => ({
                  ...previous,
                  [currentSlide.id]: true,
                }))
              }
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-400 to-slate-600 px-6 text-center dark:from-[#303C36] dark:to-[#171C1B]">
              <div>
                <p className="text-2xl font-bold text-white">
                  Photo unavailable
                </p>
                <p className="mt-3 break-all text-sm text-white/80">
                  Check: {currentSlide.image}
                </p>
              </div>
            </div>
          )}

          {/* PHOTO TEXT GRADIENT */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/20" />

          {/* SLIDE LABEL */}
          <div className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/30 px-4 py-2.5 text-xs font-bold tracking-wide text-white backdrop-blur-md sm:left-10 sm:top-10 lg:left-16">
            <span className="h-2 w-2 rounded-full bg-[#39B982]" />
            {currentSlide.label}
          </div>

          {/* PREVIOUS SLIDE */}
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/30 text-3xl leading-none text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/60 sm:left-8 lg:left-12"
          >
            ‹
          </button>

          {/* NEXT SLIDE */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/30 text-3xl leading-none text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/60 sm:right-8 lg:right-12"
          >
            ›
          </button>

          {/* SLIDE TEXT */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-7xl px-8 pb-16 pt-24 sm:px-16 sm:pb-20 lg:px-24"
            aria-live="polite"
          >
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#55CD96]">
              AAYUSHMAN COMMUNITY
            </p>

            <h2 className="max-w-3xl text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {currentSlide.title}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
              {currentSlide.description}
            </p>
          </div>

          {/* CAROUSEL DOTS */}
          <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
            {villageSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Show photo ${index + 1}: ${slide.label}`}
                aria-current={activeSlide === index ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeSlide === index
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/55 hover:bg-white"
                }`}
              />
            ))}
          </div>

          {/* SLIDE COUNTER */}
          <div className="absolute bottom-7 right-6 z-20 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-xs font-bold text-white backdrop-blur-md sm:right-10">
            {String(activeSlide + 1).padStart(2, "0")} / 05
          </div>
        </div>
      </div>

      {/* QUICK ACCESS SERVICES */}
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-20">
        <div id="services" className="scroll-mt-24">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600 dark:text-[#39B982]">
                EXPLORE AAYUSHMAN
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-[#F5F7F5]">
                Healthcare services, all in one place.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-[#A0AEA5]">
              Start with the service you need and explore available healthcare
              support.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => (
              <Link
                key={item.title}
                to={item.link}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-[#3C4942] dark:bg-[#242C29] dark:hover:border-[#39B982] dark:hover:bg-[#303C36] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl transition-colors group-hover:bg-blue-100 dark:bg-[#39B982]/10 dark:group-hover:bg-[#39B982]/20">
                  {item.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-800 transition-colors group-hover:text-blue-600 dark:text-[#F5F7F5] dark:group-hover:text-[#55CD96]">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-[#A0AEA5]">
                    {item.description}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 transition-all group-hover:gap-2 dark:text-[#39B982]">
                    Explore
                    <span>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* EMERGENCY SUPPORT */}
        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-red-400/20 dark:bg-[#242C29]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-2xl dark:bg-red-400/10">
              🚨
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F5F7F5]">
                Facing a medical emergency?
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-[#A0AEA5]">
                Call India's emergency response number for immediate assistance.
              </p>
            </div>
          </div>

          <a
            href="tel:112"
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-red-700 sm:w-auto"
          >
            <span>☎</span>
            Call 112
          </a>
        </div>

        {/* DEMO DISCLAIMER */}
        <p className="mt-6 text-center text-xs leading-5 text-slate-400 dark:text-[#87968D]">
          AAYUSHMAN is a healthcare portfolio prototype. Some services and
          provider information may contain demo content.
        </p>
      </div>
    </section>
  );
}

export default Hero;
