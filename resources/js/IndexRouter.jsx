import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { HomePage, LeaderboardPage, RalliesPage, RallyPage, SingersPage, TrampPage, UserPage } from "./pages";

const IndexRouter = () => {
  const { user } = useAuth();
  return user
    ? (<Routes>
      <Route exact path="/" element={<HomePage />} />
      <Route path="/leaderboard/*" element={<LeaderboardPage />} />
      <Route path="/rallies/*" element={<RalliesPage />} />
      <Route path="/rally/:id" element={<RallyPage />} />
      <Route path="/singers/*" element={<SingersPage />} />
      <Route path="/card/:unique_id" element={<TrampPage />} />
      <Route path="/user/*" element={<UserPage />} />
    </Routes>)
    : (<Routes>
      <Route exact path="/" element={<Navigate to="/user/login" />} />
      <Route path="/card/:unique_id" element={<TrampPage />} />
      <Route path="/user/*" element={<UserPage />} />
    </Routes>);
};
IndexRouter.displayName = "IndexRouter";

export default IndexRouter;