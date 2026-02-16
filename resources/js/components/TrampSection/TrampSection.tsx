import { useToggle } from "@react-hooks-library/core";
import { useContext, useMemo } from "react";
import StickerCard from "../StickerCard";
import CONSTANTS from "../../app.constants";
import { TrampContext } from "../../contexts";

import styles from "./TrampSection.module.scss";

const TrampSection = ({ singers, stickers_received, stickers_sent, voice_part }: any) => {
  const { self } = useContext(TrampContext);
  const { bool: isCollapsed, toggle: toggleCollapsed } = useToggle(false);
  const headerText = useMemo(
    () => (`${voice_part.slice(0, 1).toUpperCase()}${voice_part.slice(1).toLowerCase()}`),
    [voice_part]
  );
  const mapStickerCard = ({ id, singer: other, unique_id }: any) => {
    const filterOthers = ({ recipient, sender }: any) =>
      (~[recipient?.unique_id, sender?.unique_id].indexOf(unique_id));
    const sortStickers = (left: any, right: any) => (new Date(right.updated_at).valueOf() - new Date(left.updated_at).valueOf());
    const sticker =
      ([...(stickers_received ?? []), ...(stickers_sent ?? [])].filter(filterOthers).sort(sortStickers).pop())
      ?? { recipient: id, sender: self.id, status: "send" };
    if (sticker?.status === "pending") {
      sticker.status = (sticker.recipient?.unique_id === unique_id) ? "sent" : "received";
    }
    return (<div key={`sticker-wrapper--${unique_id}`}>
      <StickerCard
        {...{ other, sticker }}
        className={`${sticker?.status} ${voice_part}`}
        key={`singer-card--${unique_id}`}
      />
    </div>
    );
  };
  const singersPart = useMemo(
    () => {
      const filterSticker = ({ is_guest_singer, voice_part: partTest }: any) =>
        (voice_part === (is_guest_singer ? CONSTANTS.partGuest : partTest));
      return singers.filter(filterSticker);
    },
    [singers, voice_part]
  );
  return ((self != null) && singersPart.length)
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
