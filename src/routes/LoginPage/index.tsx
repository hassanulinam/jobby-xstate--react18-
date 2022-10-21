import { useMachine } from "@xstate/react";
import { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { getAccessToken } from "../../utils/accessToken";
import { authMachine } from "../../xstate-machines/authMachine";
import "./index.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authState, send] = useMachine(authMachine);
  const history = useHistory();

  useEffect(() => {
    if (authState.value === "loginSuccess") {
      history.push("/");
    }
  }, [authState.value]);

  const onChangeName = (e: any) => {
    setUsername(e.target.value);
  };
  const onPasswordChange = (e: any) => {
    setPassword(e.target.value);
  };
  const onLogin = (e: any) => {
    e.preventDefault();
    send({ type: "SUBMIT", formData: { username, password } });
  };

  const renderForm = () => (
    <form className="login-form-container" onSubmit={onLogin}>
      <img
        alt="website logo"
        src="https://assets.ccbp.in/frontend/react-js/logo-img.png "
        className="login-website-logo"
      />
      <label htmlFor="usernameInput" className="login-form-label">
        USERNAME
      </label>
      <input
        id="usernameInput"
        value={username}
        className="input-field"
        placeholder="Username"
        onChange={onChangeName}
      />
      <label htmlFor="passwordInput" className="login-form-label">
        PASSWORD
      </label>
      <input
        id="passwordInput"
        type="password"
        value={password}
        className="input-field"
        placeholder="Password"
        onChange={onPasswordChange}
      />
      <button type="submit" className="login-btn">
        Login
      </button>
      <p className="error-message">{authState.context.error}</p>
    </form>
  );

  const accessToken = getAccessToken();
  if (accessToken !== undefined) {
    return <Redirect to="/" />;
  }
  return <div className="login-route-container">{renderForm()}</div>;
};

export default Login;
