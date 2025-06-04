import React from "react";
import { Todo } from "./components/ToDo";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loginpage from "./LoginSignup/Loginpage";
import Home from "./components/Home";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Todo />} />
          <Route path="/loginpage" element={<Loginpage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
