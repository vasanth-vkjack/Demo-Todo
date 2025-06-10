import React, { useState, useEffect } from "react";
import EditTodo from "./EditTodo";
import "./NewTodo.css";
import { useDispatch, useSelector } from "react-redux";
import { addTodo, deleteTodo, updateTodos, setCurrentPage } from "../slices/userSlice";
import { fetchTodos } from "../slices/userSlice";
import { TextField } from "@mui/material";
import Profile from "./Profile";
import { fetchProfile } from "../slices/profileSlice";

export const Todo = () => {
  const [editId, setEditId] = useState(null);
  const [input, setInput] = useState({
    text: "",
    description: "",
    status: "Pending",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPages] = useState(1);
  const [showProfile, setShowProfile] = useState(false);

  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.profile);

  // useEffect(() => {
  // }, [dispatch]);

  const ITEMS_PER_PAGE = 10;

  const { todos, pagination, loading, error } = useSelector((state) => {
    return state.todos;
  });
  useEffect(() => {
    console.log("Todos data:", todos);
  }, [todos]);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchTodos({ page: currentPage, limit: ITEMS_PER_PAGE }));
  }, [dispatch, currentPage]);
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
    await fetch("http://localhost:4000/save", {
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
    await fetch(`http://localhost:4000/update/${_id}`, {
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
    dispatch(fetchTodos({ page: currentPage, limit: ITEMS_PER_PAGE }));
  };

  const handleDelete = async (_id) => {
    await fetch(`http://localhost:4000/delete/${_id}`, {
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
    const response = await fetch("http://localhost:4000/logout", {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();
    if (data.success) {
      alert("Logged out");
      window.location.replace("/");
    } else {
      alert("Logout failed");
    }
  };

  //  const filteredTodos = todos.filter((task) =>
  //   task.text.toLowerCase().includes(searchQuery.toLowerCase())
  // );
  console.log("todos", todos, pagination.totalTodos);
  // const filteredTodos = Array.isArray(todos)
  //   ? todos.filter((task) =>
  //       task?.text?.toLowerCase().includes(searchQuery.toLowerCase())
  //     )
  //   : [];
  // const filteredTodos = (Array.isArray(todos) ? todos : []).filter((task) =>
  //   task?.text?.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  // const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);
  const totalPages = pagination?.totalPages || 1;
  // const paginatedTodos = filteredTodos.slice(
  //   (pagination.currentPage - 1) * ITEMS_PER_PAGE,
  //   pagination.currentPage * ITEMS_PER_PAGE
  // );
  const paginatedTodos = Array.isArray(todos) ? todos : [];

  const searchedTodos = searchQuery 
  ? paginatedTodos.filter(todo => 
      todo?.text?.toLowerCase().includes(searchQuery.toLowerCase()))
  : paginatedTodos;

  const handlePageChange = (page) => {
    setCurrentPages(page);
    dispatch(setCurrentPage(page))
    dispatch(fetchTodos({ page, limit: ITEMS_PER_PAGE }));
  };
  console.log("Todos from Redux:", todos);
  console.log("Type of todos:", typeof todos);

  return (
    <div className="main">
      <div className="top-bar">
        {profile && (
          <div className="user-icon" onClick={() => setShowProfile(true)}>
            {profile.user.profilePic ? (
              <img
                src={profile.user.profilePic}
                alt="Profile"
                // className="profile-image"
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              />
            ) : (
              profile.user.name.charAt(0).toUpperCase()
            )}
          </div>
        )}

        <div className={`profile-sidebar ${showProfile ? "show" : ""}`}>
          <Profile />
          <button className="close-btn" onClick={() => setShowProfile(false)}>
            X
          </button>
        </div>

        <button className="login-link" onClick={() => logout()}>
          Logout
        </button>
      </div>
      <div className="container">
        <h1>To-do App</h1>
        <div className="cont-inp">
          <input
            size="small"
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
        {console.log("Renderinng Todos:", paginatedTodos)}
        {searchedTodos?.length > 0 ? (
          searchedTodos?.map((todo, index) => (
            <li key={index}>
              <div className="todos">
                <div className="todo">
                  <strong className="text">{todo.text}</strong>-{" "}
                  <em className="status">{todo.status}</em>
                  <div className="desc">{todo.description}</div>
                </div>
                <div className="btn">
                  <button
                    className="btn-update"
                    onClick={() => handleEdit(todo)}
                  >
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
          ))
        ) : (
          <p>No todos to Display</p>
        )}
      </ul>
     {/* <div className="pagination">
        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx + 1}
            onClick={() => handlePageChange(idx + 1)}
            className={pagination.currentPage === idx + 1 ? "active-page" : ""}
          >
            {idx + 1}
          </button>
        ))}
      </div>*/}
    {console.log("pagination",pagination)}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = idx + 1;
            } else if (pagination.currentPage <= 3) {
              pageNum = idx + 1;
            } else if (pagination.currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + idx;
            } else {
              pageNum = pagination.currentPage - 2 + idx;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={pagination.currentPage === pageNum ? "active-page" : ""}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

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
