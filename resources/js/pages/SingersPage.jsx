import { useTranslation } from "react-i18next";
import CONSTANTS from "../app.constants";
import SingerCard from "../components/SingerCard/SingerCard";
import { assign, fromPromise, setup } from "xstate";
import { useMachine } from "@xstate/react";

const getSingers = async () => {
  const sortSingers = (left, right) => {
    const partLeft = left.is_guest_singer ? CONSTANTS.partGuest : left.voice_part;
    const partRight = right.is_guest_singer ? CONSTANTS.partGuest : right.voice_part;
    return (CONSTANTS.parts.indexOf(partLeft) - CONSTANTS.parts.indexOf(partRight)) ||
      left.family_name.localeCompare(right.family_name) ||
      (left.preferred_name ?? left.given_name).localeCompare(right.preferred_name ?? right.given_name);
  };
  const bodyText = `query {
    singers {
      family_name
      given_name
      id
      is_guest_singer
      preferred_name
      voice_part
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
  return (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.singers.sort(sortSingers);
};

const machineDefinition = setup({
  actors: {
    getSingers: fromPromise(getSingers)
  }
}).createMachine({
  context: { singers: [], show: { singers: false } },
  initial: "loading",
  states: {
    loading: {
      invoke: {
        id: "getSingers",
        src: "getSingers",
        onDone: {
          actions: assign({ singers: ({ event }) => (event.output) }),
          target: "ready"
        }
      }
    },
    ready: {
      entry: [assign({ show: { singers: true } })],
      type: "final"
    }
  }
});

const SingersPage = () => {
  const { t } = useTranslation("singers");
  const [{ context }] = useMachine(machineDefinition);
  const mapSingerCard = ({ id, is_guest_singer, voice_part, ...singer }) => (
    <SingerCard
      {...{ ...singer, is_guest_singer, voice_part }}
      className={is_guest_singer ? CONSTANTS.partGuest : voice_part}
      href={`/singer/${id}`}
      key={`singer-card--${id}`} />
  );
  return (<main id="main">
    <h1 style={{ textAlign: "center" }}>{t("title")}</h1>
    <h2 style={{ textAlign: "center" }}>{t("subtitle")}</h2>
    {context.show.singers
      ? (
        <div
          className="display--flex flex--horizontal flex-align--center"
          style={{ marginTop: "2em", paddingLeft: "1em" }}>
          {context.singers.map(mapSingerCard)}
        </div>)
      : (<></>)
    }
  </main>);
};
SingersPage.displayName = "SingersPage";

export default SingersPage;