import { useMachine } from "@xstate/react";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RalliesPage as machineDefinition } from "./Machines";
import RallyCard from "../components/RallyCard";
import { AppContext } from "../contexts";

const RalliesPage = () => {
  const { setTitle } = useContext(AppContext);
  const { t } = useTranslation("rallies");
  useEffect(() => (setTitle(t("title")) && undefined), [setTitle, t]);
  const [{ context }] = useMachine(machineDefinition);
  const mapRallyCard = ({ id, ...rally }) =>
  (<RallyCard
    {...rally}
    href={`/rally/${id}`}
    key={`rally-card--${id}`}
  />);
  return (<main id="main">
    <h1 style={{ textAlign: "center" }}>{t("title")}</h1>
    <h2 style={{ textAlign: "center" }}>{t("subtitle")}</h2>
    {context.rallies.map(mapRallyCard)}
  </main>);
};
RalliesPage.displayName = "RalliesPage";

export default RalliesPage;