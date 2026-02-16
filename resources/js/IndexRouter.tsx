import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { HomePage, LeaderboardPage, RalliesPage, RallyPage, SingersPage, TrampPage, UserPage } from "./pages";

const IndexRouter = () => {
  const { user } = useAuth();
  return user
    ? (<Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/leaderboard/*" element={<LeaderboardPage />} />
      <Route path="/rallies/*" element={<RalliesPage />} />
      <Route path="/rally/*" element={<RallyPage />} />
      <Route path="/singers/*" element={<SingersPage />} />
      <Route path="/card/:unique_id" element={<TrampPage />} />
      <Route path="/user/*" element={<UserPage />} />
    </Routes>)
    : (<Routes>
      <Route path="/" element={<Navigate to="/user/login" />} />
      <Route path="/card/:unique_id" element={<TrampPage />} />
      <Route path="/user/*" element={<UserPage />} />
    </Routes>);
};
IndexRouter.displayName = "IndexRouter";

export default IndexRouter;