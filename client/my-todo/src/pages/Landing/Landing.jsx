import React from "react";
import NavBar from "../../components/NavBar.jsx";
import { Link } from "react-router-dom";
import styles from "./Landing.module.css";
import landing from "../../assets/landing.jpg";
import { useAuth } from "../../context/authContext.jsx";

export default function Landing() {
    const { user } = useAuth();

    return (
        <div>
            <NavBar active={"home"} />
            <div className={styles.landing_wrapper}>
                <div className={styles.landing_text}>
                    <h1>
                        Schedule Your daily Tasks With <br />
                        <span className="primaryText">CaDo</span>
                    </h1>
                    {!user?.token && (
                        <div className="btwWrapper">
                            <Link to="/register" className="registerBtn">
                                Register
                            </Link>
                            <Link to="/login" className="loginBtn">
                                Login
                            </Link>
                        </div>
                    )}
                    {user?.token && (
                        <div className="btwWrapper">
                            <Link to="/todo-list" className="registerBtn">
                                Go to My Tasks
                            </Link>
                        </div>
                    )}
                </div>
                <div className={styles.landing_img}>
                    <img src={landing} alt="landing" />
                </div>
            </div>
        </div>
    );
}