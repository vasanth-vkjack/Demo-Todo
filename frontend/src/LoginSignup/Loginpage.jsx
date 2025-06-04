import React, { useState } from "react";
import "./Loginpage.css";

const Loginpage = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "", 
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchProfile = async () => {
    const response = await fetch("https://todoapp-backend-40tq.onrender.com/profile", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (data.success) {
      alert("Welcome: " + data.email);
      window.location.replace("/profile");
    } else {
      alert("Not authenticated");
    }
  };

  const login = async () => {
    const response = await fetch("https://todoapp-backend-40tq.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (data.success) {
      alert("Login successful");
      fetchProfile();
      console.log(data);
    } else {
      alert(data.errors);
    }
  };

  const signup = async () => {
    const response = await fetch("https://todoapp-backend-40tq.onrender.com/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (data.success) {
      alert("Signup successful");
      setState("Login");
      console.log(data);
    } else {
      alert(data.errors);
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-field">
          {state === "Sign Up" && (
            <input
              name="username"
              value={formData.username}
              onChange={changeHandler}
              type="text"
              placeholder="Your Name"
            />
          )}
          <input
            name="email"
            value={formData.email}
            onChange={changeHandler}
            type="email"
            placeholder="Email Address"
          />
          <input
            name="password"
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder="Password"
          />
        </div>
        <button onClick={() => (state === "Login" ? login() : signup())}>
          Continue
        </button>
        {state === "Sign Up" ? (
          <p className="loginsignup-login">
            Already have an account?{" "}
            <span onClick={() => setState("Login")}>Login here</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Create an account?{" "}
            <span onClick={() => setState("Sign Up")}>Click here</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Loginpage;
