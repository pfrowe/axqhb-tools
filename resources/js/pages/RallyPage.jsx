import { useMachine } from "@xstate/react";
import { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { RallyPage as machineDefinition } from "./Machines";
import CONSTANTS from "../app.constants";
import SingerCard from "../components/SingerCard/SingerCard";
import { AppContext } from "../contexts";

const RallyPage = () => {
  const { setTitle } = useContext(AppContext);
  const { id } = useParams();
  const { t } = useTranslation("rally");
  const [{ context }, send] = useMachine(machineDefinition);
  useEffect(
    () => (setTitle(t("title", { rally: context.rally?.name })) && undefined),
    [context.rally?.name, setTitle, t]
  );
  useEffect(() => (send({ type: "INIT", id }) && undefined), [id]);
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
    <h1 style={{ textAlign: "center" }}>{t("title", { rally: context.rally?.name })}</h1>
    <h2 style={{ textAlign: "center" }}>{t("subtitle")}</h2>
    {context.show?.rally
      ? (
        <div
          className="display--flex flex--horizontal flex-align--center"
          style={{ marginTop: "2em", paddingLeft: "1em" }}>
          {(context.rally?.singers ?? []).sort(sortSingers).map(mapDanceCard)}
        </div>
      ) : (<></>)
    }
  </main>);
};
RallyPage.displayName = "RallyPage";

export default RallyPage;