import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import pollReducer from './pollSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    poll: pollReducer,
    chat: chatReducer,
  },
});