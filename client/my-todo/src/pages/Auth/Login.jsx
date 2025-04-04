import React, { useState } from 'react'
import styles from './login.module.css';
import login from '../../assets/login.gif'
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, App } from 'antd';
import AuthServices from "../../services/authServices.js";
import {getErrorMessage} from "../../util/GetError.js";
import {useAuth} from "../../context/authContext.jsx";

export default function Login() {
    const {login: authLogin} = useAuth();

    const { message } = App.useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const normalizedEmail = email.toLowerCase().trim();

        if (!normalizedEmail) {
            message.error("Please enter an email address");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            message.error("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);
            let dto = { email: normalizedEmail, password };
            const response = await AuthServices.loginUser(dto);

            const userData = {
                firstName: response.data.firstName,
                userId: response.data.userId.toString(),
                email: response.data.email.toLowerCase(),
                token: response.data.token
            };
            authLogin(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            message.success("Login successful");
            navigate('/todo-list');
        } catch (err) {
            console.log(err);
            message.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.login_card}>
            <img src={login} alt={'Login'} />
            <h2>Login</h2>
            <div className={styles.input_wrapper}>
                <Input
                    placeholder={"Email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className={styles.input_wrapper}>
                <Input.Password
                    placeholder={"Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className={styles.input_info}>
                New User? <Link to={"/register"}>Register</Link>
            </div>
            <Button
                loading={loading}
                size={"large"}
                type={"primary"}
                disabled={!email || !password}
                onClick={handleSubmit}
            >
                Login
            </Button>
        </div>
    )
}