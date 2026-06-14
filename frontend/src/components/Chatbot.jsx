import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAllCourses } from "../store/courseSlice";
import { BsChatDotsFill } from "react-icons/bs";
import { IoSend, IoClose } from "react-icons/io5";
import { GoArrowUpRight } from "react-icons/go";
import { API_BASE_URL } from "../config";

const Chatbot = () => {
  const dispatch = useDispatch();
  const { list: courses } = useSelector((state) => state.courses);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your ChaiCode assistant. Ask me about any course (like 'Web Development', 'React', 'Java', or 'DSA') and I will send you its direct link!",
    },
  ]);

  const messagesEndRef = useRef(null);

  // Auto-fetch courses if not already loaded in Redux store
  useEffect(() => {
    if (isOpen && (!courses || courses.length === 0)) {
      dispatch(fetchAllCourses());
    }
  }, [isOpen, courses, dispatch]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const searchCourses = (query) => {
    if (!query || !courses || courses.length === 0) return [];
    const cleanQuery = query.toLowerCase().trim();

    // 1. Check for exact title match (substring)
    let matches = courses.filter((c) =>
      c.title.toLowerCase().includes(cleanQuery)
    );
    if (matches.length > 0) return matches;

    // 2. Check for word-level matches (split by space)
    // Filter out common filler/stop words
    const stopWords = [
      "show",
      "me",
      "tell",
      "about",
      "find",
      "course",
      "courses",
      "link",
      "please",
      "need",
      "want",
      "does",
      "have",
      "what",
      "here",
      "the",
      "a",
      "for",
      "with",
      "get",
      "hai",
      "ko",
      "do",
      "ka",
      "ki",
      "se",
    ];
    const tokens = cleanQuery
      .split(/\s+/)
      .filter((word) => word.length > 1 && !stopWords.includes(word));

    if (tokens.length > 0) {
      matches = courses.filter((c) => {
        return tokens.some(
          (token) =>
            c.title.toLowerCase().includes(token) ||
            (c.description && c.description.toLowerCase().includes(token))
        );
      });
    }

    return matches;
  };

  const runLocalFallback = (messageText) => {
    const cleanText = messageText.toLowerCase().trim();

    // Greetings check
    const greetings = ["hi", "hello", "hey", "hola", "yo", "namaste", "help"];
    const isGreeting = greetings.some((g) => cleanText === g || cleanText.startsWith(g + " "));

    if (isGreeting) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: "Hello there! How can I help you today? Ask me about any course, or choose from our available programs:",
          pills: courses.map((c) => c.title),
        },
      ]);
      return;
    }

    // Search for courses
    const matched = searchCourses(messageText);

    if (matched.length > 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: `I found the following course(s) matching your request:`,
          courses: matched,
        },
      ]);
    } else {
      // No match found
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: "I couldn't find a direct match for that. Here are the courses currently available on our platform. Click on any course to get its link:",
          pills: courses.length > 0 ? courses.map((c) => c.title) : ["Web Development Cohort", "Interview Preparation"],
        },
      ]);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || inputValue;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
    };
    
    // Format history for payload
    const currentHistory = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          history: currentHistory,
          courses: courses,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setIsTyping(false);

      let text = data.text || "";
      let matchedCourses = [];

      // Parse RECOMMENDED_IDS from response text
      // Pattern: [RECOMMENDED_IDS: id1, id2]
      const recommendedMatch = text.match(/\[RECOMMENDED_IDS:\s*([^\]]+)\]/);
      if (recommendedMatch) {
        // Strip the tag from the text
        text = text.replace(/\[RECOMMENDED_IDS:\s*([^\]]+)\]/, "").trim();
        
        // Parse IDs
        const ids = recommendedMatch[1]
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
          
        // Map to actual course objects
        matchedCourses = courses.filter((c) => ids.includes(c.id));
      }

      // Add bot message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: text || "Here is what I found:",
          courses: matchedCourses.length > 0 ? matchedCourses : undefined,
        },
      ]);

    } catch (error) {
      console.warn("⚠️ [Chatbot AI Error] Failed to call AI endpoint. Falling back to rule-based engine:", error.message);
      setIsTyping(false);
      runLocalFallback(messageText);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const defaultThumb = "https://chaicode.com/assets/piyush-hitesh-dark-CQ8g4eJE.webp";

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center relative group cursor-pointer"
        >
          <BsChatDotsFill size={24} className="animate-pulse" />
          <span className="absolute -top-12 right-0 bg-neutral-900 border border-neutral-800 text-xs text-orange-200 px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
            Chat with Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] h-[480px] bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-neutral-800 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm">
                  CC
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-neutral-950 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-white text-sm font-semibold tracking-wide">ChaiCode Bot</p>
                <p className="text-green-500 text-xxs font-light">Online & Ready</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white hover:bg-neutral-900 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Text Bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-tr-none shadow-md"
                      : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Course Card recommendations */}
                {msg.courses && msg.courses.length > 0 && (
                  <div className="w-full mt-2 space-y-2">
                    {msg.courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl overflow-hidden shadow-lg hover:border-orange-500/30 transition-colors duration-200 max-w-[90%]"
                      >
                        <img
                          src={course.thumbnailUrl || defaultThumb}
                          alt={course.title}
                          className="w-full h-32 object-cover border-b border-neutral-800"
                        />
                        <div className="p-3 space-y-2">
                          <p className="text-white font-semibold text-sm line-clamp-1 uppercase">
                            {course.title}
                          </p>
                          <p className="text-neutral-400 text-xs line-clamp-2">
                            {course.description || "Learn in-demand skills with live guidance."}
                          </p>
                          <Link
                            to={`/cohort/${course.id}`}
                            onClick={() => setIsOpen(false)} // Close chat on navigation
                            className="w-full py-1.5 px-3 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>Go to Course</span>
                            <GoArrowUpRight size={14} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Reply Pills */}
                {msg.pills && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.pills.map((pill, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(pill)}
                        className="bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 hover:bg-neutral-900 text-neutral-300 hover:text-orange-300 text-xxs font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-2xl rounded-tl-none self-start">
                <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/60 flex gap-2 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about a course..."
              className="flex-1 bg-neutral-900 border border-neutral-800/80 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                inputValue.trim()
                  ? "bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-md active:scale-95"
                  : "bg-neutral-900 text-neutral-600 pointer-events-none"
              }`}
            >
              <IoSend size={14} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default Chatbot;
