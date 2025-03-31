import React from "react";
import NavBar from "../../components/NavBar.jsx";
import {Link} from "react-router-dom";
import styles from "./Landing.module.css";
import landing from "../../assets/landing.jpg"

export default function Landing() {
    return (
        <div>
            <NavBar active={"home"}/>
            <div className={styles.landing_wrapper}>
                    <div className={styles.landing_text}>
                        <h1>Schedule Your daily Tasks With <br/><span className={"primaryText"}>CaDo</span></h1>
                        <div className={"btwWrapper"}>
                            <Link to={"/register"} className={"registerBtn"}>Register</Link>
                            <Link to={"/login"} className={"loginBtn"}>Login</Link>
                        </div>
                    </div>

            <div className={styles.landing_img}>
                <img src={landing} alt="landing"/>
            </div>
            </div>
        </div>
    )
}