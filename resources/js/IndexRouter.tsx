import React, { Suspense, useCallback } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

const IndexRouter = () => {
  const { user } = useAuth();
  const Loading = useCallback(() => <div>Loading...</div>, []);
  let result;
  if (user === undefined) {
    const TrampPage = React.lazy(() => import("./pages/TrampPage"));
    const UserPage = React.lazy(() => import("./pages/UserPage"));
    result = (<Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/user/login" />} />
        <Route path="/card/:unique_id" element={<TrampPage />} />
        <Route path="/user/*" element={<UserPage />} />
      </Routes>
    </Suspense>);
  } else {
    const HomePage = React.lazy(() => import("./pages/HomePage"));
    const LeaderboardPage = React.lazy(() => import("./pages/LeaderboardPage"));
    const RalliesPage = React.lazy(() => import("./pages/RalliesPage"));
    const RallyPage = React.lazy(() => import("./pages/RallyPage"));
    const SingersPage = React.lazy(() => import("./pages/SingersPage"));
    const TrampPage = React.lazy(() => import("./pages/TrampPage"));
    const UserPage = React.lazy(() => import("./pages/UserPage"));
    result = (<Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leaderboard/*" element={<LeaderboardPage />} />
        <Route path="/rallies/*" element={<RalliesPage />} />
        <Route path="/rally/*" element={<RallyPage />} />
        <Route path="/singers/*" element={<SingersPage />} />
        <Route path="/card/:unique_id" element={<TrampPage />} />
        <Route path="/user/*" element={<UserPage />} />
      </Routes>
    </Suspense>);
  }
  return result;
};
IndexRouter.displayName = "IndexRouter";

export default IndexRouter;