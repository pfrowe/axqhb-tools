import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import * as UserPages from "./User";
import { useAuth } from "../contexts/AuthContext";

const UserPage = () => {
  const { user } = useAuth();
  return user
    ? (<Routes>
      <Route path="/" element={<Navigate to="profile" />} />
      <Route path="profile" element={<UserPages.ProfilePage />} />
    </Routes>)
    : (<Routes>
      <Route path="/" element={<Navigate to="login" />} />
      <Route path="forgot" element={<UserPages.ForgotPage />} />
      <Route path="login" element={<UserPages.LoginPage />} />
      <Route path="register" element={<UserPages.RegisterPage />} />
      <Route path="reset" element={<UserPages.ResetPage />} />
      <Route path="*" element={<Navigate to="login" />} />
    </Routes>);
};
UserPage.displayName = "UserPage";

export default UserPage;