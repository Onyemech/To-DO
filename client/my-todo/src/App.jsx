import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from "./pages/Landing/Landing.jsx";
import Register from "./pages/Auth/Register.jsx";
import Login from "./pages/Auth/Login.jsx";
import ToDoList from "./pages/ToDo/ToDoList.jsx";
import './App.css';
import 'antd/dist/reset.css';
import { App as AntApp } from 'antd';

function App() {
    const { message } = AntApp.useApp();

    return (
        <AntApp>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing/>} />
                    <Route path="/register" element={<Register/>} />
                    <Route path="/login" element={<Login/>} />
                    <Route path="/todo-list" element={<ToDoList/>} />
                </Routes>
            </BrowserRouter>
        </AntApp>
    )
}

export default App