import { Link } from "react-router-dom";

function Consultation() {
  const isLoggedIn = Boolean(localStorage.getItem("aayushman-token"));

  const steps = [
    {
      number: "01",
      icon: "👨‍⚕️",
      title: "Find a Doctor",
      description:
        "Explore registered healthcare professionals and choose a doctor.",
    },
    {
      number: "02",
      icon: "📅",
      title: "Request an Appointment",
      description:
        "Select your preferred date and time and submit your appointment request.",
    },
    {
      number: "03",
      icon: "📹",
      title: "Consult Online",
      description:
        "After the appointment is accepted, use the available consultation feature.",
    },
  ];

  return (
    <section
      id="consultation"
      className="bg-gradient-to-br from-[#F3FAFC] via-[#E3F5F6] to-[#CDECEF] py-16 transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#171C1B] dark:via-[#1D2B2B] dark:to-[#24403F] sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main introduction: image on the left, content on the right */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Main consultation image */}
          <div className="relative">
            <div className="relative h-[330px] overflow-hidden rounded-[2rem] bg-blue-100 shadow-xl dark:bg-[#242C29] sm:h-[430px]">
              <img
                src="/images/online-consultation-doctor.jpg"
                alt="Doctor providing an online consultation"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white sm:bottom-8 sm:left-8">
                <span className="inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur-md">
                  HEALTHCARE FROM ANYWHERE
                </span>

                <h2 className="mt-4 max-w-md text-3xl font-extrabold leading-tight sm:text-4xl">
                  Expert Care, Even From Your Home
                </h2>
              </div>
            </div>

            {/* Small floating information card */}
            <div className="absolute -bottom-5 right-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-[#3C4942] dark:bg-[#242C29] sm:-right-5 sm:p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl dark:bg-[#39B982]/15">
                📹
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-[#F5F7F5]">
                  Online Consultation
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                  Connect with a doctor
                </p>
              </div>
            </div>
          </div>

          {/* Introduction content */}
          <div className="pt-5 lg:pt-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-[#39B982]/10 dark:text-[#55CD96]">
              <span className="h-2 w-2 rounded-full bg-current" />
              DIGITAL HEALTHCARE
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 dark:text-[#F5F7F5] sm:text-5xl">
              Healthcare Without
              <span className="block text-blue-600 dark:text-[#39B982]">
                Distance.
              </span>
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-[#A0AEA5]">
              People living in rural areas may need to travel long distances to
              consult a healthcare professional. AAYUSHMAN explores how digital
              consultation can make access to healthcare easier.
            </p>

            <div className="mt-7 space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-[#39B982]/15 dark:text-[#55CD96]">
                  ✓
                </span>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-[#F5F7F5]">
                    Connect with Registered Doctors
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-[#A0AEA5]">
                    Explore available healthcare professionals.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-[#39B982]/15 dark:text-[#55CD96]">
                  ✓
                </span>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-[#F5F7F5]">
                    Request an Appointment Online
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-[#A0AEA5]">
                    Choose your preferred date and time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-[#39B982]/15 dark:text-[#55CD96]">
                  ✓
                </span>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-[#F5F7F5]">
                    Consult Without Unnecessary Travel
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-[#A0AEA5]">
                    Use the available online consultation feature.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/doctors"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B] dark:shadow-none dark:hover:bg-[#55CD96]"
            >
              Find a Doctor <span>→</span>
            </Link>
          </div>
        </div>

        {/* Consultation options */}
        <div className="mt-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-[#55CD96]">
              Consultation Options
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-[#F5F7F5] sm:text-4xl">
              Choose How You Connect
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-[#A0AEA5]">
              Explore the consultation options available through the AAYUSHMAN
              prototype.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Video consultation card */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-[#3C4942] dark:bg-[#242C29]">
              <div className="relative h-52 overflow-hidden bg-blue-100 dark:bg-[#1E2522]">
                <img
                  src="/images/video-consultation.jpg"
                  alt="Doctor and patient during a video consultation"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-slate-800 shadow-sm">
                  VIDEO CONSULTATION
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-[#F5F7F5]">
                  Face-to-Face Video Consultation
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-[#A0AEA5]">
                  Connect with a doctor through a video call after your
                  appointment has been accepted.
                </p>
              </div>
            </div>

            {/* Audio consultation card */}
            <div className="flex flex-col justify-center rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-[#3C4942] dark:bg-[#242C29] sm:p-9">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-4xl dark:bg-[#39B982]/10">
                🎙️
              </div>

              <span className="mt-6 text-xs font-bold tracking-widest text-blue-600 dark:text-[#55CD96]">
                AUDIO CONSULTATION
              </span>

              <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-[#F5F7F5]">
                Talk to a Healthcare Professional
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-[#A0AEA5]">
                An audio-based consultation option for situations where a video
                call may not be convenient.
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-[#D0DAD3]">
                <span className="text-xl">🎧</span>
                Voice-based communication
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-[#55CD96]">
              Simple Process
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-[#F5F7F5] sm:text-4xl">
              How Online Consultation Works
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-[#A0AEA5]">
              Follow three simple steps to request an online consultation.
            </p>
          </div>

          <div className="relative mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-[#3C4942] dark:bg-[#242C29]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl dark:bg-[#303C36]">
                    {step.icon}
                  </div>

                  <span className="text-4xl font-extrabold text-blue-100 dark:text-[#303C36]">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-[#F5F7F5]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-[#A0AEA5]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard link for logged-in users */}
        {isLoggedIn && (
          <div className="mt-10 text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-blue-600 px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50 dark:border-[#39B982] dark:text-[#55CD96] dark:hover:bg-[#242C29]"
            >
              Go to My Dashboard →
            </Link>
          </div>
        )}

        {/* Prototype notice */}
        <div className="mt-14 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-[#3C4942] dark:bg-[#242C29] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <p className="text-sm leading-7 text-blue-900 dark:text-[#D0DAD3]">
              <strong>Portfolio prototype:</strong> Online consultation
              functionality is demonstrated through the existing appointment and
              video consultation features. A real doctor network and clinical
              service are not currently deployed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Consultation;
