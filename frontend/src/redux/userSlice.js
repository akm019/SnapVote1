import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => {
  // Use sessionStorage for per-tab persistence
  let s = sessionStorage.getItem('snapUser');
  return s ? JSON.parse(s) : { role: null, name: '', id: null };
};

const userSlice = createSlice({
  name: 'user',
  initialState: getInitialState(),
  reducers: {
    setUser: (state, { payload }) => {
      state.role = payload.role;
      state.name = payload.name;
      state.id = payload.id ?? state.id;
      sessionStorage.setItem('snapUser', JSON.stringify(state));
    },
    resetUser: (state) => {
      state.role = null;
      state.name = '';
      state.id = null;
      sessionStorage.removeItem('snapUser');
    },
  },
});

export const { setUser, resetUser } = userSlice.actions;
export default userSlice.reducer;