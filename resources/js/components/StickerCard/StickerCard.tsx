import * as Fluent from "@fluentui/react-components";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrampContext } from "../../contexts";
import { ISinger, ISticker, StickerStatus } from "../../helpers/GraphQL";

interface IStickerCardProps {
  other: ISinger;
  sticker: ISticker;
  [key: string]: any;
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
  const dialogContentProps = useMemo<Fluent.DialogContentProps>(
    () => ({ title: `${preferred_name ?? given_name} ${family_name}` }),
    [family_name, given_name, preferred_name]
  );
  const propsPreview = useMemo<any>(
    () => ({
      previewImages: [{ previewIconProps: { iconName: iconNames[status] ?? iconNames["undefined"], } }],
      styles: { root: { background: "transparent" } }
    }),
    [iconNames, status]
  );
  const onDismiss = useCallback(() => (setDialogOpen(false)), [setDialogOpen]);
  const handleButtonClick = useCallback(
    (action: string) => () => (onClick[action]?.({ id: sticker_id, recipient, sender }), onDismiss()),
    [onClick, onDismiss, recipient, sender, sticker_id]
  );
  const handleCardClick = useCallback(() => (setDialogOpen(true)), [setDialogOpen]);
  const { t } = useTranslation("tramp");
  return (<>
    <Fluent.Card
      {...props}
      className={`flex-align--center flex-justify--center sticker ${props?.className}`}
      onClick={handleCardClick}
      size="small"
    >
      <Fluent.CardPreview {...propsPreview}></Fluent.CardPreview>
      <div className="flex--vertical">
        <Fluent.CardHeader title={`${preferred_name ?? given_name} ${family_name}`} />
        <Fluent.CardFooter style={{ background: "transparent" }}>{t(`status.${status}`)}</Fluent.CardFooter>
      </div>
    </Fluent.Card>
    <Fluent.Dialog open={isDialogOpen} onOpenChange={(_, { open }) => setDialogOpen(open)}>
      <Fluent.DialogSurface>
        <Fluent.DialogContent {...dialogContentProps}>
          {t(`dialog.${status}`, { other: `${preferred_name ?? given_name} ${family_name}` })}
        </Fluent.DialogContent>
        {
          defaultAction[status] == null
            ? (<></>)
            : (<Fluent.DialogActions>
              <Fluent.Button
                appearance="secondary"
                onClick={handleButtonClick(secondaryAction[status])}
              >
                {t(`buttons.${status}.no`)}
              </Fluent.Button>
              <Fluent.Button
                appearance="primary"
                onClick={handleButtonClick(defaultAction[status])}
              >
                {t(`buttons.${status}.yes`)}
              </Fluent.Button>
            </Fluent.DialogActions>)
        }
      </Fluent.DialogSurface>
    </Fluent.Dialog>
  </>);
};
StickerCard.displayName = "StickerCard";

export default StickerCard;
