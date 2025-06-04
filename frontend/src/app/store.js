import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "../slices/userSlice";

const store = configureStore({
  reducer: {
    todos: todoReducer,
  }
});

export default store;
