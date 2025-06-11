import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://demo-todo-zdid.onrender.com/profileDetails",
        {
          withCredentials: true,
          mode: cors,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const uploadProfilepic = createAsyncThunk(
  "profile/uploadProfilepic",
  async (file, { rejectWithValue }) => {
    try {
      const formdata = new FormData();
      formdata.append("profilePic", file);

      const response = await axios.post(
        "https://demo-todo-zdid.onrender.com/uploadProfilePic",
        formdata,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profile: null,
    loading: false,
    error: null,
    uploadLoading: false,
    uploadError: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadProfilepic.pending, (state, action) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(uploadProfilepic.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.profile = {
          user: {
            ...state.profile.user,
            profilePic: action.payload?.profilePic,
          },
        };
      })
      .addCase(uploadProfilepic.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload;
      });
  },
});

export default profileSlice.reducer;
