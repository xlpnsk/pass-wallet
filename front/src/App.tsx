import * as React from "react";
import "./App.css";
import { Link, Route, useLocation } from "wouter";
import { Register } from "./Register";
import { Login } from "./Login";
import { Wallet } from "./Wallet";
import jwt from "jwt-decode";
import { Account } from "./Account";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { AddNew } from "./AddNew";
import http from "./httpService";
interface IUserContextData {
  login: string | null;
  password: string | null;
}
interface IUserContext extends IUserContextData {
  dispatch: React.Dispatch<Action> | (() => {});
}
export interface IJwtToken {
  login: string;
  sub: number;
  iat: number;
  exp: number;
}

const initialState = {
  login: null,
  password: null,
};

export const UserContext = React.createContext<IUserContext>({
  ...initialState,
  dispatch: () => {},
});

type Action =
  | { type: "setLogin"; login: string }
  | { type: "setPassword"; password: string }
  | { type: "logout" }
  | { type: "resetPassword" };

function reducer(state: IUserContextData, action: Action): IUserContextData {
  switch (action.type) {
    case "setLogin":
      return { ...state, login: action.login };
      break;
    case "setPassword":
      return { ...state, password: action.password };
      break;
    case "logout":
      return initialState;
      break;
    case "resetPassword":
      return { ...state, password: null };
      break;
    default:
      throw new Error();
  }
}

Modal.setAppElement("#root");

function App() {
  const [user, dispatch] = React.useReducer(reducer, initialState);
  const [location, setLocation] = useLocation();
  const contextValue = { ...user, dispatch };
  React.useEffect(() => {
    const token = window.localStorage.getItem("token");
    const login = token ? jwt<IJwtToken>(token).login : null;
    if (login) {
      http
        .get("/wallet")
        .then((resp) => {
          dispatch({ type: "setLogin", login: login });
        })
        .catch((err) => {
          if (err.response.status === 401) {
            window.localStorage.removeItem("token");
            toast("You've been logged out", {
              type: "info",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              progress: undefined,
              theme: "light",
            });
          } else {
            toast("Error occured. Try again later.", {
              type: "error",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              progress: undefined,
              theme: "light",
            });
          }
        });
    }
  }, []);

  const logout = () => {
    window.localStorage.removeItem("token");
    dispatch({ type: "logout" });
    setLocation("/signin");
    toast("You've been logged out", {
      type: "info",
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      progress: undefined,
      theme: "light",
    });
  };

  return (
    <UserContext.Provider value={contextValue}>
      <div className="App">
        <header>
          <h2>pass-wallet</h2>
          {!!!user.login ? (
            <div className="header-links">
              <Link href="/signin">
                <a className="link">Sign in</a>
              </Link>
              <Link href="/signup">
                <a className="link">Sign up</a>
              </Link>
            </div>
          ) : (
            <div className="header-links">
              <Link href="/wallet">
                <a className="link">Wallet</a>
              </Link>
              <Link href="/account">
                <a className="link">Account</a>
              </Link>
              <button onClick={logout}>Log out</button>
            </div>
          )}
        </header>
        <main>
          <Route path="/">
            <div className="home">
              <h1>Welcome to pass-wallet</h1>
              {!!!user.login ? (
                <div className="header-links">
                  <Link href="/signin">
                    <a className="link">Sign in</a>
                  </Link>
                  <Link href="/signup">
                    <a className="link">Sign up</a>
                  </Link>
                </div>
              ) : (
                <div className="header-links">
                  <Link href="/wallet">
                    <a className="link">Wallet</a>
                  </Link>
                  <Link href="/account">
                    <a className="link">Account</a>
                  </Link>
                  <button onClick={logout}>Log out</button>
                </div>
              )}
            </div>
          </Route>
          <Route path="/signin">
            <Login />
          </Route>
          <Route path="/signup">
            <Register />
          </Route>
          <Route path="/wallet">
            <Wallet />
          </Route>
          <Route path="/account">
            <Account />
          </Route>
          <Route path="/new">
            <AddNew />
          </Route>
        </main>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="light"
      />
      {/* Same as */}
    </UserContext.Provider>
  );
}

export default App;
