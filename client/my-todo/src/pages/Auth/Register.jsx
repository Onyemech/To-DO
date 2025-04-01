import React,{useState} from 'react'
import styles from './register.module.css';
import register from '../../assets/register.gif'
import {Link, useNavigate} from "react-router-dom";
import {Button, Input} from 'antd';

export default function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e)=>{
        e.preventDefault();
        console.log("Register");

        navigate("/api/login");
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
                        placeholder={"Email"}
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