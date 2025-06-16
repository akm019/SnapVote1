import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { setActivePoll, updateResults, resetPoll, setStudentList } from "../redux/pollSlice";
import { useEffect, useState } from "react";
import { connectSocket, getSocket } from "../socket/socket";
import PollResults from "./PollResults";
import StudentsList from "./StudentList";
import ChatBox from "./ChatBox";
import { setPollEnded } from "../redux/pollSlice";

export default function TeacherPage() {
  const dispatch = useDispatch();
  const { activePoll, results, studentList, pollHasEnded } = useSelector(state => state.poll);
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState(["", ""]);
  const [dur, setDur] = useState(60);
  const [detailedVotes, setDetailedVotes] = useState([]);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [history, setHistory] = useState([]);
  const socket = getSocket() || connectSocket();
  const [showHistory, setShowHistory] = useState(false);
  const [correctIndex, setCorrectIndex] = useState(null);

  useEffect(() => {
    socket.emit("teacher:register");
  }, [socket]);

  useEffect(() => {
    socket.on("students:update", list => dispatch(setStudentList(list)));
    socket.on("poll:results", results => dispatch(updateResults(results)));
    socket.on("poll:end", () => dispatch(setPollEnded()));

    return () => {
      socket.off("students:update");
      socket.off("poll:results");
      socket.off("poll:end");
    }
  }, [dispatch, socket]);

  useEffect(() => {
    const pollHistoryHandler = (data) => setHistory(data);
    socket.on("poll:history", pollHistoryHandler);
    return () => socket.off("poll:history", pollHistoryHandler);
  }, [socket]);

  useEffect(() => {
    socket.on("poll:details", setDetailedVotes);
    return () => socket.off("poll:details", setDetailedVotes);
  }, [socket]);

  // THIS IS THE FIX - Move the socket.emit and dispatch calls into a function
  const sendPoll = () => {
    if (!q || !opts[0] || !opts[1] || isCreatingPoll) return;
    
    setIsCreatingPoll(true);
    
    socket.emit("teacher:poll", {
      question: q,
      options: opts.filter(Boolean),
      duration: dur * 1000,
      correctIndex
    });
    
    dispatch(setActivePoll({
      question: q,
      options: opts.filter(Boolean),
      endTime: Date.now() + dur * 1000,
      correctIndex
    }));
    
    setQ("");
    setOpts(["", ""]);
    setCorrectIndex(null);
    setIsCreatingPoll(false);
    setShowCreateForm(false);
  };

  const addOption = () => {
    if (opts.length < 5) {
      setOpts([...opts, ""]);
    }
  };

  const removeOption = () => {
    if (opts.length > 2) {
      setOpts(opts.slice(0, -1));
    }
  };

  const updateOption = (index, value) => {
    const newOpts = [...opts];
    newOpts[index] = value;
    setOpts(newOpts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-300/30 to-purple-300/30 rotate-45"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center py-8">
        <div className="max-w-6xl w-full bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 p-8 mx-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Teacher Dashboard
                </h2>
                <p className="text-gray-600">Manage your interactive poll sessions</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                className="px-6 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-600 font-medium transition-all duration-300 hover:scale-105"
                onClick={() => setShowHistory(true)}
              >
                View History
              </button>
              <button 
                className="px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-600 font-medium transition-all duration-300 hover:scale-105"
                onClick={() => dispatch(setUser({ role: null, name: "" }))}
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Poll Creation Section */}
            <div className="lg:col-span-2 space-y-6">
              {!activePoll && (
                <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-200/70 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-blue-700">Create New Poll</h3>
                    <button
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all duration-300"
                    >
                      <svg className={`w-6 h-6 text-blue-600 transition-transform duration-300 ${showCreateForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>

                  {showCreateForm ? (
                    <div className="space-y-6">
                      {/* Question Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Poll Question</label>
                        <input
                          value={q}
                          onChange={e => setQ(e.target.value)}
                          placeholder="What would you like to ask your students?"
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        />
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">Answer Options</label>
                          <div className="flex gap-2">
                            {opts.length < 5 && (
                              <button
                                onClick={addOption}
                                className="px-3 py-1 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg text-green-700 text-sm font-medium transition-all duration-300"
                              >
                                + Add
                              </button>
                            )}
                            {opts.length > 2 && (
                              <button
                                onClick={removeOption}
                                className="px-3 py-1 bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg text-red-700 text-sm font-medium transition-all duration-300"
                              >
                                - Remove
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid gap-4 max-h-60 overflow-y-auto">
  {opts.map((opt, i) => (
    <div
      key={i}
      className="relative flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition"
    >
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
        {String.fromCharCode(65 + i)}
      </span>

      <input
        value={opt}
        onChange={e => updateOption(i, e.target.value)}
        placeholder={`Option ${i + 1}`}
        className="pl-10 w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
      />

      <button
        type="button"
        onClick={() => setCorrectIndex(i)}
        aria-label="Set as correct"
        className={`text-xs px-3 py-1 rounded-full font-medium border transition-all duration-200
          ${correctIndex === i
            ? 'bg-green-100 border-green-400 text-green-700'
            : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-green-200 hover:text-green-700'}`}
      >
        {correctIndex === i ? '✔ Correct' : 'Mark Correct'}
      </button>
    </div>
  ))}
</div>

                      </div>

                      {/* Duration */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min={10}
                            max={300}
                            value={dur}
                            onChange={e => setDur(Number(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="bg-blue-100 px-3 py-2 rounded-lg min-w-16 text-center border border-blue-200">
                            <span className="font-bold text-blue-700">{dur}s</span>
                          </div>
                        </div>
                      </div>

                      {/* Create Poll Button */}
                      <button
                        onClick={sendPoll}
                        disabled={!q || !opts[0] || !opts[1] || isCreatingPoll}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                          q && opts[0] && opts[1] && !isCreatingPoll
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {isCreatingPoll ? (
                          <div className="flex items-center justify-center space-x-3">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Creating Poll...</span>
                          </div>
                        ) : (
                          "🚀 Launch Poll"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-gray-600">Click the + button to create a new poll</p>
                    </div>
                  )}
                </div>
              )}

              {/* Active Poll Results */}
              {activePoll && (
                <div className="space-y-6">
                  <div className="bg-green-50/70 rounded-2xl p-6 border border-green-200/70 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-green-700">🎯 Active Poll</h3>
                      <div className="flex items-center space-x-2 bg-green-100 rounded-full px-3 py-1 border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-700 text-sm font-medium">Live</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">{activePoll.question}</h4>
                      <div className="flex flex-wrap gap-2">
                        {activePoll.options.map((option, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-100 border border-blue-200 rounded-full text-blue-700 text-sm font-medium"
                          >
                            {String.fromCharCode(65 + i)}: {option}
                          </span>
                        ))}
                      </div>
                    </div>

                    <PollResults end={pollHasEnded} />
                  </div>

                  {/* Detailed Votes */}
                  {detailedVotes.length > 0 && (
                    <div className="bg-purple-50/70 rounded-2xl p-6 border border-purple-200/70 backdrop-blur-sm">
                      <h3 className="font-bold text-lg mb-4 text-purple-700">📊 Individual Responses</h3>
                      <div className="grid gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                        {detailedVotes.map((vote, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-purple-200/50 hover:border-purple-300 transition-all duration-300"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {vote.name[0].toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-800">{vote.name}</span>
                            </div>
                            <div className="px-3 py-1 bg-purple-100 border border-purple-200 rounded-full text-purple-700 text-sm font-medium">
                              {vote.option}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Students List Sidebar */}
            <div className="space-y-6">
              <div className="bg-indigo-50/70 rounded-2xl p-6 border border-indigo-200/70 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-indigo-700">👥 Connected Students</h3>
                  <div className="bg-indigo-100 rounded-full px-3 py-1 border border-indigo-200">
                    <span className="text-indigo-700 text-sm font-medium">
                      {studentList?.length || 0}
                    </span>
                  </div>
                </div>
                <StudentsList />
              </div>

              {/* Quick Stats */}
              <div className="bg-orange-50/70 rounded-2xl p-6 border border-orange-200/70 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-orange-700 mb-4">📈 Session Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Students:</span>
                    <span className="font-bold text-gray-800">{studentList?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Poll Status:</span>
                    <span className={`font-bold ${activePoll ? 'text-green-600' : 'text-gray-500'}`}>
                      {activePoll ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Responses:</span>
                    <span className="font-bold text-gray-800">{detailedVotes.length}</span>
                  </div>
                </div>
              </div>

              {/* Poll Tips */}
              <div className="bg-teal-50/70 rounded-2xl p-6 border border-teal-200/70 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-teal-700 mb-4">💡 Poll Tips</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Keep questions clear and concise for better engagement</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Limit to 2-4 options for quick decision making</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>60-120 seconds works best for most polls</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Watch live results to gauge participation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ChatBox />
      
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-6 p-8 animate-fadein">
            <button
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-200 text-gray-500"
              onClick={() => setShowHistory(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold mb-5 text-blue-700">📚 Poll History</h2>
            {history.length === 0 ? (
              <div className="text-gray-400 text-center">No history yet.</div>
            ) : (
              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item, idx) => (
                  <div key={item.id || idx} className="border-b pb-4">
                    <div className="text-lg font-semibold text-gray-700">{item.question}</div>
                    <div className="flex flex-wrap gap-2 my-2">
                      {item.options.map((opt, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 border border-blue-200 rounded-xl text-blue-700 text-sm">
                          {String.fromCharCode(65 + i)}: {opt}
                          <b className="ml-1 text-gray-700">{item.results[i] ?? 0}</b>
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 mb-2">{new Date(item.time).toLocaleString()}</div>
                    {item.voteLedger && item.voteLedger.length > 0 && (
                      <div>
                        <span className="block font-semibold text-purple-600 text-sm mb-1">Individual responses:</span>
                        <ul className="grid gap-1 text-sm">
                          {item.voteLedger.map((vote, i) => (
                            <li key={i} className="flex items-center space-x-2">
                              <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{vote.name}</span>
                              <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-600 rounded">{vote.option}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}