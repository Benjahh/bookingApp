import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(window.localStorage.getItem('user')) ?? {},
  edit: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout(state, action) {
      state.user = null;
      localStorage?.removeItem('user');
    },
    updateProfile(state, action) {
      state.edit = action.payload;
    },
  },
});

export default userSlice.reducer;

export function UserLogin(user) {
  return (dispatch, getstate) => {
    dispatch(userSlice.actions.login(user));
  };
}

export function UserLogin() {
  return (dispatch, getstate) => {
    dispatch(userSlice.actions.login());
  };
}

export function UserLogin(val) {
  return (dispatch, getstate) => {
    dispatch(userSlice.actions.login(val));
  };
}
