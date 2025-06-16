import { useSelector, useDispatch } from "react-redux";
import { setUser, resetUser } from "../redux/userSlice";
import { setAnswered, setActivePoll, updateResults, resetPoll } from "../redux/pollSlice";
import { useEffect, useState } from "react";
import { connectSocket, getSocket } from "../socket/socket";
import PollResults from "./PollResults";
import ChatBox from "./ChatBox";

export default function StudentPage() {
  const dispatch = useDispatch();
  const { name } = useSelector(state => state.user);
  const { activePoll, answered, results } = useSelector(state => state.poll);
  const [input, setInput] = useState(name || "");
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [correctIndex, setCorrectIndex] = useState(null);
  const socket = getSocket() || connectSocket();

  // Registration (per tab persistence)
  useEffect(() => {
    if (name) {
      socket.emit("student:register", { name });
    }
  }, [name, socket]);

  // Real-time backend event handlers
  // In StudentPage component, update the useEffect for socket events:

useEffect(() => {
  const handlePollNew = (poll) => {
    dispatch(setActivePoll(poll));
    dispatch(setAnswered(false));
    setTimeLeft(Math.max(1, Math.round((poll.endTime - Date.now()) / 1000)));
    setSelectedOption(null);
    // Don't set correctIndex here - wait for poll end
  };
  
  socket.on("poll:new", handlePollNew);

  socket.on("poll:results", incoming => {
    dispatch(updateResults(incoming));
    // Set correctIndex when results come in
    if (incoming && typeof incoming.correctIndex !== "undefined") {
      setCorrectIndex(incoming.correctIndex);
    }
  });
  
  socket.on("poll:end", (data) => {
    dispatch(setAnswered(true)); 
    setTimeLeft(0);
    // Set correctIndex when poll ends
    if (data && typeof data.correctIndex !== "undefined") {
      setCorrectIndex(data.correctIndex);
    }
  });
  
  socket.on("student:kicked", () => {
    dispatch(resetUser());
    dispatch(resetPoll());
    alert("You have been removed from the poll by the teacher.");
  });
  
  return () => {
    socket.off("poll:new", handlePollNew);
    socket.off("poll:results");
    socket.off("poll:end");
    socket.off("student:kicked");
  };
}, [dispatch, socket]);

  // Timer
  useEffect(() => {
    if (!activePoll || answered) return;
    const interval = setInterval(() => {
      const secs = Math.max(0, Math.round((activePoll.endTime - Date.now()) / 1000));
      setTimeLeft(secs);
      if (secs <= 0) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [activePoll, answered]);

 function submitVote(optIdx) {
  setIsLoading(true);
  setSelectedOption(optIdx);
  setTimeout(() => {
    socket.emit("student:answer", { 
      pollId: activePoll.id,      // <--- ADD THIS LINE
      answerIndex: optIdx 
    });
    dispatch(setAnswered(true));
    setIsLoading(false);
  }, 800);
}

  // Helper for feedback
  function FeedbackBanner() {
    if (selectedOption === null || typeof correctIndex !== "number") return null;
    if (selectedOption === correctIndex) {
      return (
        <div className="flex items-center justify-center mt-2 mb-4">
          <div className="px-4 py-2 bg-green-700/30 border border-green-400 rounded-2xl text-green-300 font-bold text-lg flex items-center space-x-2 shadow">
            <span role="img" aria-label="check" className="text-2xl">✅</span>
            <span>Correct!</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center mt-2 mb-4">
          <div className="px-4 py-2 bg-red-700/30 border border-red-400 rounded-2xl text-red-300 font-bold text-lg flex items-center space-x-2 shadow">
            <span role="img" aria-label="cross" className="text-2xl">❌</span>
            <span>Incorrect</span>
          </div>
        </div>
      );
    }
  }

  if (!name) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
        <div className="relative z-10 bg-gradient-to-br from-slate-800/80 via-purple-900/40 to-slate-800/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-purple-500/20 w-[420px] transform hover:scale-105 transition-all duration-500">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg animate-pulse">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.32 5 13.4 5H10.6C9.68 5 8.76 5.06 7.83 5.17L10.5 2.5L9 1L3 7V9H5C5.33 10.15 6.67 11 8.2 11C8.65 11 9.1 10.9 9.5 10.7L12 13.2L14.5 10.7C14.9 10.9 15.35 11 15.8 11C17.33 11 18.67 10.15 19 9H21Z"/>
              </svg>
            </div>
            <h2 className="mb-2 font-bold text-3xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome Student
            </h2>
            <p className="text-slate-300 text-sm">Enter your name to join the interactive poll</p>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              <input
                className="w-full bg-slate-900/50 border border-purple-500/30 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your name..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && input.trim() && dispatch(setUser({ role: "student", name: input.trim() }))}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
            
            <button
              disabled={!input.trim()}
              onClick={() => dispatch(setUser({ role: "student", name: input.trim() }))}
              className={`w-full font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform relative overflow-hidden group ${
                input.trim() 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-purple-500/25 hover:scale-105" 
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span className="relative z-10">Join Poll Session</span>
              {input.trim() && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center justify-center py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-slate-800/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{name[0].toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome, {name}!
              </h2>
              <p className="text-slate-400 text-sm">Interactive Poll Session</p>
            </div>
          </div>
          
          <button
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-xl text-red-300 font-medium transition-all duration-300 hover:scale-105"
            onClick={() => { dispatch(resetUser()); dispatch(resetPoll()); }}
          >
            Logout
          </button>
        </div>

        {/* Active Poll */}
        {activePoll && !answered && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-bold text-2xl mb-4 text-white leading-tight">
                {activePoll.question}
              </h3>
              
              {/* Timer */}
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div className="flex items-center space-x-2 bg-slate-700/50 rounded-full px-4 py-2 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-sm">Time remaining:</span>
                  <span className="font-bold text-xl bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="grid gap-4">
              {activePoll.options.map((opt, i) => (
                <button
                  key={i}
                  className={`group relative p-6 rounded-2xl border transition-all duration-500 transform hover:scale-105 ${
                    selectedOption === i
                      ? "bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-purple-400 shadow-lg shadow-purple-500/25"
                      : "bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 hover:border-purple-500/50"
                  }`}
                  onClick={() => !isLoading && submitVote(i)}
                  disabled={answered || isLoading}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg text-left flex-1">{opt}</span>
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      selectedOption === i 
                        ? "border-purple-400 bg-purple-500" 
                        : "border-slate-500 group-hover:border-purple-400"
                    }`}>
                      {selectedOption === i && (
                        <div className="w-full h-full rounded-full bg-white/20 animate-ping"></div>
                      )}
                    </div>
                  </div>
                  
                  {isLoading && selectedOption === i && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Poll Results & Feedback */}
     {/* Poll Results & Feedback */}
{/* Poll Results & Feedback - show live during poll, final after poll ends */}
{answered && activePoll && results && results.counts && (
  <div className="mt-8 p-6 bg-slate-700/30 rounded-2xl border border-slate-600/50 backdrop-blur-sm">
    <FeedbackBanner />
    <h4 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
      {timeLeft > 0 ? "Live Poll Results" : "Poll Results"}
    </h4>
    <PollResults
      end={timeLeft === 0 || typeof correctIndex === "number"} // END = true only when poll is over
      correctIndex={correctIndex}
      selectedOption={selectedOption}
    />

    {/* Show correct answer if student got it wrong and poll ended */}
    {(timeLeft === 0 || correctIndex !== null) && correctIndex !== null && selectedOption !== correctIndex && (
      <div className="mt-4 text-center">
        <p className="text-slate-400">
          The correct answer was: 
          <span className="font-bold text-green-400 ml-2">
            {activePoll.options[correctIndex]}
          </span>
        </p>
      </div>
    )}
  </div>
)}

        {/* Waiting State */}
        {!activePoll && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-300 mb-2">Waiting for Poll</h3>
            <p className="text-slate-400">Your teacher will start the poll session shortly...</p>
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <ChatBox />
    </div>
  );
}