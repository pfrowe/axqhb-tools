import { useMachine } from "@xstate/react";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RalliesPage as machineDefinition } from "./Machines";
import RallyCard from "../components/RallyCard";
import { AppContext } from "../contexts";

import "../../css/rallies.css";

const RalliesPage = () => {
  const { setTitle } = useContext(AppContext);
  const { t } = useTranslation("rallies");
  useEffect(() => (setTitle(t("title")), undefined), [setTitle, t]);
  const [{ context }] = useMachine(machineDefinition);
  const mapRallyCard = ({ id, ...rally }: any) =>
    (<RallyCard {...rally} href={(id > 0) ? `/rally/view/${id}` : `/rally/edit/0`} key={`rally-card--${id}`} />);
  return (<main id="main">
    <h1 style={{ textAlign: "center" }}>{t("title")}</h1>
    <h2 style={{ textAlign: "center" }}>{t("subtitle")}</h2>
    <section className="rallies--section">
      {mapRallyCard({ id: "0", image_url: "/images/axqhb_logo.png", name: t("label.create") })}
      {context.rallies.map(mapRallyCard)}
    </section>
  </main>);
};
RalliesPage.displayName = "RalliesPage";

export default RalliesPage;
