import React, { useState } from 'react'
import styles from './login.module.css';
import login from '../../assets/login.gif'
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, App } from 'antd';
import AuthServices from "../../services/authServices.js";
import {getErrorMessage} from "../../util/GetError.js";

export default function Login() {
    const { message } = App.useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            let dto = { email, password };
            const response = await AuthServices.loginUser(dto);
            console.log("Login API Response: ",response);
            localStorage.setItem('user', JSON.stringify({
                firstName: response.data.firstName,
                userId: response.data.userId,
                email: response.data.email,
                token: response.data.token
            }));

            message.success("Login successful");
            setTimeout(() => {
                navigate('/todo-list');
                setLoading(false);
            }, 1000);
        } catch (err) {
            console.log(err);
            message.error(getErrorMessage(err));
            setLoading(false);
        }
    }

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