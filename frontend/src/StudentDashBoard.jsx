import { useState, useEffect } from 'react';
import { useSocket } from './socket';

export default function StudentDashboard() {
  const socket = useSocket();
  const [name, setName] = useState(() => sessionStorage.getItem('studentName') || "");
  const [input, setInput] = useState('');
  const [poll, setPoll] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);

  // Register name when set
  useEffect(() => {
    if (name) socket.emit('student:register', { name });
  }, [name]);
  
  useEffect(() => {
    const onPollNew = (pollMsg) => {
      setPoll(pollMsg);
      setAnswer(null);
      setResults(null);
      setTimeLeft(Math.max(1, Math.round((pollMsg.endTime - Date.now()) / 1000)));
    };
    socket.on('poll:new', onPollNew);
    socket.on('poll:results', setResults);
    socket.on('poll:end', () => { setPoll(null); setTimeLeft(60); setResults(null); });
    return () => {
      socket.off('poll:new', onPollNew);
      socket.off('poll:results', setResults);
      socket.off('poll:end');
    }
  }, [socket]);

  // Poll timer
  useEffect(() => {
    if (!poll || answer !== null) return;
    const interval = setInterval(() => {
      const seconds = Math.max(0, Math.round((poll.endTime - Date.now()) / 1000));
      setTimeLeft(seconds);
      if (seconds <= 0) {
        clearInterval(interval);
        setAnswer(-1);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [poll, answer]);

  function submitAnswer(idx) {
    setAnswer(idx);
    socket.emit('student:answer', { answerIndex: idx });
  }

  if (!name) return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-80 flex flex-col items-center space-y-3 mt-6">
      <label className="text-blue-700 font-bold text-lg mb-2">Enter Your Name</label>
      <input type="text" className="border rounded px-3 py-2 w-full"
        value={input} onChange={e => setInput(e.target.value)} />
      <button className="bg-blue-600 text-white font-semibold rounded px-8 py-2 mt-3"
        disabled={!input.trim()}
        onClick={() => {
          setName(input.trim());
          sessionStorage.setItem('studentName', input.trim());
        }}
      >Join</button>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-96 flex flex-col items-center mt-6 space-y-4">
      <div className="text-xl font-bold text-blue-600">Hi, {name}!</div>
      {!poll && <div>Waiting for the teacher to start a poll...</div>}

      {poll && answer === null &&
        <div className="w-full">
          <div className="font-semibold text-lg text-gray-700 mb-2">{poll.question}</div>
          <div className="flex flex-col gap-2 mb-3">
            {poll.options.map((opt, i) =>
              <button
                className="w-full px-4 py-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white transition"
                key={i} onClick={() => submitAnswer(i)}>{opt}
              </button>
            )}
          </div>
          <div className="text-gray-500 text-sm">Time left: <b>{timeLeft}</b> seconds</div>
        </div>
      }
      {(answer !== null || timeLeft <= 0) && results &&
        <div className="w-full">
          <div className="font-bold text-lg text-blue-800">Live Poll Results</div>
          <div className="space-y-1">
            {poll.options.map((opt, i) =>
              <div key={i} className="flex justify-between">
                <span>{opt}</span><span>{results.counts ? results.counts[i] || 0 : 0}</span>
              </div>
            )}
          </div>
        </div>
      }
    </div>
  );
}