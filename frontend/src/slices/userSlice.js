import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const ITEMS_PER_PAGE = 10;

export const fetchTodos = createAsyncThunk(
  "/getTodos",
  async ({ page = 1, limit = ITEMS_PER_PAGE }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`https://demo-todo-zdid.onrender.com/todos`, {
        params: { page, limit },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log(res.data);
      return {
        todos: res.data.todos || [],
        pagination: res.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalTodos: 0,
        },
      };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const todoSlice = createSlice({
  name: "todos",
  initialState: {
    todos: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalTodos: 0,
    },
  },

  reducers: {
    addTodo: (state, action) => {
      console.log(action.payload);
      state.todos = [action.payload, ...state.todos];
      state.pagination.totalTodos += 1;
      state.pagination.totalPages = Math.ceil(
        state.pagination.totalTodos / ITEMS_PER_PAGE
      );
      state.pagination.currentPage = 1;
    },
    deleteTodo: (state, action) => {
      state.todos = state.todos.filter((todo) => todo._id !== action.payload);
      state.pagination.totalTodos = Math.max(
        0,
        state.pagination.totalTodos - 1
      );
      state.pagination.totalPages = Math.ceil(
        state.pagination.totalTodos / ITEMS_PER_PAGE
      );
      if (state.todos.length === 0 && state.pagination.currentPage > 1) {
        state.pagination.currentPage -= 1;
      }
    },
    updateTodos: (state, action) => {
      state.todos = state.todos.map((todo, _id) =>
        todo._id === action.payload._id ? action.payload : todo
      );
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
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
        state.todos = action.payload.todos;
        state.pagination = action.payload.pagination;

        console.log("Redux updated:", {
          todosCount: action.payload.todos.length,
          pagination: action.payload.pagination,
        });
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { addTodo, deleteTodo, updateTodos, setCurrentPage } =
  todoSlice.actions;

export default todoSlice.reducer;
