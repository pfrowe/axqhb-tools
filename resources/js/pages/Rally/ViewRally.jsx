import { useMachine } from "@xstate/react";
import { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ViewRally as machineDefinition } from "../Machines";
import CONSTANTS from "../../app.constants";
import SingerCard from "../../components/SingerCard/SingerCard";
import { AppContext } from "../../contexts";

import styles from "./Rally.module.scss";

const ViewRally = () => {
  const { setTitle } = useContext(AppContext);
  const { id } = useParams();
  const { t } = useTranslation("rally");
  const [{ context }, send] = useMachine(machineDefinition, { devTools: true });
  useEffect(
    () => (setTitle(t("title.view", { rally: context.rally?.name })) && undefined),
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
    <h1 className={styles["text-align--center"]}>{t("title.view", { rally: context.rally?.name })}</h1>
    <h2 className={styles["text-align--center"]}>{t("subtitle.view")}</h2>
    <div className={styles["flex-align--right"]}>
      <Link className={styles.buttonLink} to={`/leaderboard/view/${id}`}>{t("links.leaderboard")}</Link>
    </div>
    {context.show?.rally
      ? (
        <div className={styles["danceCardContainer"]}>
          {(context.rally?.singers ?? []).sort(sortSingers).map(mapDanceCard)}
        </div>
      ) : (<></>)
    }
  </main>);
};
ViewRally.displayName = "ViewRally";

export default ViewRally;