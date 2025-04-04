import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import avatar from "../assets/login.png";
import logo from "../assets/logo.gif";
import "./NavBar.css";
import { useAuth } from "../context/authContext.jsx";

export default function NavBar({ active }) {
    const [logoutClicked, setLogoutClicked] = useState(false);
    const navigate = useNavigate();
    const {user, logout} = useAuth();


    const handleLogout = async () => {
        if (logoutClicked) return;

        setLogoutClicked(true);

        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLogoutClicked(false);
        }
    };

    const items = [
        {
            key: "1",
            label: (
                <span onClick={handleLogout}>
                    {logoutClicked ? "Logging out..." : "Logout"}
                </span>
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
                            trigger={["click"]}
                        >
                            <div className="avatar-container">
                                <img src={avatar} alt="avatar" className="avatar-image" />
                                <span className="avatar-name">
                                    {user?.firstName ? `Hello, ${user.firstName}` : "Account"}
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