import * as React from "react";

const AuthContext = React.createContext({
  csrfToken: () => { },
  setUser: () => { },
  token: null,
  user: null
});

const AuthProvider = ({ children }) => {
  const [token, setToken] = React.useState();
  const [user, _setUser] = React.useState(JSON.parse(localStorage.getItem("user")) ?? null);
  const setUser = (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    else {
      localStorage.removeItem("user");
    }
    _setUser(user);
  };
  const csrfToken = async () => {
    await axios.get("/sanctum/csrf-cookie");
    setToken((await window.cookieStore.get("XSRF-TOKEN")).value.replace(/%3D$/, ""));
    return true;
  };
  return (<AuthContext.Provider value={{ token, user, setUser, csrfToken }}>{children}</AuthContext.Provider>);
};
AuthProvider.displayName = "AuthProvider";

const useAuth = () => (React.useContext(AuthContext));

export { AuthProvider, useAuth };