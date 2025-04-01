import React from "react";
import logo from '../assets/logo.gif'
import { Link } from "react-router-dom"

export default function NavBar ({active}) {
    return (
        <header>
            <nav>
                <div className={'logo_wrapper'}>
                    <img src={logo} alt={"logo"}/>
                    <h4>CaDo</h4>
                </div>

                <ul className={"navigation-menu"}>

                    <li><Link to={"/"} className={active==='home' && 'activeNav'}>Home</Link></li>
                    <li><Link to={"/login"}>Login</Link></li>
                    <li><Link to="/register">Register</Link></li>
                </ul>
            </nav>
        </header>
    )
}