import React,{useState} from 'react'
import styles from './register.module.css';
import register from '../../assets/register.gif'
import {Link, useNavigate} from "react-router-dom";
import {App, Button, Input} from 'antd';
import AuthServices from "../../services/authServices.js";

export default function Register() {
    const { message } = App.useApp();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const normalizedEmail = email.toLowerCase().trim();

            if (!normalizedEmail) {
                message.error("Please enter an email address");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
                message.error("Please enter a valid email address");
                return;
            }
            const dto = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: normalizedEmail,
                password
            };
            const response = await AuthServices.registerUser(dto);
            message.success(response.message || "Registration Successful");
            setTimeout(() => navigate('/todo-list'), 1500);
        } catch (err) {
            if (err.response?.status === 409) {
                message.error(err.response.data?.message || "User already exists");
            } else {
                message.error(err.response?.data?.error ||
                    err.message ||
                    'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className={styles.login_card}>
                <img src={register} alt={'register'} />
                <div className={styles.input_wrapper1}>
                    <div className={styles.input_wrapper}>
                        <Input
                            placeholder={"First Name"}
                            value={firstName}
                            onChange={(e)=>setFirstName(e.target.value)} />
                    </div>
                    <div className={styles.input_wrapper}>
                        <Input
                            placeholder={"Last Name"}
                            value={lastName}
                            onChange={(e)=>setLastName(e.target.value)} />
                    </div>
                </div>
                <div className={styles.input_wrapper}>
                    <Input
                        placeholder={"someone@example.com"}
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)} />
                </div>
                <div className={styles.input_wrapper}>
                    <Input.Password
                        placeholder={"Password"}
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)} />
                </div>
                <div className={styles.input_info}>
                    Already have an account? <Link to={"/login"}>Login</Link>
                </div>
                <Button size={"large"}
                        type={"primary"}
                        disabled={!email.trim() || !password
                                    || !firstName.trim() || !lastName.trim()
                                 }
                        onClick={handleSubmit}>Sign Up
                </Button>
            </div>
        </div>
    )
}