import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173", // Vite frontend
    methods: ["GET", "POST"]
  }
});

// ---- Server State ----
let students = new Map();      // socket.id => { name }
let teachers = new Map();      // socket.id => true
let activePolls = [];          // Array of active polls
let pollHistory = [];          // List of past polls/results
let pollIdCounter = 1;         // For unique poll IDs

// ---- Socket Connections ----
io.on("connection", (socket) => {
  // --- Identify role, set up listeners ---
  socket.on("student:register", ({ name }) => {
    students.set(socket.id, { name });
    updateStudentsForTeacher();
    // Send all currently active polls to just-joined student
    for(const poll of activePolls) {
      socket.emit('poll:new', activePollForEmit(poll));
    }
  });

  socket.on("teacher:register", () => {
    teachers.set(socket.id, true);
    updateStudentsForTeacher();
    // Send all current active polls to teacher
    for (const poll of activePolls) {
      socket.emit('poll:new', activePollForEmit(poll));
      io.to(socket.id).emit('poll:results', { pollId: poll.id, ...liveResults(poll) });
    }
    // Send that teacher's poll history
    const teacherHistory = pollHistory.filter(p => p.createdBy === socket.id);
    io.to(socket.id).emit('poll:history', teacherHistory);
  });

  // --- Poll Creation by Teacher ---
 socket.on("teacher:poll", ({ question, options, duration, correctIndex }) => {
  const now = Date.now();
  const poll = {
    id: pollIdCounter++,
    question,
    options,
    answers: new Map(),
    endTime: now + (duration || 60000),
    createdBy: socket.id,
    correctIndex: typeof correctIndex === 'number' ? correctIndex : null
  };
  activePolls.push(poll);
  io.emit('poll:new', activePollForEmit(poll)); // update next function too!
  setTimeout(() => closePoll(poll.id), duration || 60000);
});

  // --- Student Voting ---
  socket.on("student:answer", ({ pollId, answerIndex }) => {
    const student = students.get(socket.id);
    const poll = activePolls.find(p => p.id === pollId);
    if (!student || !poll || poll.answers.has(student.name)) return;
    poll.answers.set(student.name, answerIndex);
    pushLiveResults(poll);
    // Close poll if all students have voted
    if (
      students.size > 0 &&
      Array.from(students.values()).every(s => poll.answers.has(s.name))
    ) {
      closePoll(poll.id);
    }
  });

  // --- Kicking by Teacher ---
  socket.on("teacher:kick", ({ name }) => {
    let sid = null;
    for (const [id, stu] of students.entries()) {
      if (stu.name === name) {
        sid = id;
        break;
      }
    }
    if (sid) {
      io.to(sid).emit("student:kicked");
      students.delete(sid);
      io.sockets.sockets.get(sid)?.disconnect(true);
      updateStudentsForTeacher();
      // Update results for all active polls because a student left
      for(const poll of activePolls) {
        pushLiveResults(poll);
      }
    }
  });

  // --- Chat for all roles ---
  socket.on("chat:message", msg => {
    io.emit("chat:message", msg);
  });

  // --- Disconnect ---
  socket.on("disconnect", () => {
    let removed = false;
    if (students.has(socket.id)) {
      students.delete(socket.id);
      removed = true;
      updateStudentsForTeacher();
    }
    if (teachers.has(socket.id)) {
      teachers.delete(socket.id);
    }
    // If student left, update votes in all polls
    if (removed) {
      for(const poll of activePolls) {
        pushLiveResults(poll);
      }
    }
  });
});

// ---- Helper functions ----

function updateStudentsForTeacher() {
  const list = Array.from(students.values()).map(s => s.name);
  teachers.forEach((_, id) => io.to(id).emit('students:update', list));
}

function pushLiveResults(poll) {
  if (!poll) return;
  const results = liveResults(poll);
  
  // Check if poll has ended or all students have answered
  const allStudentsAnswered = students.size > 0 && 
    Array.from(students.values()).every(s => poll.answers.has(s.name));
  const pollEnded = Date.now() >= poll.endTime;
  
  // Include correctIndex only if poll has ended or all students answered
  const resultData = {
    pollId: poll.id,
    ...results,
    ...(pollEnded || allStudentsAnswered ? { correctIndex: poll.correctIndex } : {})
  };
  
  io.emit('poll:results', resultData);

  // Send detailed vote ledger ONLY to teachers
  const perStudent = [];
  for (const [studentName, idx] of poll.answers) {
    perStudent.push({
      name: studentName,
      option: poll.options[idx]
    });
  }
  teachers.forEach((_, id) => io.to(id).emit('poll:details', perStudent));
}

function liveResults(poll) {
  if (!poll) return { counts: [] };
  const counts = Array(poll.options.length).fill(0);
  for (const idx of poll.answers.values()) {
    if (typeof idx === "number") counts[idx]++;
  }
  return { counts };
}

function closePoll(pollId) {
  const pollIdx = activePolls.findIndex(p => p.id === pollId);
  if (pollIdx === -1) return;
  const poll = activePolls.splice(pollIdx, 1)[0];
  
  const pollResult = {
    id: poll.id,
    question: poll.question,
    options: poll.options,
    results: liveResults(poll).counts,
    time: new Date().toISOString(),
    createdBy: poll.createdBy,
    correctIndex: poll.correctIndex,
    voteLedger: Array.from(poll.answers.entries()).map(([name, idx]) => ({
      name,
      option: poll.options[idx]
    }))
  };
  pollHistory.push(pollResult);

  // Send final results with correctIndex
  io.emit('poll:results', { 
    pollId: poll.id, 
    counts: liveResults(poll).counts,
    correctIndex: poll.correctIndex
  });
  
  // Send poll end event with correctIndex
  io.emit('poll:end', { 
    pollId: poll.id,
    correctIndex: poll.correctIndex
  });
  
  // Update poll history for teacher
  teachers.forEach((_, id) => {
    const teacherHistory = pollHistory.filter(p => p.createdBy === id);
    io.to(id).emit('poll:history', teacherHistory);
  });
}

function activePollForEmit(poll) {
  if (!poll) return null;
  return {
    id: poll.id,
    question: poll.question,
    options: poll.options,
    endTime: poll.endTime,
    correctIndex: poll.correctIndex ?? null
  };
}

// ---- Start server ----
const PORT = 4000;
server.listen(PORT, () => console.log(`SnapPole backend listening at http://localhost:${PORT}`));