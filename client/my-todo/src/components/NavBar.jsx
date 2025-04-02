import React, {useEffect, useState} from "react";
import logo from '../assets/logo.gif'
import {Link, useNavigate} from "react-router-dom"
import {getUserDetails} from "../util/GetUser.js";
import {Dropdown} from "antd";
import avatar from "../assets/login.png"
import './NavBar.css';

export default function NavBar({active}) {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    console.log('User in NavBar:', user);

    useEffect(() => {
        const checkAuth = () => {
            const userData = getUserDetails();
            setUser(userData);
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);

        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('storage'));
        navigate('/login');
    }

    const items = [
        {
            key: '1',
            label: (
                <span onClick={handleLogout}>Logout</span>
            ),
        },
    ];

    return (
        <header>
            <nav>
                <div className='logo_wrapper'>
                    <img src={logo} alt="logo"/>
                    <h4>CaDo</h4>
                </div>

                <ul className="navigation-menu">
                    <li>
                        <Link
                            to="/"
                            className={active === 'home' ? 'activeNav' : undefined}
                        >
                            Home
                        </Link>
                    </li>
                    {user && (
                        <li>
                            <Link
                                to="/todo-list"
                                className={active === 'myTask' ? 'activeNav' : undefined}
                            >
                                My Task
                            </Link>
                        </li>
                    )}
                    {user ? (
                        <Dropdown
                            menu={{
                                items,
                            }}
                            placement={"bottom"}
                            arrow
                        >
                            <div className="avatar-container">
                                <img src={avatar} alt="avatar" className="avatar-image" />
                                <span className="avatar-name">
                                    {user?.firstName ? `Hello, ${user.firstName}` : "Active"}
                                </span>
                            </div>
                        </Dropdown>
                    ) : (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </>
                    )}
                    </ul>
            </nav>
        </header>
    )
}