import {
  DefaultButton, Dialog, DialogContent, DialogFooter, DocumentCard, DocumentCardPreview, DocumentCardStatus,
  DocumentCardTitle, DocumentCardType
} from "@fluentui/react";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrampContext } from "../../contexts";

const StickerCard = ({ other, sticker, ...props }) => {
  const { onClick } = useContext(TrampContext);
  const { family_name, given_name, preferred_name } = other ?? {};
  const { recipient, sender, status, id: sticker_id } = sticker ?? {};
  const iconNames = useMemo(() => ({
    "accepted": "Emoji",
    "declined": "SchoolDataSyncLogo",
    "received": "Chat",
    "sent": "Chat",
    "send": "SeeDo"
  }));
  const [isDialogOpen, setDialogOpen] = useState(false);
  const defaultAction = useMemo(() => ({ "received": "accept", "send": "send", "sent": "delete" }), []);
  const secondaryAction = useMemo(() => ({ "received": "decline", "send": "cancel", "sent": "cancel" }), []);
  const dialogContentProps = useMemo(
    () => ({ title: `${preferred_name ?? given_name} ${family_name}` }),
    [family_name, given_name, preferred_name]
  );
  const propsPreview = useMemo(
    () => ({
      previewImages: [{ previewIconProps: { iconName: iconNames[status] ?? iconNames["undefined"], } }],
      styles: { root: { background: "transparent" } }
    }),
    [iconNames, status]
  );
  const onDismiss = useCallback(() => (setDialogOpen(false)), [setDialogOpen]);
  const handleButtonClick = useCallback(
    (action) => () => (onClick[action]?.({ id: sticker_id, recipient, sender }), onDismiss()),
    [onClick, onDismiss]
  );
  const handleCardClick = useCallback(() => (setDialogOpen(true)), [setDialogOpen]);
  const { t } = useTranslation("tramp");
  return (<>
    <DocumentCard
      {...props}
      className={`flex-align--center flex-justify--center sticker ${props?.className}`}
      onClick={handleCardClick}
      type={DocumentCardType.compact}>
      <DocumentCardPreview {...propsPreview}></DocumentCardPreview>
      <div className="flex--vertical">
        <DocumentCardTitle title={`${preferred_name ?? given_name} ${family_name}`} />
        <DocumentCardStatus status={t(`status.${status}`)} styles={{ root: { background: "transparent" } }} />
      </div>
    </DocumentCard>
    <Dialog dialogContentProps={dialogContentProps} hidden={!isDialogOpen} onDismiss={onDismiss}>
      <DialogContent>
        {t(`dialog.${status}`, { other: `${preferred_name ?? given_name} ${family_name}` })}
      </DialogContent>
      {
        defaultAction[status] == null
          ? (<></>)
          : (<DialogFooter>
            <DefaultButton
              text={t(`buttons.${status}.no`)}
              onClick={handleButtonClick(secondaryAction[status])} />
            <DefaultButton
              primary
              text={t(`buttons.${status}.yes`)}
              onClick={handleButtonClick(defaultAction[status])} />
          </DialogFooter>)
      }
    </Dialog>
  </>);
};
StickerCard.displayName = "StickerCard";

export default StickerCard;