import { useEffect, useRef, useState } from "react";

// Load Jitsi only when a video consultation is opened.
let jitsiScriptPromise = null;

function loadJitsiScript() {
  if (window.JitsiMeetExternalAPI) {
    return Promise.resolve();
  }

  if (!jitsiScriptPromise) {
    jitsiScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;

      script.onload = resolve;

      script.onerror = () => {
        jitsiScriptPromise = null;
        script.remove();
        reject(new Error("Unable to load the video calling service."));
      };

      document.body.appendChild(script);
    });
  }

  return jitsiScriptPromise;
}

function VideoConsultation({ appointmentId, displayName, onClose }) {
  const meetingContainer = useRef(null);
  const meetingApi = useRef(null);
  const closeCalled = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Close the meeting safely only once.
  const handleClose = () => {
    if (closeCalled.current) return;

    closeCalled.current = true;

    meetingApi.current?.dispose();
    meetingApi.current = null;

    onClose?.();
  };

  useEffect(() => {
    let cancelled = false;

    const startMeeting = async () => {
      try {
        setLoading(true);
        setError("");

        if (!appointmentId) {
          throw new Error("Appointment ID is missing.");
        }

        await loadJitsiScript();

        if (cancelled || !meetingContainer.current) return;

        // Same appointment-specific room for patient and doctor.
        const roomName = `aayushman-demo-${appointmentId}`;

        const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName,
          parentNode: meetingContainer.current,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName: displayName || "AAYUSHMAN User",
          },
          configOverwrite: {
            prejoinConfig: {
              enabled: true,
            },
          },
        });

        meetingApi.current = api;

        api.addListener("videoConferenceJoined", () => {
          if (!cancelled) {
            setLoading(false);
          }
        });

        api.addListener("videoConferenceLeft", () => {
          if (!cancelled) {
            handleClose();
          }
        });

        api.addListener("readyToClose", () => {
          if (!cancelled) {
            handleClose();
          }
        });

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to start the video call.");
          setLoading(false);
        }
      }
    };

    startMeeting();

    return () => {
      cancelled = true;

      meetingApi.current?.dispose();
      meetingApi.current = null;
    };
  }, [appointmentId, displayName]);

  // Premium theme-aware styling.
  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-[#F2F6FB] text-slate-900 dark:bg-[#171C1B] dark:text-[#F5F7F5]">
      {/* Top Navigation */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-[#3C4942] dark:bg-[#1E2522] sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white dark:bg-[#39B982] dark:text-[#10251B]">
            ✚
          </div>

          <div>
            <h1 className="text-lg font-extrabold tracking-tight">AAYUSHMAN</h1>
            <p className="text-[10px] font-medium tracking-[0.16em] text-slate-500 dark:text-[#A0AEA5]">
              HEALTHCARE, CLOSER TO YOU
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 dark:border-[#3C4942] dark:bg-[#242C29] sm:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-green-700 dark:text-[#55CD96]">
            Consultation Room
          </span>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 sm:px-5"
        >
          End Call
        </button>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-5 p-4 sm:p-6 lg:flex-row lg:p-7">
        {/* Left: Meeting Section */}
        <section className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Meeting Heading */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-[#39B982]">
                Live Healthcare Session
              </p>
              <h2 className="text-xl font-extrabold sm:text-2xl">
                Video Consultation
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-[#A0AEA5]">
                Connect with your healthcare professional
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-[#3C4942] dark:bg-[#242C29]">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Appointment
              </p>
              <p className="max-w-[150px] truncate text-sm font-bold">
                {appointmentId || "Not available"}
              </p>
            </div>
          </div>

          {/* Video Frame */}
          <div className="relative flex min-h-[380px] flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#101816] shadow-xl dark:border-[#3C4942] sm:min-h-[480px] lg:min-h-[560px]">
            {/* Original Jitsi Meeting Container */}
            <div
              ref={meetingContainer}
              className="absolute inset-0 h-full w-full"
            />

            {/* Loading Screen */}
            {loading && !error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#101816] px-5 text-center text-white">
                <div className="max-w-sm">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#39B982]/30 bg-[#39B982]/10 text-4xl">
                    📹
                  </div>

                  <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#39B982]" />

                  <h3 className="text-xl font-bold">
                    Connecting your consultation
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Preparing your video meeting room. Please wait a moment.
                  </p>

                  <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
                    Allow camera and microphone access when your browser asks.
                  </div>
                </div>
              </div>
            )}

            {/* Error Screen */}
            {error && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#101816] p-6 text-center text-white">
                <div className="max-w-sm">
                  <div className="text-5xl">⚠️</div>

                  <h3 className="mt-5 text-xl font-bold">
                    Video Call Unavailable
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-6 rounded-xl bg-[#39B982] px-6 py-3 font-bold text-[#10251B] transition hover:bg-[#55CD96]"
                  >
                    Close Consultation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Meeting Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-[#3C4942] dark:bg-[#242C29]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg dark:bg-[#303C36]">
                🔒
              </div>
              <div>
                <p className="text-sm font-bold">Your consultation matters</p>
                <p className="text-xs text-slate-500 dark:text-[#A0AEA5]">
                  Please use a quiet and private place.
                </p>
              </div>
            </div>

            <span className="text-xs text-slate-400">AAYUSHMAN Healthcare</span>
          </div>
        </section>

        {/* Right: Information Panel */}
        <aside className="flex w-full flex-col gap-4 lg:w-[300px] xl:w-[330px]">
          {/* Participant Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3C4942] dark:bg-[#242C29]">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Participant
            </p>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-[#303C36]">
                👤
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-bold">
                  {displayName || "AAYUSHMAN User"}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                  Meeting participant
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3C4942] dark:bg-[#242C29]">
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h3 className="font-bold">Session Details</h3>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-slate-400">Appointment ID</p>
                <p className="mt-1 break-all text-sm font-semibold">
                  {appointmentId || "Not available"}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 dark:border-[#3C4942]">
                <p className="text-xs text-slate-400">Meeting Type</p>
                <p className="mt-1 text-sm font-semibold">
                  Online Video Consultation
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 dark:border-[#3C4942]">
                <p className="text-xs text-slate-400">Platform</p>
                <p className="mt-1 text-sm font-semibold">AAYUSHMAN + Jitsi</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 dark:border-[#3C4942] dark:bg-[#1E2522]">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <h3 className="font-bold">Before You Begin</h3>
            </div>

            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-[#D0DAD3]">
              <li className="flex gap-2">
                <span className="text-green-600 dark:text-[#39B982]">✓</span>
                Check your internet connection.
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 dark:text-[#39B982]">✓</span>
                Allow camera and microphone access.
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 dark:text-[#39B982]">✓</span>
                Use headphones if possible.
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 dark:text-[#39B982]">✓</span>
                Sit somewhere quiet and private.
              </li>
            </ul>
          </div>

          {/* Demo Disclaimer */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Demo Platform Notice
            </p>
            <p className="mt-2 text-xs leading-5 text-amber-700 dark:text-amber-200/80">
              This version uses a public Jitsi meeting service. Do not share
              confidential medical information.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default VideoConsultation;
