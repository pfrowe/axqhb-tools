import StickerCard from "../StickerCard";

const TrampSection = ({ onClick, singer, singers, voice_part }) => {
  const filterSticker = ({ voice_part: partTest }) => (partTest === voice_part);
  const mapStickerCard = ({ unique_id, voice_part, ...singerOther }) => {
    const filterForThisSinger = ({ recipient, sender }) =>
      (~[recipient?.unique_id, sender?.unique_id].indexOf(unique_id));
    const handleClick = (sticker) => () => {
      const action = {
        "accepted": "accepted",
        "declined": "send",
        "pending": (sticker?.recipient?.unique_id === unique_id) ? "respond" : "status",
        "undefined": "send"
      }[sticker?.status ?? "undefined"];
      onClick?.({ action, sender: singer, recipient: singerOther });
    };
    const sortStickers = (left, right) => (new Date(right.updated_at).valueOf() - new Date(left.updated_at).valueOf());
    const { stickers_received, stickers_sent } = singer;
    const stickerLatest =
      [...(stickers_received ?? []), ...(stickers_sent ?? [])].filter(filterForThisSinger).sort(sortStickers).pop();
    const styles = {
      root: {
        backgroundColor: `var(--color-voice-background--${voice_part})`,
        borderColor: `brightness(var(--color-voice-background--${voice_part}), -.5)`,
        borderStyle: "solid",
        borderWidth: "1px"
      }
    }
    return (
      <StickerCard
        {...{ ...singerOther, styles, voice_part }}
        key={`singer-card--${unique_id}`}
        onClick={handleClick(stickerLatest)}
        status={stickerLatest?.status} />
    );
  };
  const singersPart = singers.filter(filterSticker);
  return singersPart.length
    ? (<section key={`section--${voice_part}`}>
      <h3>
        {`${voice_part.slice(0, 1).toUpperCase()}${voice_part.slice(1).toLowerCase()}`}
      </h3>
      <div
        className="display--flex flex--horizontal flex-align--center"
        style={{ marginBottom: "2em", marginTop: "2em", paddingLeft: "1em" }}>
        {singersPart.map(mapStickerCard)}
      </div>
    </section>)
    : (<></>);
};
TrampSection.displayName = "TrampSection";

export default TrampSection;