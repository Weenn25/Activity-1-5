import React, { useState, useEffect } from 'react';
import './App.css';
import { FaPlus, FaTrashAlt, FaCheckCircle } from 'react-icons/fa';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  // Fetch tasks from backend on mount
  useEffect(() => {
    fetch('http://localhost:3000/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(() => setTasks([]));
  }, []);

  const addTask = async () => {
    if (input.trim() === '') return;
    try {
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input })
      });
      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        setInput('');
      } else {
        alert('Failed to add task.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  const deleteTask = async (idx) => {
    const task = tasks[idx];
    try {
      const response = await fetch(`http://localhost:3000/tasks/${task._id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setTasks(tasks.filter((_, i) => i !== idx));
      } else {
        alert('Failed to delete task.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  const toggleTask = async (idx) => {
    const task = tasks[idx];
    try {
      const response = await fetch(`http://localhost:3000/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      if (response.ok) {
        const updated = await response.json();
        setTasks(tasks.map((t, i) => i === idx ? updated : t));
      } else {
        alert('Failed to update task.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  return (
    <div className="app-bg">
      <div className="todo-card">
        <h1 className="todo-title">📝 To-Do List</h1>
        <div className="input-row">
          <input
            className="todo-input"
            type="text"
            placeholder="Add a new task..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <button className="add-btn" onClick={addTask}>
            <FaPlus />
          </button>
        </div>
        <ul className="task-list">
          {tasks.map((task, idx) => (
            <li key={task._id || idx} className={task.completed ? 'task completed' : 'task'}>
              <span onClick={() => toggleTask(idx)} className="check-icon">
                {task.completed ? <FaCheckCircle color="#4caf50" /> : <FaCheckCircle color="#bbb" />}
              </span>
              <span className="task-text">{task.title}</span>
              <button className="delete-btn" onClick={() => deleteTask(idx)}>
                <FaTrashAlt />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
