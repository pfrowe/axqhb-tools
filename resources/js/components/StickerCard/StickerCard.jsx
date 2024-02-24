import { DocumentCard, DocumentCardPreview, DocumentCardTitle, DocumentCardType, merge } from "@fluentui/react";
import { useMemo } from "react";

const StickerCard = ({ family_name, given_name, onClick, status, ...props }) => {
  const iconNames = useMemo(() => ({
    "accepted": "Emoji",
    "declined": "SchoolDataSyncLogo",
    "pending": "Chat",
    "undefined": "SeeDo"
  }));
  const propsPreview = {
    previewImages: [
      {
        previewIconProps: {
          iconName: iconNames[status ?? "undefined"],
          styles: { root: { fontSize: "24pt" } }
        },
        width: 36
      }
    ],
    styles: { root: { background: "transparent" } }
  };
  const stylesDefault = {
    root: {
      maxWidth: "calc((1280px - 6em) / 5)"
    }
  };
  return (
    <DocumentCard
      className="flex-align--center flex-justify--center"
      {...props}
      onClick={onClick}
      styles={merge(stylesDefault, props?.styles)}
      type={DocumentCardType.compact}>
      <DocumentCardPreview {...propsPreview}></DocumentCardPreview>
      <DocumentCardTitle title={`${given_name} ${family_name}`} />
    </DocumentCard>
  );
};
StickerCard.displayName = "StickerCard";

export default StickerCard;