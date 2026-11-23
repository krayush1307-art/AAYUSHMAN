import { useMemo, useState } from "react";

// Healthcare listings for the AAYUSHMAN portfolio prototype.
// Always confirm local services and availability before visiting.
const facilities = [
  {
    id: 1,
    name: "Primary Health Centre (PHC), Gaighat",
    type: "Government Hospital",
    image: "/images/gaighat-phc-front.jpg",
    location: "Gaighat",
    address: "Gaighat, Muzaffarpur, Bihar, India",
    status: "Listed in official district directory",
    source: "Muzaffarpur District Government",
    sourceUrl:
      "https://muzaffarpur.nic.in/departments/health/health-institutions/gaighat/",
  },
  {
    id: 2,
    name: "Life Line Medicos",
    type: "Pharmacy",
    image: "/images/life-line-medicos-shop.jpg",
    location: "Gaighat",
    address:
      "Gaighat Road, near Government Hospital, Gaighat, Muzaffarpur, Bihar, India",
    status: "Local map listing — verify before visiting",
    source: "Public map listing",
    sourceUrl: "",
  },
  {
    id: 3,
    name: "Prashant Memorial Charitable Hospital",
    type: "Hospital",
    image: "/images/prashant-hospital-front.jpg",
    location: "Muzaffarpur",
    address:
      "Juran Chhapra Road No. 4, Brahmapura, Muzaffarpur, Bihar 842001, India",
    status: "Details listed on official hospital website",
    source: "Official hospital website",
    sourceUrl: "https://www.prashanthospital.in/",
  },
];

function FindCare() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [type, setType] = useState("All Types");

  // Search and filters work together.
  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        facility.name.toLowerCase().includes(searchText) ||
        facility.address.toLowerCase().includes(searchText) ||
        facility.type.toLowerCase().includes(searchText);

      const matchesLocation =
        location === "All Locations" || facility.location === location;

      const matchesType = type === "All Types" || facility.type === type;

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [search, location, type]);

  const clearFilters = () => {
    setSearch("");
    setLocation("All Locations");
    setType("All Types");
  };

  const getFacilityIcon = (facilityType) => {
    if (facilityType === "Pharmacy") return "💊";
    if (facilityType === "Government Hospital") return "🏥";
    return "⚕️";
  };

  return (
    <section
      id="find-care"
      className="bg-gradient-to-br from-[#F5FAF8] via-[#EAF4EF] to-[#DCEDE3] py-16 transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#171C1B] dark:via-[#202B25] dark:to-[#293B32] sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-xs font-bold tracking-wider text-blue-700 dark:bg-[#39B982]/10 dark:text-[#55CD96]">
            <span className="h-2 w-2 rounded-full bg-current" />
            LOCAL HEALTHCARE DIRECTORY
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F5F7F5] sm:text-4xl lg:text-5xl">
            Find Healthcare Near You
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-[#A0AEA5] sm:text-base">
            Discover hospitals, government health centres and pharmacies around
            Gaighat and Muzaffarpur. Explore local healthcare options before
            planning your visit.
          </p>
        </div>

        {/* Quick information cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3C4942] dark:bg-[#242C29]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl dark:bg-[#39B982]/10">
              🏥
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-[#F5F7F5]">
                Healthcare Centres
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                Explore nearby facilities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3C4942] dark:bg-[#242C29]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl dark:bg-[#39B982]/10">
              📍
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-[#F5F7F5]">
                Local Locations
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                Gaighat and Muzaffarpur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3C4942] dark:bg-[#242C29]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl dark:bg-[#39B982]/10">
              🔎
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-[#F5F7F5]">
                Easy Search
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                Filter by location and type
              </p>
            </div>
          </div>
        </div>

        {/* Search and filter panel */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3C4942] dark:bg-[#242C29] sm:p-7">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F5F7F5]">
              Search Healthcare Facilities
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#A0AEA5]">
              Find a hospital, health centre or pharmacy.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Search input */}
            <div>
              <label
                htmlFor="facility-search"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-[#D0DAD3]"
              >
                Search
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:border-[#3C4942] dark:bg-[#1E2522] dark:focus-within:border-[#39B982] dark:focus-within:ring-[#39B982]/10">
                <span className="text-lg" aria-hidden="true">
                  🔍
                </span>

                <input
                  id="facility-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Hospital or pharmacy..."
                  aria-label="Search healthcare facilities"
                  className="w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-[#F5F7F5] dark:placeholder:text-[#77877D]"
                />
              </div>
            </div>

            {/* Location filter */}
            <div>
              <label
                htmlFor="facility-location"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-[#D0DAD3]"
              >
                Location
              </label>

              <select
                id="facility-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                aria-label="Filter by location"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-[#F5F7F5] dark:focus:border-[#39B982] dark:focus:ring-[#39B982]/10"
              >
                <option>All Locations</option>
                <option>Gaighat</option>
                <option>Muzaffarpur</option>
              </select>
            </div>

            {/* Facility type filter */}
            <div>
              <label
                htmlFor="facility-type"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-[#D0DAD3]"
              >
                Facility Type
              </label>

              <select
                id="facility-type"
                value={type}
                onChange={(event) => setType(event.target.value)}
                aria-label="Filter by facility type"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-[#F5F7F5] dark:focus:border-[#39B982] dark:focus:ring-[#39B982]/10"
              >
                <option>All Types</option>
                <option>Government Hospital</option>
                <option>Hospital</option>
                <option>Pharmacy</option>
              </select>
            </div>
          </div>

          {/* Search result summary */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-[#3C4942]">
            <p className="text-sm text-slate-600 dark:text-[#A0AEA5]">
              Showing{" "}
              <span className="font-bold text-slate-900 dark:text-[#F5F7F5]">
                {filteredFacilities.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900 dark:text-[#F5F7F5]">
                {facilities.length}
              </span>{" "}
              healthcare facilities
            </p>

            {(search ||
              location !== "All Locations" ||
              type !== "All Types") && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-[#55CD96] dark:hover:bg-[#303C36]"
              >
                Clear Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* Facility listings */}
        <div className="mt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-[#55CD96]">
                Explore Local Care
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-[#F5F7F5]">
                Available Listings
              </h3>
            </div>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 dark:bg-[#303C36] dark:text-[#D0DAD3]">
              📍 Bihar, India
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFacilities.map((facility) => (
              <article
                key={facility.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-[#3C4942] dark:bg-[#242C29] dark:hover:border-[#39B982]/50"
              >
                {/* Facility photo with a visible fallback icon */}
                <div className="relative h-52 overflow-hidden bg-blue-50 dark:bg-[#1E2522]">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {getFacilityIcon(facility.type)}
                  </div>

                  <img
                    src={facility.image}
                    alt={`${facility.name} front view`}
                    loading="lazy"
                    className="relative z-10 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="absolute left-4 top-4 z-20">
                    <span className="rounded-full border border-white/50 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm dark:border-[#3C4942] dark:bg-[#242C29]/95 dark:text-[#F5F7F5]">
                      {facility.location}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden="true">
                      {getFacilityIcon(facility.type)}
                    </span>

                    <span className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-[#55CD96]">
                      {facility.type}
                    </span>
                  </div>

                  <h4 className="mt-3 min-h-[3.5rem] text-lg font-bold leading-snug text-slate-900 dark:text-[#F5F7F5]">
                    {facility.name}
                  </h4>

                  <div className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-slate-500 dark:text-[#A0AEA5]">
                    <span className="mt-0.5 shrink-0">📍</span>
                    <p>{facility.address}</p>
                  </div>

                  {/* Listing verification information */}
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">ℹ️</span>
                      <div>
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          Listing Information
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-200/80">
                          {facility.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-[#3C4942]">
                    <p className="mb-3 text-xs text-slate-400 dark:text-[#A0AEA5]">
                      Information: {facility.source}
                    </p>

                    <div className="flex flex-col gap-3">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          facility.name + ", " + facility.address,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                      >
                        View on Map <span>↗</span>
                      </a>

                      {facility.sourceUrl && (
                        <a
                          href={facility.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-center text-sm font-semibold text-blue-600 transition hover:underline dark:text-[#55CD96]"
                        >
                          Visit Information Source ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Empty search result */}
          {filteredFacilities.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-[#3C4942] dark:bg-[#242C29]">
              <div className="text-5xl">🔎</div>

              <h4 className="mt-4 text-lg font-bold text-slate-800 dark:text-[#F5F7F5]">
                No Facilities Found
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-[#A0AEA5]">
                We couldn't find a healthcare facility matching your search. Try
                another name, location or facility type.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
              >
                Show All Facilities
              </button>
            </div>
          )}
        </div>

        {/* Medical information disclaimer */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#3C4942] dark:bg-[#242C29] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚕️</span>

            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-[#F5F7F5]">
                Important Information
              </h4>

              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-[#A0AEA5]">
                AAYUSHMAN is a portfolio prototype. Listing information does not
                guarantee current doctor availability, services, opening hours
                or medicine stock. Please confirm directly before visiting. In a
                medical emergency in India, call 112.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FindCare;
