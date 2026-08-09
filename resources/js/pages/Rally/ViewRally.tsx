import { ArrowDownload20Regular, Edit20Regular, PeopleAdd20Regular, Trophy20Regular } from "@fluentui/react-icons";
import { useMachine } from "@xstate/react";
import { useCallback, useContext, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { ViewRally as machineDefinition } from "../Machines";
import CONSTANTS from "../../app.constants";
import ActionOverflowMenu from "../../components/ActionOverflowMenu";
import SingerCard from "../../components/SingerCard";
import { AppContext } from "../../contexts";
import { IRallySinger } from "../../helpers/GraphQL";

import styles from "./Rally.module.scss";

const ViewRally = () => {
  const { setTitle } = useContext(AppContext);
  const { id } = useParams();
  const { t } = useTranslation("rally");
  const [{ context }, send] = useMachine(machineDefinition);
  useEffect(
    () => (setTitle(t("title.view", { rally: context.rally?.name })), undefined),
    [context.rally?.name, setTitle, t]
  );
  useEffect(() => (send({ type: "INIT", id }), undefined), [id]);
  const mapDanceCard = ({ is_guest_singer, singer, unique_id, voice_part }: IRallySinger) => (
    <SingerCard
      {...singer}
      href={`/card/${unique_id}`}
      key={`singer-card--${unique_id}`}
      voice_part={is_guest_singer ? CONSTANTS.partGuest : voice_part} />
  );
  const sortSingers = useCallback(
    (left: IRallySinger, right: IRallySinger) => {
      const partLeft = left.is_guest_singer ? CONSTANTS.partGuest : left.voice_part;
      const partRight = right.is_guest_singer ? CONSTANTS.partGuest : right.voice_part;
      const nameLeft = left.singer.preferred_name ?? left.singer.given_name;
      const nameRight = right.singer.preferred_name ?? right.singer.given_name;
      return (CONSTANTS.parts.indexOf(partLeft) - CONSTANTS.parts.indexOf(partRight)) ||
        left.singer.family_name.localeCompare(right.singer.family_name) ||
        nameLeft.localeCompare(nameRight);
    },
    []
  );
  const exportSingers = useCallback(
    () => {
      const mapFlatSinger = (card: IRallySinger) => {
        const { is_guest_singer, unique_id, voice_part } = card;
        const {
          can_receive_texts, city, country, email, family_name, geo_division_1: state, given_name, image, phone,
          postal_code, preferred_name, street_line_1, street_line_2
        } = card.singer;
        return {
          can_receive_texts, city, country, email, family_name, given_name, image, is_guest_singer, phone, postal_code,
          preferred_name, geo_division_1: state, street_line_1, street_line_2, unique_id, voice_part,
          url: `${window.location.origin}/card/${card.unique_id}`,
        };
      }
      const singers = ((context.rally?.singers ?? []) as IRallySinger[])?.map(mapFlatSinger) ?? [];
      const dateString = new Date().toISOString().split("T")[0];
      const xlsBook = XLSX.utils.book_new();
      const xlsSheet = XLSX.utils.json_to_sheet(singers);
      XLSX.utils.book_append_sheet(xlsBook, xlsSheet, "Singers");
      XLSX.writeFile(xlsBook, `${context.rally?.name ?? "rally"} Singers ${dateString}.xlsx`);
    },
    [context.rally?.name, context.rally?.singers]
  );
  const actionItems = useMemo(
    () => ([
      {
        key: "edit",
        icon: <Edit20Regular className={styles["margin-right--0_5em"]} />,
        text: t("links.editRally"),
        to: `/rally/edit/${id}`,
      },
      {
        key: "populate",
        icon: <PeopleAdd20Regular className={styles["margin-right--0_5em"]} />,
        text: t("links.populateSingers"),
        to: `/rally/populate/${id}`,
      },
      {
        key: "export",
        icon: <ArrowDownload20Regular className={styles["margin-right--0_5em"]} />,
        text: t("links.exportSingers"),
        onClick: exportSingers,
      },
      {
        key: "leaderboard",
        icon: <Trophy20Regular className={styles["margin-right--0_5em"]} />,
        text: t("links.leaderboard"),
        to: `/leaderboard/view/${id}`,
      },
    ]),
    [id, exportSingers, t]
  );
  return (<main id="main">
    <h1 className={[styles["text-align--center"], styles["margin--revert"]].join(" ")}>
      {t("title.view", { rally: context.rally?.name })}
    </h1>
    <h2 className={[styles["text-align--center"], styles["margin--revert"]].join(" ")}>
      {t("subtitle.view")}
    </h2>
    <ActionOverflowMenu items={actionItems} menuAriaLabel={t("links.actions") || "Actions"} />
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
