import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchTodos = createAsyncThunk(
  "/getTodos",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("https://todoapp-backend-40tq.onrender.com/todos", {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.log(error);
      rejectWithValue(error.response);
    }
  }
);

const todoSlice = createSlice({
  name: "todos",
  initialState: {
    todos: [],
    loading: false,
    error: null,
  },

  reducers: {
    addTodo: (state, action) => {
      state.todos = [...state.todos, action.payload];
    },
    deleteTodo: (state, action) => {
      state.todos = state.todos.filter(
        (todos, _id) => todos._id !== action.payload
      );
    },
    updateTodos: (state, action) => {
      state.todos = state.todos.map((todo, _id) =>
        todo._id === action.payload._id ? action.payload : todo
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { addTodo, deleteTodo, updateTodos } = todoSlice.actions;

export default todoSlice.reducer;
