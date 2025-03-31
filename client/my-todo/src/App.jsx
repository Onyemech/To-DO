import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from "./pages/Landing/Landing.jsx";
import Register from "./pages/Auth/Register.jsx";
import Login from "./pages/Auth/Login.jsx";
import ToDoList from "./pages/ToDo/ToDoList.jsx";
import './App.css';

function App() {
  return (
      <BrowserRouter>
       <Routes>
            <Route path="/" element={<Landing/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="-todo-list" element={<ToDoList/>} />
       </Routes>
      </BrowserRouter>
  )
}

export default App
