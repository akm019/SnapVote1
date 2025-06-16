import { createSlice } from '@reduxjs/toolkit';

const pollSlice = createSlice({
  name: 'poll',
  initialState: {
    activePoll: null,
    answered: false,
    results: [],
    history: [],
    studentList: [],
    pollHasEnded: false,
    correctIndex: null, // Add this
  },
  reducers: {
    setActivePoll(state, { payload }) {
      state.activePoll = payload;
      state.answered = false;
      state.results = [];
      state.pollHasEnded = false;
      state.correctIndex = null; // Reset
    },
    setAnswered(state, { payload }) {
      state.answered = payload;
    },
    updateResults(state, { payload }) {
      state.results = payload;
    },
    setCorrectIndex(state, { payload }) { // Add this
      state.correctIndex = payload;
    },
    addHistory(state, { payload }) {
      state.history.push(payload);
    },
    setStudentList(state, { payload }) {
      state.studentList = payload;
    },
    resetPoll(state) {
      state.activePoll = null;
      state.answered = false;
      state.results = [];
      state.correctIndex = null; // Reset
    },
    setPollEnded(state) {
      state.pollHasEnded = true;
    },
  },
});

export const { 
  setActivePoll, 
  setAnswered, 
  updateResults, 
  setCorrectIndex, // Export this
  addHistory, 
  setStudentList, 
  resetPoll, 
  setPollEnded 
} = pollSlice.actions;
export default pollSlice.reducer;