import React, { useState, useEffect } from "react";
import EditTodo from "./EditTodo";
import "./NewTodo.css";
import { useDispatch, useSelector } from "react-redux";
import { addTodo, deleteTodo, updateTodos } from "../slices/userSlice";
import { fetchTodos } from "../slices/userSlice";
import { TextField } from "@mui/material";

export const Todo = () => {
  const [editId, setEditId] = useState(null);
  const [input, setInput] = useState({
    text: "",
    description: "",
    status: "Pending",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  const dispatch = useDispatch();
  const { todos, loading, error } = useSelector((state) => {
    return state.todos;
  });
  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);
  if (loading) return <p>Loading todos...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInput((curinput) => {
      return {
        ...curinput,
        [name]: value,
      };
    });
  };

  const handleAdd = async () => {
    await fetch("https://todoapp-backend-40tq.onrender.com/save", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })
      .then((response) => response.json())
      .then((data) => {
        dispatch(addTodo(data));
        setInput({
          text: "",
          description: "",
          status: "Pending",
        });

        setEditId(false);
        console.log(data);
      });
  };

  const updateToDo = async (_id, updatedData) => {
    console.log(_id, updatedData);
    await fetch(`https://todoapp-backend-40tq.onrender.com/update/${_id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ ...updatedData }),
    })
      .then((response) => response.json())
      .then(() => {
        dispatch(updateTodos(_id, updatedData));
        setEditId(null);
      });
  };

  const handleEdit = (todo) => {
    console.log(todo);
    setEditId(todo);
  };

  const handleSaveEdit = async (id, obj) => {
    console.log(id, obj);
    await updateToDo(id, obj);
    setEditId(null);
    dispatch(fetchTodos(obj));
  };

  const handleDelete = async (_id) => {
    await fetch(`https://todoapp-backend-40tq.onrender.com/delete/${_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _id }),
    })
      .then(() => {
        dispatch(deleteTodo(_id));
      })
      .catch((err) => console.log(err));
  };

  const logout = async () => {
    const response = await fetch(
      "https://todoapp-backend-40tq.onrender.com/logout",
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();
    if (data.success) {
      alert("Logged out");
      window.location.replace("/");
    } else {
      alert("Logout failed");
    }
  };

  const filteredTodos = todos.filter((task) =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);
  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="main">
      <div className="top-bar">
        <button className="login-link" onClick={() => logout()}>
          Logout
        </button>
      </div>
      <div className="container">
        <h1>To-do App</h1>
        <div className="cont-inp">
          <input
            name="text"
            type="text"
            value={input.text}
            onChange={handleChange}
            placeholder="Enter a task"
          />
          <textarea
            name="description"
            value={input.description}
            onChange={handleChange}
            placeholder="Description"
            rows="1"
          />
        </div>
        <div className="cont-add">
          <select name="status" value={input.status} onChange={handleChange}>
            <option value="Pendig">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <button onClick={() => handleAdd()}>Add</button>
        </div>
      </div>
      <div className="search-bar">
        <TextField
          size="small"
          variant="standard"
          type="text"
          label="Search tasks..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </div>
      <ul className="list">
        {paginatedTodos?.map((todo, index) => (
          <li key={index}>
            <div className="todos">
              <div className="todo">
                <strong className="text">{todo.text}</strong>-{" "}
                <em className="status">{todo.status}</em>
                <div className="desc">{todo.description}</div>
              </div>
              <div className="btn">
                <button className="btn-update" onClick={() => handleEdit(todo)}>
                  Update
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(todo._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx + 1}
            onClick={() => handlePageChange(idx + 1)}
            className={currentPage === idx + 1 ? "active-page" : ""}
          >
            {idx + 1}
          </button>
        ))}
      </div>
      <div>
        {editId && (
          <EditTodo
            todo={editId}
            onClose={() => setEditId(null)}
            onSave={handleSaveEdit}
          />
        )}
      </div>
    </div>
  );
};
