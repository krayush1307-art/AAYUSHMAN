function About() {
  const projectHighlights = [
    {
      icon: "🏥",
      title: "The Problem",
      description:
        "In rural communities, finding nearby healthcare, accessing doctors, getting medicines and arranging emergency transport can be difficult.",
    },
    {
      icon: "💡",
      title: "The Approach",
      description:
        "AAYUSHMAN brings healthcare discovery, doctor appointments, medicine ordering, ambulance request demos and an AI health assistant into one platform.",
    },
    {
      icon: "💻",
      title: "The Project",
      description:
        "A full-stack MERN portfolio prototype built to explore how technology can help make healthcare information and services easier to access.",
    },
  ];

  const technologies = [
    "MongoDB",
    "Express.js",
    "React",
    "Node.js",
    "REST APIs",
  ];

  return (
    <section
      id="about"
      className="bg-gradient-to-br from-[#F5F9FE] via-[#E8F5F2] to-[#D1EEE5] px-4 py-20 transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#171C1B] dark:via-[#202C27] dark:to-[#263B32] sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        {/* Introduction: Text on left and village healthcare image on right */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-[#39B982]">
              About AAYUSHMAN
            </p>

            <h2 className="text-3xl font-extrabold leading-tight text-[#183B56] dark:text-[#F5F7F5] sm:text-4xl lg:text-5xl">
              Healthcare,
              <span className="block text-blue-600 dark:text-[#39B982]">
                Closer to You.
              </span>
            </h2>

            <p className="mt-6 text-base leading-8 text-gray-600 dark:text-[#D0DAD3]">
              AAYUSHMAN is inspired by the healthcare access challenges I have
              observed around my village Puranankar Balha in Gaighat,Bihar. The
              idea is simple: make it easier for people to discover healthcare
              resources and explore digital ways to connect with them.
            </p>

            <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-[#A0AEA5]">
              Our vision is to explore how technology can help bridge the gap
              between rural communities and essential healthcare information.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#183B56] dark:border-[#3C4942] dark:bg-[#242C29] dark:text-[#D0DAD3]">
                Rural Healthcare
              </span>

              <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#183B56] dark:border-[#3C4942] dark:bg-[#242C29] dark:text-[#D0DAD3]">
                Digital Innovation
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-blue-100/70 dark:bg-[#39B982]/10" />

            <div className="relative h-[300px] overflow-hidden rounded-3xl border border-blue-100 shadow-xl dark:border-[#3C4942] sm:h-[380px]">
              {/* Image: Indian village healthcare centre with a community health worker helping a patient */}
              <img
                src="/images/about-rural-healthcare.jpg"
                alt="Community healthcare support in a rural Indian village"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <div className="absolute inset-0 -z-10 flex items-center justify-center bg-blue-50 dark:bg-[#242C29]">
                <span className="text-7xl">🏥</span>
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-6 pt-20">
                <p className="text-lg font-bold text-white">
                  Better Access. Better Awareness.
                </p>
                <p className="mt-1 text-sm text-white/85">
                  Exploring healthcare solutions for rural communities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Problem, approach and project cards */}
        <div className="mt-20">
          <div className="mb-9 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-[#39B982]">
              Why AAYUSHMAN?
            </p>

            <h3 className="mt-3 text-2xl font-extrabold text-[#183B56] dark:text-[#F5F7F5] sm:text-3xl">
              From a Real Problem to a Digital Idea
            </h3>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-[#A0AEA5]">
              Understanding the challenge, exploring a solution and building a
              technology-driven prototype.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {projectHighlights.map((item, index) => (
              <article
                key={item.title}
                className="group rounded-2xl border border-blue-100 bg-blue-50 p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-[#3C4942] dark:bg-[#242C29] dark:hover:border-[#39B982]/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm dark:bg-[#303C36]">
                    {item.icon}
                  </div>

                  <span className="text-sm font-bold text-blue-300 dark:text-[#39B982]/50">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-[#183B56] dark:text-[#F5F7F5]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-[#A0AEA5]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Project scope and transparency */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-cyan-200 bg-cyan-50 p-7 dark:border-[#3C4942] dark:bg-[#1E2522] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-[#39B982]">
                Project Scope
              </p>

              <h3 className="mt-3 text-2xl font-extrabold text-[#183B56] dark:text-[#F5F7F5]">
                Built as a Portfolio Project
              </h3>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-700 dark:text-[#D0DAD3]">
                The current version demonstrates user authentication, role-based
                dashboards, appointment workflows, pharmacy inventory and demo
                orders, ambulance request tracking and an AI-powered health
                information assistant.
              </p>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-700 dark:text-[#A0AEA5]">
                This is a functional prototype, not a live healthcare service.
                Real-world deployment would require verified healthcare
                partners, operational support, clinical validation, regulatory
                compliance and appropriate funding.
              </p>
            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm dark:bg-[#303C36]">
              🚀
            </div>
          </div>

          {/* Technologies used */}
          <div className="mt-8 border-t border-cyan-200 pt-7 dark:border-[#3C4942]">
            <p className="mb-4 text-sm font-bold text-[#183B56] dark:text-[#F5F7F5]">
              Technologies Used
            </p>

            <div className="flex flex-wrap gap-3">
              {technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-xs font-semibold text-[#183B56] transition-colors hover:border-blue-400 dark:border-[#3C4942] dark:bg-[#242C29] dark:text-[#D0DAD3] dark:hover:border-[#39B982]"
                >
                  {technology}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
