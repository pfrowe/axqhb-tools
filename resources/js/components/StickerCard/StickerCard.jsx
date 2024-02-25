import { DocumentCard, DocumentCardPreview, DocumentCardStatus, DocumentCardTitle, DocumentCardType } from "@fluentui/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const StickerCard = ({ family_name, given_name, onClick, status, ...props }) => {
  const iconNames = useMemo(() => ({
    "accepted": "Emoji",
    "declined": "SchoolDataSyncLogo",
    "received": "Chat",
    "sent": "Chat",
    "undefined": "SeeDo"
  }));
  const propsPreview = {
    previewImages: [
      {
        previewIconProps: {
          iconName: iconNames[status ?? "undefined"],
        }
      }
    ],
    styles: { root: { background: "transparent" } }
  };
  const { t } = useTranslation("tramp");
  return (
    <DocumentCard
      className={`flex-align--center flex-justify--center sticker ${props?.className}`}
      {...props}
      onClick={onClick}
      type={DocumentCardType.compact}>
      <DocumentCardPreview {...propsPreview}></DocumentCardPreview>
      <div className="flex--vertical">
        <DocumentCardTitle title={`${given_name} ${family_name}`} />
        <DocumentCardStatus status={t(`status.${status}`)} styles={{ root: { background: "transparent" } }} />
      </div>
    </DocumentCard>
  );
};
StickerCard.displayName = "StickerCard";

export default StickerCard;