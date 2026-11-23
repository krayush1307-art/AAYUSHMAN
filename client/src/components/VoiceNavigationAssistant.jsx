import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function VoiceNavigationAssistant() {
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("hi-IN");
  const [message, setMessage] = useState(
    "Namaste! Aapko kya chahiye? Mic dabakar boliye.",
  );
  const [transcript, setTranscript] = useState("");
  const [authStep, setAuthStep] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [answers, setAnswers] = useState({});

  // Assistant panel is hidden until the mic is clicked.
  const [isOpen, setIsOpen] = useState(false);

  // Position is updated when the user drags the panel.
  const [panelPosition, setPanelPosition] = useState(null);
  const panelRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const recognitionRef = useRef(null);

  const steps = ["role", "name", "phone", "email"];

  const questions = {
    role: "Aap Patient, Doctor, Pharmacy ya Ambulance Operator mein se kya hain?",
    name: "Aapka poora naam kya hai?",
    phone: "Aapka 10 digit mobile number kya hai?",
    email: "Aapka email address kya hai?",
  };

  const fieldLabels = {
    role: "role",
    name: "naam",
    phone: "mobile number",
    email: "email address",
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = (text, selectedLanguage = language) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = selectedLanguage;
    speech.rate = 0.95;

    window.speechSynthesis.speak(speech);
  };

  const reply = (text) => {
    setMessage(text);
    speak(text);
  };

  const sendFormEvent = (detail) => {
    window.dispatchEvent(new CustomEvent("aayushman-voice-form", { detail }));
  };

  const setFormField = (field, value) => {
    sendFormEvent({
      action: "setField",
      field,
      value,
    });

    setAnswers((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Navigate to dedicated website pages.
  const navigateToSection = (sectionId, response) => {
    const routes = {
      home: "/",
      services: "/",
      dashboard: "/dashboard",
      doctors: "/doctors",
      medicines: "/medicines",
      ambulance: "/ambulance",
      "ai-assistant": "/ai-assistant",
      "find-care": "/find-care",
      consultation: "/consultation",
      "health-resources": "/health-resources",
      about: "/about",
    };

    const route = routes[sectionId];

    if (!route) {
      reply("Maaf kijiye, ye page available nahi hai.");
      return false;
    }

    navigate(route);
    reply(response);

    return true;
  };

  const startAuthentication = () => {
    if (localStorage.getItem("aayushman-token")) {
      navigate("/dashboard");
      reply("Aap pehle se login hain. Aapka dashboard khol raha hoon.");
      return;
    }

    navigate("/login");

    setAnswers({});
    setConfirming(false);
    setAuthStep("choice");

    reply(
      "Aap login karna chahte hain ya naya account register karna chahte hain?",
    );
  };

  const askStep = (step) => {
    setAuthStep(step);
    setConfirming(false);

    if (step === "loginEmail") {
      reply("Aapka registered email address kya hai?");
      return;
    }

    if (step === "loginPassword") {
      reply(
        "Ab password screen par type kijiye. Password mujhe bolne ki zaroorat nahi hai. Phir Login button dabaiye.",
      );
      return;
    }

    if (step === "password") {
      reply(
        "Aapki details taiyar hain. Ab screen par password aur confirm password khud type kijiye. Phir Create Account button dabaiye.",
      );
      return;
    }

    reply(questions[step]);
  };

  const startRegistration = () => {
    sendFormEvent({
      action: "switchTab",
      tab: "register",
    });

    setAnswers({});
    askStep("role");
  };

  const startLogin = () => {
    sendFormEvent({
      action: "switchTab",
      tab: "login",
    });

    setAnswers({});
    askStep("loginEmail");
  };

  const showConfirmation = (field, value) => {
    setFormField(field, value);
    setConfirming(true);

    let displayedValue = value;

    if (field === "phone") {
      displayedValue = `ending in ${value.slice(-4)}`;
    }

    reply(
      `Maine aapka ${fieldLabels[field]} ${displayedValue} suna hai. Kya ye sahi hai? Haan ya nahi boliye.`,
    );
  };

  const getPreviousStep = () => {
    if (authStep === "loginEmail" || authStep === "loginPassword") {
      return "loginEmail";
    }

    if (authStep === "password") return "email";

    const index = steps.indexOf(authStep);

    if (index > 0) return steps[index - 1];

    return "role";
  };

  const moveForward = () => {
    if (authStep === "role") {
      askStep("name");
    } else if (authStep === "name") {
      askStep("phone");
    } else if (authStep === "phone") {
      askStep("email");
    } else if (authStep === "email") {
      askStep("password");
    } else if (authStep === "loginEmail") {
      askStep("loginPassword");
    }
  };

  const detectCorrection = (text) => {
    const wantsCorrection =
      /change|correct|edit|wrong|galat|badlo|dobara|repeat|sahi karo|sudhar|badalna|बदलो|गलत|सुधार|दोबारा|बदलना/i.test(
        text,
      );

    if (!wantsCorrection) return "";

    if (/name|naam|नाम/i.test(text)) return "name";

    if (/phone|mobile|number|नंबर|मोबाइल|फोन/i.test(text)) {
      return "phone";
    }

    if (/email|gmail|mail|ईमेल|जीमेल/i.test(text)) {
      return "email";
    }

    if (/role|account type|patient|doctor|pharmacy|ambulance|रोल/i.test(text)) {
      return "role";
    }

    return "";
  };

  const normalizeEmail = (value) => {
    return value
      .toLowerCase()
      .replace(/\s+at the rate\s+/g, "@")
      .replace(/\s+at rate\s+/g, "@")
      .replace(/\s+at\s+/g, "@")
      .replace(/\s+dot\s+/g, ".")
      .replace(/\s+underscore\s+/g, "_")
      .replace(/\s+hyphen\s+/g, "-")
      .replace(/\s+/g, "");
  };

  const normalizeDigits = (value) => {
    const hindiDigits = "०१२३४५६७८९";

    return value
      .replace(/[०-९]/g, (digit) => String(hindiDigits.indexOf(digit)))
      .replace(/\D/g, "");
  };

  const processAuthentication = (text) => {
    const value = text.trim();

    if (
      /cancel|stop registration|cancel registration|रद्द|बंद करो|छोड़ दो|cancel kar do/i.test(
        value,
      )
    ) {
      setAuthStep("");
      setConfirming(false);
      setAnswers({});

      reply("Theek hai. Login ya registration process cancel kar diya hai.");
      return true;
    }

    if (
      /repeat|again|dobara pucho|phir se pucho|sawaal dobara|फिर से पूछो|दोबारा पूछो/i.test(
        value,
      )
    ) {
      if (confirming) {
        reply("Kya aapka diya hua jawab sahi hai? Haan ya nahi boliye.");
      } else {
        askStep(authStep);
      }

      return true;
    }

    if (/back|previous|pichhla|peeche|wapas|पिछला|पीछे|वापस/i.test(value)) {
      if (authStep === "choice" || authStep === "role") {
        reply("Aap pehle hi shuruaat par hain.");
      } else {
        askStep(getPreviousStep());
      }

      return true;
    }

    const correctionField = detectCorrection(value);

    if (correctionField) {
      if (
        correctionField === "role" ||
        correctionField === "name" ||
        correctionField === "phone" ||
        correctionField === "email"
      ) {
        if (authStep.startsWith("login")) {
          if (correctionField === "email") {
            askStep("loginEmail");
          } else {
            reply("Login mein abhi sirf email change kiya ja sakta hai.");
          }
        } else {
          askStep(correctionField);
        }
      }

      return true;
    }

    if (authStep === "choice") {
      if (
        /register|registration|sign up|account banao|रजिस्टर|खाता बनाना|नया अकाउंट|नया खाता/i.test(
          value,
        )
      ) {
        startRegistration();
        return true;
      }

      if (
        /login|log in|sign in|लॉगिन|लॉग इन|पहले से अकाउंट|पहले से खाता/i.test(
          value,
        )
      ) {
        startLogin();
        return true;
      }

      reply("Kripya boliye, login karna hai ya register?");
      return true;
    }

    if (confirming) {
      if (
        /yes|yeah|correct|right|haan|han|ji haan|sahi|ठीक|हाँ|हां|सही/i.test(
          value,
        )
      ) {
        setConfirming(false);
        moveForward();
        return true;
      }

      if (/no|nahi|nahin|wrong|galat|नहीं|गलत/i.test(value)) {
        setConfirming(false);
        reply(`Theek hai. ${questions[authStep]} Dobara batayein.`);
        return true;
      }

      reply(
        "Kripya haan ya nahi mein jawab dijiye. Ya boliye change name, change mobile ya change email.",
      );
      return true;
    }

    if (authStep === "role") {
      let role = "";

      if (/patient|पेशेंट|मरीज|मरीज़|रोगी/i.test(value)) {
        role = "Patient";
      } else if (/doctor|डॉक्टर|डाक्टर/i.test(value)) {
        role = "Doctor";
      } else if (
        /pharmacy|chemist|medical|मेडिकल|दवा दुकान|फार्मेसी/i.test(value)
      ) {
        role = "Pharmacy";
      } else if (/ambulance|operator|एंबुलेंस|एम्बुलेंस|चालक/i.test(value)) {
        role = "Ambulance Operator";
      }

      if (!role) {
        reply(
          "Patient, Doctor, Pharmacy ya Ambulance Operator mein se ek chuniye.",
        );
        return true;
      }

      showConfirmation("role", role);
      return true;
    }

    if (authStep === "name") {
      if (value.length < 2 || value.length > 80) {
        reply("Kripya apna valid poora naam dobara batayein.");
        return true;
      }

      showConfirmation("name", value);
      return true;
    }

    if (authStep === "phone") {
      const phone = normalizeDigits(value);

      if (phone.length !== 10) {
        reply("Mobile number 10 digits ka hona chahiye. Dobara batayein.");
        return true;
      }

      showConfirmation("phone", phone);
      return true;
    }

    if (authStep === "email" || authStep === "loginEmail") {
      const email = normalizeEmail(value);

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        reply(
          "Email samajh nahi aaya. Example: rahul at gmail dot com. Dobara boliye ya screen par type kijiye.",
        );
        return true;
      }

      showConfirmation("email", email);
      return true;
    }

    if (authStep === "password" || authStep === "loginPassword") {
      reply(
        "Password voice se nahi lena hai. Screen par khud type kijiye aur form ka button dabaiye.",
      );
      return true;
    }

    return false;
  };

  const processCommand = (spokenText) => {
    const text = spokenText.trim();
    setTranscript(spokenText);

    if (authStep && processAuthentication(text)) {
      return;
    }

    if (
      /login|log in|sign in|register|registration|sign up|लॉगिन|लॉग इन|रजिस्टर|पंजीकरण|खाता बनाओ|खाता खोलो|मुझे अकाउंट बनाना|मुझे लॉगिन/i.test(
        text,
      )
    ) {
      startAuthentication();
      return;
    }

    if (/help|commands|मदद|क्या कर सकते|की कर सकै छी/i.test(text)) {
      reply(
        "Aap doctor, dawa, hospital, ambulance, appointment, login, register, dashboard ya health tips bol sakte hain.",
      );
      return;
    }

    if (/home|homepage|main page|होम|शुरू|मुख्य पेज|घर/i.test(text)) {
      navigateToSection("home", "AAYUSHMAN home page khol raha hoon.");
      return;
    }

    if (/dashboard|my account|डैशबोर्ड|मेरा अकाउंट/i.test(text)) {
      if (!localStorage.getItem("aayushman-token")) {
        startAuthentication();
        return;
      }

      navigateToSection("dashboard", "Dashboard khol raha hoon.");
      return;
    }

    if (
      /doctor|doctors|appointment|डॉक्टर|डाक्टर|चिकित्सक|अपॉइंटमेंट|doctor khoje|doctor chahi/i.test(
        text,
      )
    ) {
      navigateToSection("doctors", "Doctors page khol raha hoon.");
      return;
    }

    if (
      /medicine|medicines|pharmacy|dawa|dawai|दवा|दवाई|औषधि|मेडिसिन/i.test(text)
    ) {
      navigateToSection("medicines", "Medicines page khol raha hoon.");
      return;
    }

    if (
      /ambulance|emergency|108|112|एंबुलेंस|एम्बुलेंस|आपातकाल|गाड़ी बुलाओ/i.test(
        text,
      )
    ) {
      navigateToSection(
        "ambulance",
        "Ambulance page khol raha hoon. Real emergency mein India mein 112 par call karein.",
      );
      return;
    }

    if (
      /health assistant|ai assistant|symptom|pain|fever|headache|cough|बुखार|खांसी|दर्द|सिर दर्द|पेट दर्द|बीमार|तबीयत|matha|bukhar/i.test(
        text,
      )
    ) {
      navigateToSection(
        "ai-assistant",
        "AI Health Assistant khol raha hoon. Ye doctor ke diagnosis ka replacement nahi hai.",
      );
      return;
    }

    if (
      /hospital|clinic|health centre|health center|अस्पताल|स्वास्थ्य केंद्र|क्लिनिक|इलाज कहाँ|इलाज कहां/i.test(
        text,
      )
    ) {
      navigateToSection(
        "find-care",
        "Healthcare facilities page khol raha hoon.",
      );
      return;
    }

    if (
      /consultation|video call|online doctor|परामर्श|वीडियो कॉल/i.test(text)
    ) {
      navigateToSection(
        "consultation",
        "Online consultation page khol raha hoon.",
      );
      return;
    }

    if (
      /health tips|health resources|first aid|स्वास्थ्य जानकारी|सेहत|प्राथमिक उपचार/i.test(
        text,
      )
    ) {
      navigateToSection(
        "health-resources",
        "Health Resources page khol raha hoon.",
      );
      return;
    }

    if (/about|about us|हमारे बारे में|aayushman ke bare mein/i.test(text)) {
      navigateToSection(
        "about",
        "AAYUSHMAN ke baare mein jaankari khol raha hoon.",
      );
      return;
    }

    if (/services|our services|सेवाएं|सर्विस|सुविधाएं/i.test(text)) {
      navigateToSection(
        "services",
        "AAYUSHMAN homepage par services dekh sakte hain.",
      );
      return;
    }

    if (/stop|chup|रुको|बंद करो|आवाज बंद/i.test(text)) {
      window.speechSynthesis?.cancel();
      setMessage("Theek hai. Main bolna band kar raha hoon.");
      return;
    }

    reply(
      "Maaf kijiye, main samajh nahi paya. Doctor, dawa, hospital, ambulance, login ya register bolkar dekhiye.",
    );
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reply(
        "Aapka browser voice recognition support nahi karta. Google Chrome mein try karein.",
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();

    recognition.lang =
      authStep === "email" || authStep === "loginEmail" ? "en-IN" : language;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setMessage("Sun raha hoon... Aap boliye.");
      setTranscript("");
    };

    recognition.onresult = (event) => {
      processCommand(event.results[0][0].transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setMessage("Microphone permission allow kijiye.");
      } else if (event.error === "no-speech") {
        setMessage("Aapki awaaz nahi mili. Dobara try karein.");
      } else if (event.error === "network") {
        setMessage(
          "Network problem hai. Internet check karke dobara try karein.",
        );
      } else {
        setMessage("Voice recognition mein problem hui.");
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setMessage("Microphone start nahi hua. Dobara try karein.");
    }
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);

    const response =
      newLanguage === "en-IN"
        ? "English selected. You can speak in English now."
        : "Hindi selected. Aap Hindi ya Hinglish mein baat kar sakte hain.";

    reply(response, newLanguage);
  };

  // Open assistant and start listening with one click.
  const handleMicClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      startListening();
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      startListening();
    }
  };

  // Close the panel without removing the floating mic.
  const closeAssistant = () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    setIsOpen(false);
  };

  // Allow the panel to be moved by dragging its header.
  const handleDragStart = (event) => {
    if (event.target.closest("button")) return;

    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const panelWidth = panelRef.current?.offsetWidth || 320;
    const panelHeight = panelRef.current?.offsetHeight || 300;

    const left = Math.max(
      8,
      Math.min(
        event.clientX - dragOffset.current.x,
        window.innerWidth - panelWidth - 8,
      ),
    );

    const top = Math.max(
      8,
      Math.min(
        event.clientY - dragOffset.current.y,
        window.innerHeight - panelHeight - 8,
      ),
    );

    setPanelPosition({ left, top });
  };

  const handleDragEnd = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <>
      {/* Compact floating assistant panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed z-[110] flex max-h-[45vh] w-[min(320px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-blue-200/80 bg-white/90 shadow-xl backdrop-blur-xl dark:border-[#356589] dark:bg-[#234E70]/95"
          style={
            panelPosition
              ? {
                  left: panelPosition.left,
                  top: panelPosition.top,
                }
              : {
                  right: "16px",
                  bottom: "92px",
                }
          }
          role="status"
          aria-live="polite"
        >
          {/* Drag handle and panel heading */}
          <div
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            className="flex shrink-0 touch-none cursor-grab items-center justify-between border-b border-blue-100 px-3 py-3 active:cursor-grabbing dark:border-[#356589]"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-lg dark:bg-[#183B56]">
                🩺
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#EAF4FA]">
                  AAYUSHMAN Assistant
                </h3>

                <p className="text-[11px] text-blue-600 dark:text-[#00C2D1]">
                  {isListening
                    ? "Listening..."
                    : authStep
                      ? "Conversational Assistant"
                      : "Voice Assistant"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={closeAssistant}
              aria-label="Close assistant"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 hover:bg-red-100 hover:text-red-600 dark:bg-[#183B56] dark:text-white"
            >
              ×
            </button>
          </div>

          {/* Scrollable assistant content */}
          <div className="min-h-0 overflow-y-auto overscroll-contain p-3">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-blue-100">
              {message}
            </p>

            {transcript && (
              <p className="mt-2 break-words text-xs text-slate-400 dark:text-blue-100/60">
                You said: {transcript}
              </p>
            )}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => changeLanguage("hi-IN")}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold ${
                  language === "hi-IN"
                    ? "bg-blue-600 text-white dark:bg-[#00C2D1] dark:text-[#183B56]"
                    : "bg-slate-100 text-slate-700 dark:bg-[#183B56] dark:text-white"
                }`}
              >
                हिंदी / Hinglish
              </button>

              <button
                type="button"
                onClick={() => changeLanguage("en-IN")}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold ${
                  language === "en-IN"
                    ? "bg-blue-600 text-white dark:bg-[#00C2D1] dark:text-[#183B56]"
                    : "bg-slate-100 text-slate-700 dark:bg-[#183B56] dark:text-white"
                }`}
              >
                English
              </button>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-slate-400 dark:text-blue-100/60">
              Try: "Doctor", "Medicine", "Hospital", "Back", "Repeat", "Cancel
              registration".
            </p>
          </div>
        </div>
      )}

      {/* Floating microphone button stays accessible */}
      <button
        type="button"
        onClick={handleMicClick}
        aria-label={isListening ? "Stop listening" : "Open voice assistant"}
        className={`fixed bottom-5 right-5 z-[111] flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-lg transition-all hover:scale-105 ${
          isListening
            ? "animate-pulse bg-red-500"
            : "bg-blue-600 dark:bg-[#00C2D1] dark:text-[#183B56]"
        }`}
      >
        {isListening ? "🎙️" : "🎤"}
      </button>
    </>
  );
}

export default VoiceNavigationAssistant;
