import { useCallback, useMemo, useState } from "react";
import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from "@fluentui/react";
import { useInterval } from "@react-hooks-library/core";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { assign, fromPromise, setup } from "xstate";
import { useMachine } from "@xstate/react";
import CONSTANTS from "../app.constants";
import TrampSection from "../components/TrampSection";

const TrampPage = () => {
  const { unique_id } = useParams();
  const getCard = useCallback(
    async () => {
      const query = `query ($unique_id: String) {
        card(unique_id: $unique_id) {
          rally_id
          singer {
            family_name
            given_name
            id
            is_guest_singer
            preferred_name
            voice_part
          }
          stickers_received {
            id
            recipient {
              unique_id
            }
            sender {
              unique_id
            }
            status
            updated_at
          }
          stickers_sent {
            id
            recipient {
              unique_id
            }
            sender {
              unique_id
            }
            status
            updated_at
          }
        }
      }`;
      const variables = { unique_id };
      const optionsFetch = {
        body: JSON.stringify({ query, variables }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      const urlFetch = CONSTANTS.urlGraphQL;
      return (await (await fetch(urlFetch, optionsFetch)).json()).data.card;
    },
    [unique_id]
  );
  const getSingers = useCallback(
    async (rally_id) => {
      const filterNotThisSinger = (unique_id) => ({ unique_id: idTest }) => (idTest !== unique_id);
      const sortSingers = (left, right) => {
        const nameLeft = left.singer.preferred_name ?? left.singer.given_name;
        const nameRight = right.singer.preferred_name ?? right.singer.given_name;
        const partLeft = left.singer.is_guest_singer ? CONSTANTS.partGuest : left.singer.voice_part;
        const partRight = right.singer.is_guest_singer ? CONSTANTS.partGuest : right.singer.voice_part;
        return (CONSTANTS.parts.indexOf(partLeft) - CONSTANTS.parts.indexOf(partRight)) ||
          left.singer.family_name.localeCompare(right.singer.family_name) ||
          (nameLeft).localeCompare(nameRight);
      };
      const query = `query($rally: ID) {
        rally(id: $rally) {
          singers {
            unique_id
            singer {
              family_name
              given_name
              id
              is_guest_singer
              preferred_name
              voice_part
            }
          }
        }
      }`;
      const variables = { rally: rally_id }
      const optionsFetch = {
        body: JSON.stringify({ query, variables }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      return (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.rally.singers
        .filter(filterNotThisSinger(unique_id))
        .sort(sortSingers);
    },
    [unique_id]
  );
  const machineDefinition = useMemo(
    () => (setup({
      actors: {
        getCard: fromPromise(getCard),
        getSingers: fromPromise((input) => (getSingers(input.rally_id)))
      }
    }).createMachine({
      context: {
        data: {
          card: {},
          singers: []
        },
        show: { card: false }
      },
      initial: "loadingCard",
      states: {
        loadingCard: {
          invoke: {
            id: "getCard",
            src: "getCard",
            onDone: {
              actions: [assign(({ context, event }) => ({ data: { ...context.data, card: event.output } }))],
              target: "loadingSingers"
            }
          }
        },
        loadingSingers: {
          invoke: {
            id: "getSingers",
            input: ({ context }) => (context.data.card),
            src: "getSingers",
            onDone: {
              actions: [assign(({ context, event }) => ({ data: { ...context.data, singers: event.output } }))],
              target: "ready"
            }
          }
        },
        ready: {
          entry: [assign({ show: { card: true } })],
          on: {
            refresh: "loadingCard"
          }
        }
      }
    })
    ),
    [getCard, getSingers]
  );
  const [{ context }, send] = useMachine(machineDefinition);
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