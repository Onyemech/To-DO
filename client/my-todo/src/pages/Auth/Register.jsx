import React, {useEffect, useState} from 'react'
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
            setTimeout(() => navigate('/login'), 1500);

            useEffect(() => {
                const initializeOneSignal = async () => {
                    const waitForOneSignal = () => new Promise((resolve, reject) => {
                        const check = () => {
                            if (window.OneSignal) {
                                resolve();
                            } else if (Date.now() - startTime > 30000) {
                                reject(new Error('OneSignal SDK failed to load within 30 seconds'));
                            } else {
                                setTimeout(check, 100);
                            }
                        };
                        const startTime = Date.now();
                        check();
                    });

                    try {
                        await waitForOneSignal();
                        console.log('OneSignal loaded');

                        await window.OneSignal.init({
                            appId: '1d1f6414-0e0a-4031-aa80-3ed678c28a3b',
                            allowLocalhostAsSecureOrigin: true,
                        });

                        const permission = await window.OneSignal.Notifications.permission;
                        if (permission === 'default') {
                            await window.OneSignal.showSlidedownPrompt();
                        }

                        const playerId = await window.OneSignal.getUserId();
                        if (playerId) {
                            const user = JSON.parse(localStorage.getItem('user'));
                            if (user?.userId) {
                                await fetch('http://localhost:5000/api/update-player-id', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${user.token}`,
                                    },
                                    body: JSON.stringify({ playerId }),
                                });
                            }
                        }

                        window.OneSignal.on('subscriptionChange', async (isSubscribed) => {
                            if (isSubscribed) {
                                const newPlayerId = await window.OneSignal.getUserId();
                                if (newPlayerId) {
                                    const user = JSON.parse(localStorage.getItem('user'));
                                    if (user?.userId) {
                                        await fetch('http://localhost:5000/api/update-player-id', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${user.token}`,
                                            },
                                            body: JSON.stringify({ playerId: newPlayerId }),
                                        });
                                    }
                                }
                            }
                        });
                    } catch (error) {
                        console.error('OneSignal init failed:', error);
                        message.error("Failed to initialize notifications.");
                    }
                };

                const user = JSON.parse(localStorage.getItem('user'));
                if (user?.token) {
                    initializeOneSignal();
                }
            }, []);

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
                <div className={styles.input_wrapper}>
                    <div className={styles.input_wrapper}>
                        <h4>First Name</h4>
                        <Input
                            placeholder={"First Name"}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}/>
                    </div>
                    <div className={styles.input_wrapper}>
                        <h4>Last Name</h4>
                        <Input
                            placeholder={"Last Name"}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}/>
                    </div>
                </div>
                <div className={styles.input_wrapper}>
                    <h4>Email</h4>
                    <Input
                        placeholder={"someone@example.com"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className={styles.input_wrapper}>
                    <h4>Password</h4>
                    <Input.Password
                        placeholder={"Password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}/>
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