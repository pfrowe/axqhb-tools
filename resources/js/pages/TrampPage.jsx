import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from "@fluentui/react";
import { useParams } from "react-router-dom";
import CONSTANTS from "../app.constants";
import { useTranslation } from "react-i18next";
import TrampSection from "../components/TrampSection/TrampSection";
import { useInterval } from "@react-hooks-library/core";

const TrampPage = () => {
  const [refresh, triggerRefresh] = useState(true);
  const { t } = useTranslation("tramp");
  const routerParams = useParams();
  const [singer, setSinger] = useState({ unique_id: routerParams.unique_id });
  const [singers, setSingers] = useState([]);
  const getSinger = () => {
    const fetchSinger = async () => {
      triggerRefresh(false);
      const bodyText = `query ($unique_id: String) {
        singer(unique_id: $unique_id) {
          family_name
          given_name
          id
          unique_id
          voice_part
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
      const { unique_id } = routerParams;
      const optionsFetch = {
        body: JSON.stringify({ query: bodyText, variables: { unique_id } }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      setSinger((await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.singer);
    }
    refresh && fetchSinger();
  }
  useEffect(getSinger, [refresh, routerParams?.unique_id, triggerRefresh]);
  const getSingers = () => {
    const fetchSingers = async () => {
      const filterNotThisSinger = (unique_id) => ({ unique_id: idTest }) => (idTest !== unique_id);
      const sortSingers = (left, right) => {
        return (CONSTANTS.parts.indexOf(left.voice_part) - CONSTANTS.parts.indexOf(right.voice_part)) ||
          left.family_name.localeCompare(right.family_name) ||
          left.given_name.localeCompare(right.given_name);
      };
      const bodyText = `query {
        singers {
          family_name
          given_name
          id
          unique_id
          voice_part
        }
      }`;
      const optionsFetch = {
        body: JSON.stringify({ query: bodyText }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      setSingers(
        (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.singers
          .filter(filterNotThisSinger(routerParams.unique_id))
          .sort(sortSingers)
      );
    };
    fetchSingers();
  };
  useEffect(getSingers, [setSingers]);
  const [buttonProps, setButtonProps] = useState({});
  const [dialogProps, setDialogProps] = useState({ hidden: true });
  const iconStyles = useMemo(() => ({ root: { color: "white", fontSize: "48px", fontWeight: "bold" } }), []);
  const onCloseDialog = useCallback(() => (setDialogProps({ hidden: true })), [setDialogProps]);
  const handleClick = ({ action, id, recipient, sender }) => {
    const onClick_accept = () => () => {
      const bodyText = `mutation {
        updateSticker(id: ${id}, status: "accepted") {
          recipient_id
          sender_id
          status
        }
      }`;
      const optionsFetch = {
        body: JSON.stringify({ query: bodyText }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      fetch(CONSTANTS.urlGraphQL, optionsFetch).then(onCloseDialog).then(requestRefresh).catch(requestRefresh);
    };
    const onClick_decline = () => () => {
      const bodyText = `mutation {
        updateSticker(id: ${id}, status: "declined") {
          recipient_id
          sender_id
          status
        }
      }`;
      const optionsFetch = {
        body: JSON.stringify({ query: bodyText }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      fetch(CONSTANTS.urlGraphQL, optionsFetch).then(onCloseDialog).then(requestRefresh).catch(requestRefresh);
    };
    const onClick_send = ({ recipient, sender }) => {
      const bodyText = `mutation {
        createSticker(recipient_id: ${recipient.id}, sender_id: ${sender.id}, status: "pending") {
          recipient_id
          sender_id
          status
        }
      }`;
      const optionsFetch = {
        body: JSON.stringify({ query: bodyText }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      fetch(CONSTANTS.urlGraphQL, optionsFetch).then(requestRefresh).catch(requestRefresh);
    };
    const { unique_id } = routerParams;
    const singerOther = recipient.unique_id === unique_id ? sender : recipient;
    const nameOther = `${singerOther.given_name} ${singerOther.family_name}`;
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
  const onClickTrampSection = useCallback(handleClick, [onCloseDialog, requestRefresh, routerParams, setDialogProps]);
  const mapSection = (voice_part) => (
    <TrampSection onClick={onClickTrampSection} {...{ singer, singers, voice_part }} key={`section--${voice_part}`} />
  );
  const requestRefresh = useCallback(() => (triggerRefresh(true)), [triggerRefresh]);
  useInterval(requestRefresh, CONSTANTS.pollInterval);
  return (<main id="main">
    <h1 style={{ textAlign: "center" }}>{t("welcome")}</h1>
    <h2 style={{ textAlign: "center" }}>{singer?.given_name} {singer?.family_name}</h2>
    {CONSTANTS.parts.map(mapSection)}
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