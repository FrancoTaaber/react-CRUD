import React from "react";

export const Login = ({ onLogin }) => {
    const handleOnSubmit = (evt) => {
        evt.preventDefault();
        onLogin(evt.target.email.value, evt.target.password.value);
    };

    return (
        <form onSubmit={handleOnSubmit}>
            <h3>Log in</h3>
            <input placeholder="Email" name="email" />
            <input placeholder="Password" name="password" type="password" />
            <button onSubmit={handleOnSubmit}>Log in</button>
        </form>
    );
};
