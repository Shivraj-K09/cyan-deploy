import { supabase } from "@/lib/supabaseClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: userData, error } = await supabase
        .from("users")
        .select("role, is_blocked")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      return {
        user: {
          ...session.user,
          role: userData.role,
        },
        isBlocked: userData.is_blocked,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  await supabase.auth.signOut();
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isBlocked: false,
    loading: true,
    error: null,
    initialCheckDone: false, // New flag
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.initialCheckDone = true; // Set to true after initial check
        if (action.payload) {
          state.user = action.payload.user;
          state.isBlocked = action.payload.isBlocked;
        } else {
          state.user = null;
          state.isBlocked = false;
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.initialCheckDone = true; // Set to true even if check fails
      });
  },
});

export default authSlice.reducer;
