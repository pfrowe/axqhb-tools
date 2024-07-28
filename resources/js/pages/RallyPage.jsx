import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { assign, fromPromise, setup } from "xstate";
import { useMachine } from "@xstate/react";
import CONSTANTS from "../app.constants";
import SingerCard from "../components/SingerCard/SingerCard";

const RallyPage = () => {
  const { id } = useParams();
  const { t } = useTranslation("rally");
  const getRally = useCallback(
    async () => {
      const query = `query($id: ID) {
        rally(id: $id) {
          image_url
          name
          start_date
          stop_date
          singers {
            unique_id
            singer {
              family_name
              given_name
              is_guest_singer
              preferred_name
              voice_part
            }
          }
        }
      }`;
      const variables = { id };
      const optionsFetch = {
        body: JSON.stringify({ query, variables }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      return (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.rally;
    },
    [id]
  );
  const machineDefinition = useMemo(
    () => (setup({ actors: { getRally: fromPromise(getRally) } })
      .createMachine({
        context: {
          rally: {},
          show: { singers: false }
        },
        initial: "loading",
        states: {
          loading: {
            invoke: {
              id: "getRally",
              src: "getRally",
              onDone: {
                actions: [assign({ rally: ({ event }) => (event.output) })],
                target: "ready"
              }
            }
          },
          ready: {
            entry: [assign({ show: { rally: true } })],
            type: "final"
          }
        }
      })
    ),
    [getRally]
  );
  const [{ context }] = useMachine(machineDefinition);
  const mapDanceCard = ({ unique_id, singer }) => (
    <SingerCard
      {...singer}
      className={singer.is_guest_singer ? CONSTANTS.partGuest : singer.voice_part}
      href={`/card/${unique_id}`}
      key={`singer-card--${unique_id}`} />
  );
  const sortSingers = useCallback(
    (left, right) => {
      const partLeft = left.singer.is_guest_singer ? CONSTANTS.partGuest : left.singer.voice_part;
      const partRight = right.singer.is_guest_singer ? CONSTANTS.partGuest : right.singer.voice_part;
      const nameLeft = left.singer.preferred_name ?? left.singer.given_name;
      const nameRight = right.singer.preferred_name ?? right.singer.given_name;
      return (CONSTANTS.parts.indexOf(partLeft) - CONSTANTS.parts.indexOf(partRight)) ||
        left.singer.family_name.localeCompare(right.singer.family_name) ||
        nameLeft.localeCompare(nameRight);
    },
    []
  );
  return (<main id="main">
    <h1 style={{ textAlign: "center" }}>{t("title", { rally: context.rally.name })}</h1>
    <h2 style={{ textAlign: "center" }}>{t("subtitle")}</h2>
    {context.show.rally
      ? (
        <div
          className="display--flex flex--horizontal flex-align--center"
          style={{ marginTop: "2em", paddingLeft: "1em" }}>
          {context.rally.singers.sort(sortSingers).map(mapDanceCard)}
        </div>
      ) : (<></>)
    }
  </main>);
};
RallyPage.displayName = "RallyPage";

export default RallyPage;