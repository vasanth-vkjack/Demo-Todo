import React, { useState } from "react";
import "./NewTodo.css";

const EditTodo = ({ todo, onClose, onSave }) => {
  const [newInput, setNewInput] = useState(todo.text || "");
  const [newDesc, setNewDesc] = useState(todo.description || "");
  const [newStatus, setNewStatus] = useState(todo.status || "Pending");

  const handleSave = () => {
    onSave(todo._id, {
      text: newInput,
      description: newDesc,
      status: newStatus,
    });
  };

  return (
    <div className="main2">
      <div className="container">
        <h2>Edit To-Do</h2>
        <div className="cont-inp">
          <input
            value={newInput}
            type="text"
            onChange={(e) => setNewInput(e.target.value)}
            placeholder="New Task"
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="New Description"
            rows="1"
          />
        </div>
        <div className="cont-adde">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <div className="btn-edit">
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTodo;
