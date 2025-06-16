import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
  },
  reducers: {
    addMessage(state, { payload }) {
      state.messages.push(payload);
    },
    setMessages(state, { payload }) {
      state.messages = payload;
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const { addMessage, setMessages, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;