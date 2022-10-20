import { action, flow, makeAutoObservable } from "mobx";
import apiConst from "../../constants/apiConst";
import { deleteAccessToken, setAccessToken } from "../../utils/accessToken";
import makeAsyncCall from "../../utils/makeAsyncCall";

class AuthStore {
  loginErr = "";
  apiStatus = apiConst.initial;

  constructor() {
    makeAutoObservable(
      this,
      {
        onLogin: flow.bound,
        onLoginApiSuccess: action.bound,
        onLoginApiFailure: action.bound,
        setApiStatus: action.bound,
        onLogout: action.bound,
        saveToken: action.bound,
        resetStore: action.bound,
      },
      { autoBind: true }
    );
  }

  // ====================================================

  setApiStatus(status: string) {
    this.apiStatus = status;
  }

  onLoginApiSuccess = (onSuccess: () => void) => (data: any) => {
    if (data.jwt_token) {
      this.saveToken(data.jwt_token);
      this.setApiStatus(apiConst.success);
      onSuccess();
    } else this.loginErr = `*${data.error_msg}`;
  };

  onLoginApiFailure(response: any) {
    const data = response;
    this.loginErr = `*${data.error_msg}`;
    this.setApiStatus(apiConst.failure);
  }

  *onLogin({ username, password }: any, onSuccess: any) {
    const url = "https://apis.ccbp.in/login";
    const options = {
      method: "POST",
      body: JSON.stringify({ username, password }),
    };

    yield makeAsyncCall(
      { url, options },
      this.onLoginApiSuccess(onSuccess),
      this.onLoginApiFailure
    );
  }

  onLogout() {
    deleteAccessToken();
    this.resetStore();
  }

  saveToken(token: string) {
    setAccessToken(token);
  }

  resetStore() {
    this.loginErr = "";
    this.apiStatus = apiConst.initial;
  }
}

export default AuthStore;
