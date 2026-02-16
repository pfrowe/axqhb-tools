import * as React from "react";

interface IUser {
  id: number
  email: string
  name: string
  created_at: string
  updated_at: string
}

interface IAuthContext {
  csrfToken: () => Promise<boolean>;
  setUser: (user: IUser | null) => void;
  token: string | undefined;
  user: IUser | null;
}

const AuthContext = React.createContext<IAuthContext>({
  csrfToken: (): Promise<boolean> => Promise.resolve(false),
  setUser: (user: IUser | null): void => { },
  token: null,
  user: null
});

const AuthProvider = ({ children }: any) => {
  const [token, setToken] = React.useState();
  const [user, _setUser] = React.useState<IUser | null>(JSON.parse(localStorage.getItem("user")) ?? null);
  const setUser = (user: any) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    else {
      localStorage.removeItem("user");
    }
    _setUser(user);
  };
  const csrfToken = async (): Promise<boolean> => {
    await (window as any).axios.get("/sanctum/csrf-cookie");
    setToken((await (window as any).cookieStore.get("XSRF-TOKEN")).value.replace(/%3D$/, ""));
    return true;
  };
  return (<AuthContext.Provider value={{ token, user, setUser, csrfToken }}>{children}</AuthContext.Provider>);
};
AuthProvider.displayName = "AuthProvider";

const useAuth = (): IAuthContext => (React.useContext(AuthContext));

export { AuthProvider, useAuth };
