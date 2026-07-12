import { useMachine } from "@xstate/react";
import { useContext, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RalliesPage as machineDefinition } from "./Machines";
import RallyCard from "../components/RallyCard";
import { AppContext } from "../contexts";

import "../../css/rallies.css";
import { IRally } from "../helpers/GraphQL";

const RalliesPage = () => {
  const { setTitle } = useContext(AppContext);
  const { t } = useTranslation("rallies");
  useEffect(() => (setTitle(t("title")), undefined), [setTitle, t]);
  const [{ context }] = useMachine(machineDefinition);
  const mapRallyCard = ({ id, ...rally }: any) =>
    (<RallyCard {...rally} href={(id > 0) ? `/rally/view/${id}` : `/rally/edit/0`} key={`rally-card--${id}`} />);
  const sortedRallies = useMemo(
    () => {
      const sortRallies = (left: IRally, right: IRally) => {
        const leftDate = new Date(left.start_date);
        const rightDate = new Date(right.start_date);
        return rightDate.getTime() - leftDate.getTime();
      };
      return context.rallies.sort(sortRallies);
    },
    [context.rallies]
  );
  return (<main id="main">
    <h1 style={{ textAlign: "center" }}>{t("title")}</h1>
    <h2 style={{ textAlign: "center" }}>{t("subtitle")}</h2>
    <section className="rallies--section">
      {mapRallyCard({ id: "0", image_url: "/images/axqhb_logo.png", name: t("label.create") })}
      {sortedRallies.map(mapRallyCard)}
    </section>
  </main>);
};
RalliesPage.displayName = "RalliesPage";

export default RalliesPage;
