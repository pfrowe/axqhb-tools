import { Navigate, Route, Routes } from "react-router-dom";
import * as LeaderboardPages from "./Leaderboard";

const LeaderboardPage = () => {
  return (<Routes>
    <Route path="/" element={<Navigate to="/leaderboards" />} />
    <Route path="view/:id" element={<LeaderboardPages.ViewLeaderboard />} />
  </Routes>);
};
LeaderboardPage.displayName = "LeaderboardPage";

export default LeaderboardPage;
