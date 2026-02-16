import {
  DefaultButton, Dialog, DialogContent, DialogFooter, DocumentCard, DocumentCardPreview, DocumentCardStatus,
  DocumentCardTitle, DocumentCardType,
  IDialogContentProps,
  IDocumentCardPreviewProps,
  IDocumentCardProps
} from "@fluentui/react";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrampContext } from "../../contexts";
import { ISinger, ISticker, StickerStatus } from "../../helpers/GraphQL";

interface IStickerCardProps extends IDocumentCardProps {
  other: ISinger;
  sticker: ISticker;
}

const StickerCard = ({ other, sticker, ...props }: IStickerCardProps) => {
  const { onClick } = useContext(TrampContext);
  const { family_name, given_name, preferred_name } = other ?? {};
  const { recipient, sender, status, id: sticker_id } = sticker ?? {};
  const iconNames = useMemo<Record<StickerStatus, string>>(
    () => ({
      "accepted": "Emoji",
      "declined": "SchoolDataSyncLogo",
      "received": "Chat",
      "sent": "Chat",
      "send": "SeeDo"
    }),
    []
  );
  const [isDialogOpen, setDialogOpen] = useState(false);
  const defaultAction = useMemo<Partial<Record<StickerStatus, string>>>(
    () => ({ "received": "accept", "send": "send", "sent": "delete" }),
    []
  );
  const secondaryAction = useMemo<Partial<Record<StickerStatus, string>>>(
    () => ({ "received": "decline", "send": "cancel", "sent": "cancel" }),
    []
  );
  const dialogContentProps = useMemo<IDialogContentProps>(
    () => ({ title: `${preferred_name ?? given_name} ${family_name}` }),
    [family_name, given_name, preferred_name]
  );
  const propsPreview = useMemo<IDocumentCardPreviewProps>(
    () => ({
      previewImages: [{ previewIconProps: { iconName: iconNames[status] ?? iconNames["undefined"], } }],
      styles: { root: { background: "transparent" } }
    }),
    [iconNames, status]
  );
  const onDismiss = useCallback(() => (setDialogOpen(false)), [setDialogOpen]);
  const handleButtonClick = useCallback(
    (action: string) => () => (onClick[action]?.({ id: sticker_id, recipient, sender }), onDismiss()),
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
