import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import * as RallyPages from "./Rally";

const RallyPage = () => {
  return (<Routes>
    <Route exact path="/" element={<Navigate to="/rallies" />} />
    <Route path="edit/:id" element={<RallyPages.EditRally />} />
    <Route path="view/:id" element={<RallyPages.ViewRally />} />
  </Routes>);
};
RallyPage.displayName = "RallyPage";

export default RallyPage;