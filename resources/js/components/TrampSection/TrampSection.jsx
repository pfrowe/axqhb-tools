import { useMemo } from "react";
import StickerCard from "../StickerCard";
import CONSTANTS from "../../app.constants";
import { useToggle } from "@react-hooks-library/core";

import styles from "./TrampSection.module.scss";

const TrampSection = ({ onClick, singer, singers, stickers_received, stickers_sent, voice_part }) => {
  const { bool: isCollapsed, toggle: toggleCollapsed } = useToggle(false);
  const headerText = useMemo(
    () => (`${voice_part.slice(0, 1).toUpperCase()}${voice_part.slice(1).toLowerCase()}`),
    [voice_part]
  );
  const mapStickerCard = ({ singer, unique_id }) => {
    const filterOthers = ({ recipient, sender }) =>
      (~[recipient?.unique_id, sender?.unique_id].indexOf(unique_id));
    const handleClick = (sticker) => () => {
      const action = {
        "accepted": "accepted",
        "declined": "send",
        "received": "respond",
        "sent": "status",
        "undefined": "send"
      }[sticker?.status ?? "undefined"];
      onClick?.({ action, id: sticker?.id, sender: singer, recipient: singerOther });
    };
    const sortStickers = (left, right) => (new Date(right.updated_at).valueOf() - new Date(left.updated_at).valueOf());
    const stickerLatest =
      ([...(stickers_received ?? []), ...(stickers_sent ?? [])].filter(filterOthers).sort(sortStickers).pop());
    if (stickerLatest?.status === "pending") {
      stickerLatest.status = (stickerLatest.recipient?.unique_id === singer?.unique_id) ? "received" : "sent";
    }
    return (
      <StickerCard
        {...singer}
        className={`${stickerLatest?.status} ${voice_part}`}
        key={`singer-card--${unique_id}`}
        onClick={handleClick(stickerLatest)}
        status={stickerLatest?.status} />
    );
  };
  const singersPart = useMemo(
    () => {
      const filterSticker = ({ is_guest_singer, voice_part: partTest }) =>
        (voice_part === (is_guest_singer ? CONSTANTS.partGuest : partTest));
      return singers.filter(filterSticker);
    },
    [singers, voice_part]
  );
  return ((singer != null) && singersPart.length)
    ? (<section key={`section--${voice_part}`}>
      <button className={[styles.trampSection, styles[voice_part]].join(" ")} onClick={toggleCollapsed} type="button">
        <h2 className={isCollapsed ? styles.collapsed : styles.expanded}>{headerText}</h2>
      </button>
      <div className={[styles.trampPanel, isCollapsed ? styles.collapsed : styles.expanded].join(" ")}>
        {singersPart.map(mapStickerCard)}
      </div>
    </section>)
    : (<></>);
};
TrampSection.displayName = "TrampSection";

export default TrampSection;