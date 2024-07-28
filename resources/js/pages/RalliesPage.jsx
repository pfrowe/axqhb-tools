import { useTranslation } from "react-i18next";
import { assign, fromPromise, setup } from "xstate";
import { useMachine } from "@xstate/react";
import CONSTANTS from "../app.constants";
import RallyCard from "../components/RallyCard";

const getRallies = async () => {
  const sortRallies = (left, right) => {
    return (new Date(left.start_date) - new Date(right.start_date)) ||
      (new Date(left.stop_date) - new Date(right.stop_date)) ||
      (left.name || "").localeCompare(right.name || "");
  };
  const bodyText = `query {
    rallies {
      id
      image_url
      name
      start_date
      stop_date
    }
  }`;
  const optionsFetch = {
    body: JSON.stringify({ query: bodyText }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  return (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.rallies.sort(sortRallies);
};

const machineDefinition = setup({
  actors: {
    getRallies: fromPromise(getRallies)
  }
}).createMachine({
  context: { rallies: [], show: { rallies: false } },
  initial: "loading",
  states: {
    loading: {
      invoke: {
        id: "getRallies",
        src: "getRallies",
        onDone: {
          actions: assign({ rallies: ({ event }) => (event.output) }),
          target: "ready"
        }
      }
    },
    ready: {
      entry: [assign({ show: { rallies: true } })],
      type: "final"
    }
  }
});

const RalliesPage = () => {
  const { t } = useTranslation("rallies");
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