import React, { useState } from "react";
import "./Loginpage.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const signupSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Loginpage = () => {
  const [state, setState] = useState("Login");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(state === "Login" ? loginSchema : signupSchema),
  });

  const fetchProfile = async () => {
    const response = await fetch("http://localhost:4000/profile", {
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

  const onSubmit = async (formData) => {
    const url = state === "Login" ? "/login" : "/signup";
    const response = await fetch(`http://localhost:4000${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (data.success) {
      alert(`${state} successful`);
      if (state === "Login") {
        fetchProfile();
      } else {
        setState("Login");
      }
    } else {
      alert(data.errors);
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="loginsignup-field">
          {state === "Sign Up" && (
            <>
              <input
                type="text"
                placeholder="Your Name"
                {...register("username")}
              />
              {errors.username && (
                <p className="error">{errors.username?.message}</p>
              )}
            </>
          )}

          <input
            type="email"
            placeholder="Email Address"
            {...register("email")}
          />
          {errors.email && <p className="error">{errors.email?.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <p className="error">{errors.password?.message}</p>
          )}

          <button type="submit">Continue</button>
        </form>

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
