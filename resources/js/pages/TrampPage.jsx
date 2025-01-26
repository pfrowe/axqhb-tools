import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from "@fluentui/react";
import { useInterval } from "@react-hooks-library/core";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useMachine } from "@xstate/react";
import { TrampPage as machineDefinition } from "./Machines";
import CONSTANTS from "../app.constants";
import TrampSection from "../components/TrampSection";
import { AppContext } from "../contexts";

const TrampPage = () => {
  const { setTitle } = useContext(AppContext);
  const { unique_id } = useParams();
  const [{ context }, send] = useMachine(machineDefinition);
  useEffect(() => (send({ type: "INIT", unique_id }) && undefined), [send, unique_id]);
  const requestRefresh = useCallback(() => (send({ type: "refresh" })), [send]);
  useInterval(requestRefresh, CONSTANTS.pollInterval);
  const { t } = useTranslation("tramp");
  const [buttonProps, setButtonProps] = useState({});
  const [dialogProps, setDialogProps] = useState({ hidden: true });
  const iconStyles = useMemo(() => ({ root: { color: "white", fontSize: "48px", fontWeight: "bold" } }), []);
  const onCloseDialog = useCallback(() => (setDialogProps({ hidden: true })), [setDialogProps]);
  const handleClick = ({ action, id, recipient, sender }) => {
    const onClick_accept = () => () => {
      const query = `mutation($id: ID, $status: String) {
        updateSticker(id: $id, status: $status) {
          recipient_id
          sender_id
          status
        }
      }`;
      const variables = { id, status: "accepted" };
      const optionsFetch = {
        body: JSON.stringify({ query, variables }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      fetch(CONSTANTS.urlGraphQL, optionsFetch).then(onCloseDialog).then(requestRefresh).catch(requestRefresh);
    };
    const onClick_decline = () => () => {
      const query = `mutation($id: ID, $status: String) {
        updateSticker(id: $id, status: $status) {
          recipient_id
          sender_id
          status
        }
      }`;
      const variables = { id, status: "declined" };
      const optionsFetch = {
        body: JSON.stringify({ query, variables }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      fetch(CONSTANTS.urlGraphQL, optionsFetch).then(onCloseDialog).then(requestRefresh).catch(requestRefresh);
    };
    const onClick_send = ({ recipient, sender }) => {
      const query = `mutation($recipient: ID, $sender: ID, $status: String) {
        createSticker(recipient_id: $recipient, sender_id: $sender, status: $status) {
          recipient_id
          sender_id
          status
        }
      }`;
      const variables = { recipient: recipient.id, sender: sender.id, status: "pending" };
      const optionsFetch = {
        body: JSON.stringify({ query, variables }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      fetch(CONSTANTS.urlGraphQL, optionsFetch).then(requestRefresh).catch(requestRefresh);
    };
    const singerOther = recipient.unique_id === unique_id ? sender : recipient;
    const nameOther = `${singerOther.preferred_name ?? singerOther.given_name} ${singerOther.family_name}`;
    const title = {
      "accepted": t("dialog.accepted", { other: nameOther }),
      "respond": t("dialog.respond", { sender: nameOther }),
      "send": t("dialog.send", { recipient: nameOther }),
      "status": t("dialog.status", { recipient: nameOther })
    }[action ?? "send"];
    setButtonProps({ onAccept: onClick_accept({ id }), onDecline: onClick_decline({ id }) });
    if (action === "send") {
      onClick_send({ recipient, sender });
    }
    setDialogProps({
      dialogContentProps: { title },
      hidden: false,
      hiddenButtons: action !== "respond",
      modalProps: { isBlocking: true },
      onDismiss: onCloseDialog
    });
  };
  const onClickTrampSection = useCallback(
    handleClick,
    [onCloseDialog, requestRefresh, unique_id, setButtonProps, setDialogProps]
  );
  const mapSection = useCallback(
    (voice_part) => {
      const singers = context.data.singers;
      return (
        <TrampSection
          onClick={onClickTrampSection}
          {...{ ...(context.data?.card ?? {}), singers, voice_part }}
          key={`section--${voice_part}`} />
      );
    },
    [context.data]
  );
  const nameParts = useMemo(
    () => {
      const { family_name, given_name, preferred_name } = context.data.card.singer ?? {};
      return { family_name, given_name: given_name ?? preferred_name };
    },
    [context.data.card?.singer]
  );
  useEffect(() => (setTitle(t("name", nameParts)) && undefined), [nameParts, setTitle, t]);
  return (<main id="main">
    <h1 style={{ textAlign: "center" }}>{t("welcome")}</h1>
    <h2 style={{ textAlign: "center" }}>{t("name", nameParts)}</h2>
    {context.show?.card ? CONSTANTS.parts.map(mapSection) : (<></>)}
    <Dialog {...(dialogProps ?? {})}>
      <DialogFooter styles={{ actionsRight: { display: dialogProps.hiddenButtons ? "none" : "block" } }}>
        <PrimaryButton
          iconProps={{ iconName: "CheckMark", styles: iconStyles }}
          onClick={buttonProps.onAccept}
          style={{ backgroundColor: "#080", height: 64, width: 64 }} />
        <DefaultButton
          iconProps={{ iconName: "Cancel", styles: iconStyles }}
          onClick={buttonProps.onDecline}
          style={{ backgroundColor: "#800", color: "white", fontSize: "48px", height: 64, width: 64 }} />
      </DialogFooter>
    </Dialog>
  </main>);
};
TrampPage.displayName = "TrampPage";

export default TrampPage;