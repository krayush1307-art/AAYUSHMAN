import { useEffect, useRef, useState } from "react";
import API_BASE_URL from "../config/api.js";
function AIHealthAssistant() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "नमस्ते! मैं AAYUSHMAN Health Assistant हूँ। आप हिंदी, English, Maithili या Hinglish में अपनी समस्या बता सकते हैं।",
    },
  ]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const continuousModeRef = useRef(false);
  const loadingRef = useRef(false);
  const speakingRef = useRef(false);
  const restartTimerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      continuousModeRef.current = false;
      clearTimeout(restartTimerRef.current);
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Detect the language of text for AI voice playback.
  const detectVoiceLanguage = (text) => {
    if (/[\u0900-\u097F]/.test(text)) {
      return "hi-IN";
    }

    return "en-IN";
  };

  // Choose the initial recognition language from browser preferences.
  const getInitialRecognitionLanguage = () => {
    const browserLanguages = [
      ...(navigator.languages || []),
      navigator.language || "",
    ];

    const prefersHindi = browserLanguages.some((language) =>
      language.toLowerCase().startsWith("hi"),
    );

    return prefersHindi ? "hi-IN" : "en-IN";
  };

  const cleanTextForSpeech = (text) => {
    return text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+[.)]\s+/gm, "")
      .replace(/^\s*>\s?/gm, "")
      .replace(/[*_~#]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Detect common emergency-related phrases.
  const isEmergency = (question) => {
    const text = question.toLowerCase();

    const emergencyWords = [
      "chest pain",
      "severe chest pain",
      "heart attack",
      "can't breathe",
      "cannot breathe",
      "difficulty breathing",
      "shortness of breath",
      "severe bleeding",
      "unconscious",
      "not responding",
      "seizure",
      "stroke",
      "face drooping",
      "suicide",
      "खून बह रहा",
      "बहुत खून",
      "बेहोश",
      "होश नहीं",
      "सीने में दर्द",
      "छाती में दर्द",
      "सांस नहीं",
      "साँस नहीं",
      "सांस लेने में दिक्कत",
      "साँस लेने में दिक्कत",
      "दौरा पड़",
      "लकवा",
      "आत्महत्या",
      "छाती दुख",
      "सांस फूल",
    ];

    return emergencyWords.some((word) => text.includes(word));
  };

  // Stop the complete voice conversation.
  const stopContinuousConversation = () => {
    continuousModeRef.current = false;
    setContinuousMode(false);

    clearTimeout(restartTimerRef.current);

    recognitionRef.current?.stop();
    recognitionRef.current = null;

    window.speechSynthesis?.cancel();

    speakingRef.current = false;
    setSpeaking(false);
    setListening(false);

    setVoiceNotice("Voice conversation stopped.");
  };

  // Start a microphone listening session.
  const startRecognitionCycle = () => {
    if (!continuousModeRef.current) return;
    if (loadingRef.current || speakingRef.current) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      stopContinuousConversation();
      setVoiceNotice(
        "Voice recognition is not supported in this browser. Please use Chrome.",
      );
      return;
    }

    clearTimeout(restartTimerRef.current);

    const recognition = new SpeechRecognition();

    // Start with the language preferred by the browser.
    recognition.lang = getInitialRecognitionLanguage();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (!continuousModeRef.current) {
        recognition.stop();
        return;
      }

      setListening(true);
      setVoiceNotice(`Listening... Recognition language: ${recognition.lang}`);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();

      if (transcript && continuousModeRef.current) {
        processMessage(transcript, true);
      }
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (!continuousModeRef.current) return;

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        stopContinuousConversation();
        setVoiceNotice(
          "Microphone permission denied. Please allow microphone access in your browser.",
        );
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setVoiceNotice("Voice recognition interrupted. Trying again...");
      }
    };

    recognition.onend = () => {
      setListening(false);

      if (
        continuousModeRef.current &&
        !loadingRef.current &&
        !speakingRef.current
      ) {
        restartTimerRef.current = setTimeout(() => {
          startRecognitionCycle();
        }, 700);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("Recognition start error:", error);
      setListening(false);

      if (continuousModeRef.current) {
        restartTimerRef.current = setTimeout(() => {
          startRecognitionCycle();
        }, 1200);
      }
    }
  };

  // Start or stop continuous voice conversation.
  const toggleContinuousConversation = () => {
    if (continuousModeRef.current) {
      stopContinuousConversation();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice(
        "Voice recognition is not supported in this browser. Please use Chrome.",
      );
      return;
    }

    if (!("speechSynthesis" in window)) {
      setVoiceNotice("Voice playback is not supported in this browser.");
      return;
    }

    continuousModeRef.current = true;
    setContinuousMode(true);
    setVoiceNotice("Starting voice conversation...");

    startRecognitionCycle();
  };

  // Speak an AI reply in the detected script's language.
  const speakReply = (text, resumeConversation = false) => {
    if (!("speechSynthesis" in window)) {
      setVoiceNotice("Voice playback is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text);

    if (!cleanText) {
      setVoiceNotice("There is no text available to read.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.lang = detectVoiceLanguage(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => {
      speakingRef.current = true;
      setSpeaking(true);
      setListening(false);
      setVoiceNotice("AAYUSHMAN is speaking...");
    };

    utterance.onend = () => {
      speakingRef.current = false;
      setSpeaking(false);

      if (resumeConversation && continuousModeRef.current) {
        setVoiceNotice("Your turn! Listening again...");

        restartTimerRef.current = setTimeout(() => {
          startRecognitionCycle();
        }, 500);
      } else {
        setVoiceNotice("");
      }
    };

    utterance.onerror = (event) => {
      speakingRef.current = false;
      setSpeaking(false);

      if (event.error !== "canceled" && event.error !== "interrupted") {
        setVoiceNotice("Voice playback could not be completed.");

        if (resumeConversation && continuousModeRef.current) {
          restartTimerRef.current = setTimeout(() => {
            startRecognitionCycle();
          }, 700);
        }
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Send typed or recognized speech to the existing backend.
  const processMessage = async (text, fromVoice = false) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage || loadingRef.current) return;

    recognitionRef.current?.stop();

    loadingRef.current = true;
    setLoading(true);
    setListening(false);

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: trimmedMessage },
    ]);

    if (fromVoice) {
      setVoiceNotice("You said: " + trimmedMessage);
    }

    // Emergency messages get immediate safety guidance.
    if (isEmergency(trimmedMessage)) {
      const emergencyReply =
        "आपके बताए लक्षण गंभीर हो सकते हैं। तुरंत चिकित्सा सहायता लें। भारत में आपातकालीन सहायता के लिए 112 पर कॉल करें। AI के जवाब का इंतजार न करें।";

      setMessages((previous) => [
        ...previous,
        { sender: "assistant", text: emergencyReply },
      ]);

      loadingRef.current = false;
      setLoading(false);

      if (fromVoice && continuousModeRef.current) {
        speakReply(emergencyReply, true);
      }

      return;
    }

    try {
      const token = localStorage.getItem("aayushman-token");

      if (!token) {
        throw new Error("Please log in to use the AI Health Assistant.");
      }

      const API_URL = (
        import.meta.env.VITE_API_URL || "http://localhost:5000"
      ).replace(/\/+$/, "");

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "AI service is temporarily unavailable.",
        );
      }

      const reply = result.reply || "Sorry, I could not generate a response.";

      setMessages((previous) => [
        ...previous,
        { sender: "assistant", text: reply },
      ]);

      loadingRef.current = false;
      setLoading(false);

      if (fromVoice && continuousModeRef.current) {
        speakReply(reply, true);
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);

      const errorReply =
        error.message || "Something went wrong. Please try again.";

      setMessages((previous) => [
        ...previous,
        { sender: "assistant", text: errorReply },
      ]);

      loadingRef.current = false;
      setLoading(false);

      if (fromVoice && continuousModeRef.current) {
        speakReply(errorReply, true);
      }
    }
  };

  // Normal text-message submission.
  const handleSend = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loadingRef.current) return;

    setMessage("");
    await processMessage(trimmedMessage, false);
  };

  // Stop current playback. Continuous mode will listen again.
  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();

    speakingRef.current = false;
    setSpeaking(false);

    if (continuousModeRef.current) {
      setVoiceNotice("Speech stopped. Listening again...");

      restartTimerRef.current = setTimeout(() => {
        startRecognitionCycle();
      }, 500);
    } else {
      setVoiceNotice("Voice playback stopped.");
    }
  };

  // Clear messages and stop voice features.
  const clearChat = () => {
    stopContinuousConversation();

    loadingRef.current = false;
    setLoading(false);
    setMessage("");
    setVoiceNotice("");

    setMessages([
      {
        sender: "assistant",
        text: "नमस्ते! मैं AAYUSHMAN Health Assistant हूँ। आप हिंदी, English, Maithili या Hinglish में अपनी समस्या बता सकते हैं।",
      },
    ]);
  };

  return (
    <section
      id="ai-assistant"
      className="bg-gradient-to-br from-[#F5F9FE] via-[#EAF2FF] to-[#D5E4FF] px-4 py-16 transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#171C1B] dark:via-[#202A2D] dark:to-[#24383B] sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section heading */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-xs font-bold tracking-wider text-cyan-800 dark:bg-[#39B982]/10 dark:text-[#55CD96]">
            <span className="h-2 w-2 rounded-full bg-current" />
            AI POWERED HEALTH SUPPORT
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-800 dark:text-[#F5F7F5] sm:text-4xl">
            AAYUSHMAN AI Health Assistant
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-[#A0AEA5] sm:text-base">
            Your health companion, closer to you. Speak or type naturally in
            your preferred language.
          </p>
        </div>

        {/* Main chat container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-[#3C4942] dark:bg-[#242C29] dark:shadow-black/10">
          {/* Chat header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-blue-50/80 p-4 dark:border-[#3C4942] dark:bg-[#1E2522] sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-2xl dark:bg-[#39B982]/15">
                🤖
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-[#F5F7F5]">
                  AAYUSHMAN Assistant
                </h3>

                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-[#55CD96]">
                  <span className="h-2 w-2 rounded-full bg-green-500 dark:bg-[#39B982]" />
                  {continuousMode
                    ? speaking
                      ? "AAYUSHMAN is speaking"
                      : loading
                        ? "Preparing your answer"
                        : listening
                          ? "Listening to you"
                          : "Voice conversation active"
                    : "AI Assistant Connected"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {speaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25"
                >
                  ⏹ Stop Speaking
                </button>
              )}

              <button
                type="button"
                onClick={clearChat}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-[#3C4942] dark:bg-[#242C29] dark:text-[#D0DAD3] dark:hover:bg-[#303C36]"
              >
                ↺ Clear Chat
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div
            aria-live="polite"
            className="flex h-[420px] flex-col gap-5 overflow-y-auto bg-slate-50/70 p-4 dark:bg-[#171C1B] sm:p-6"
          >
            {messages.map((item, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  item.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {item.sender === "assistant" && (
                  <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-sm dark:bg-[#39B982]/15">
                    🤖
                  </div>
                )}

                <div className="max-w-[88%] sm:max-w-[80%]">
                  <div
                    className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-sm ${
                      item.sender === "user"
                        ? "rounded-br-sm bg-blue-600 text-white dark:bg-[#39B982] dark:text-[#10251B]"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-700 dark:border-[#3C4942] dark:bg-[#242C29] dark:text-[#D0DAD3]"
                    }`}
                  >
                    {item.text}
                  </div>

                  {item.sender === "assistant" && (
                    <div className="mt-2 flex flex-wrap gap-4 px-1">
                      <button
                        type="button"
                        onClick={() => speakReply(item.text, false)}
                        className="text-xs font-semibold text-blue-600 transition hover:underline dark:text-[#55CD96]"
                        title="Listen to this response"
                      >
                        🔊 Listen
                      </button>

                      {speaking && (
                        <button
                          type="button"
                          onClick={stopSpeaking}
                          className="text-xs font-semibold text-red-600 hover:underline dark:text-red-300"
                        >
                          ⏹ Stop
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {item.sender === "user" && (
                  <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm dark:bg-[#303C36]">
                    👤
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-sm dark:bg-[#39B982]/15">
                  🤖
                </div>

                <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-600 dark:border-[#3C4942] dark:bg-[#242C29] dark:text-[#D0DAD3]">
                  <span>AI is thinking</span>
                  <span className="ml-2 inline-flex animate-pulse gap-1">
                    ● ● ●
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form
            onSubmit={handleSend}
            className="border-t border-slate-200 bg-white p-4 dark:border-[#3C4942] dark:bg-[#242C29] sm:p-5"
          >
            <div className="rounded-2xl border border-slate-300 bg-slate-50 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:border-[#3C4942] dark:bg-[#1E2522] dark:focus-within:border-[#39B982] dark:focus-within:ring-[#39B982]/10">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="अपनी समस्या लिखें... / Describe your symptoms..."
                rows={3}
                maxLength={3000}
                disabled={loading}
                className="w-full resize-none bg-transparent px-4 py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:text-[#F5F7F5] dark:placeholder:text-[#77877D]"
              />

              <div className="flex items-center justify-between px-4 pb-3">
                <span className="text-xs text-slate-400 dark:text-[#77877D]">
                  {message.length}/3000
                </span>

                <span className="text-xs text-slate-400 dark:text-[#77877D]">
                  Enter your health question
                </span>
              </div>
            </div>

            {voiceNotice && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-[#39B982]/10 dark:text-[#55CD96]">
                <span>ℹ️</span>
                <p>{voiceNotice}</p>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-[#A0AEA5]">
                  Available Languages
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {["हिंदी", "English", "मैथिली", "Hinglish"].map(
                    (language) => (
                      <span
                        key={language}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-[#303C36] dark:text-[#D0DAD3]"
                      >
                        {language}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={toggleContinuousConversation}
                  className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                    continuousMode
                      ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25"
                      : "bg-[#39B982] text-[#10251B] shadow-sm hover:bg-[#55CD96]"
                  }`}
                >
                  {continuousMode
                    ? "⏹ Stop Conversation"
                    : "🎤 Start Conversation"}
                </button>

                <button
                  type="submit"
                  disabled={!message.trim() || loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                >
                  {loading ? "Please wait..." : "Send Message"}
                  {!loading && <span>➤</span>}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Medical safety disclaimer */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
          <span className="text-xl">⚕️</span>

          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Medical Safety Notice
            </p>

            <p className="mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
              This AI assistant provides general health information only. It
              cannot confirm diagnoses or prescribe medicines. Always consult a
              qualified healthcare professional. For emergencies in India, call
              112. Voice recognition depends on browser support. Image analysis
              is not available yet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIHealthAssistant;
