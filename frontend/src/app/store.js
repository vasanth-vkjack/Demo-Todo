import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "../slices/userSlice";
import profileReducer from "../slices/profileSlice";

const store = configureStore({
  reducer: {
    todos: todoReducer,
    profile: profileReducer,
  },
});

export default store;
