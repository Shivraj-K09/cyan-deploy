import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  name: "",
  avatarUrl: null,
  membershipLevel: null,
  points: 0,
  lastPointsAwardDate: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    updatePoints: (state, action) => {
      state.points = action.payload;
    },
    updateLastPointsAwardDate: (state, action) => {
      state.lastPointsAwardDate = action.payload;
    },
    clearUser: () => initialState,
  },
});

export const { setUser, updatePoints, updateLastPointsAwardDate, clearUser } =
  userSlice.actions;

export default userSlice.reducer;
