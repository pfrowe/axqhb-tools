import { useCallback, useContext, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useMachine } from "@xstate/react";
import { TrampPage as machineDefinition } from "./Machines";
import CONSTANTS from "../app.constants";
import TrampSection from "../components/TrampSection";
import { AppContext, TrampContext } from "../contexts";
import { ISticker } from "../helpers/GraphQL";

const TrampPage = () => {
  const { setTitle } = useContext(AppContext);
  const { unique_id } = useParams();
  const [{ context }, send] = useMachine(machineDefinition);
  useEffect(() => (send({ type: "INIT", unique_id }), undefined), [send, unique_id]);
  const { t } = useTranslation("tramp");
  const requestRefresh = useCallback(() => (send({ type: "REFRESH" })), [send]);
  const onClick_accept = useCallback(
    ({ id }: ISticker) => {
      const query = `mutation($id: ID!, $status: String) {
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
      const urlFetch = CONSTANTS.urlGraphQL;
      return fetch(urlFetch, optionsFetch).then(requestRefresh).catch(requestRefresh);
    },
    [requestRefresh, send]
  );
  const onClick_decline = useCallback(
    ({ id }: ISticker) => {
      const query = `mutation($id: ID!, $status: String) {
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
      const urlFetch = CONSTANTS.urlGraphQL;
      return fetch(urlFetch, optionsFetch).then(requestRefresh).catch(requestRefresh);
    },
    [requestRefresh, send]
  );
  const onClick_delete = useCallback(
    ({ id }: ISticker) => {
      const query = `mutation($id: ID!) {
        deleteSticker(id: $id) {
          id
        }
      }`;
      const variables = { id };
      const optionsFetch = {
        body: JSON.stringify({ query, variables }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      const urlFetch = CONSTANTS.urlGraphQL;
      return fetch(urlFetch, optionsFetch).then(requestRefresh).catch(requestRefresh);
    },
    [requestRefresh, send]
  );
  const onClick_send = useCallback(
    ({ recipient, sender }: ISticker) => {
      const query = `mutation($recipient: ID!, $sender: ID!, $status: String) {
        createSticker(recipient_id: $recipient, sender_id: $sender, status: $status) {
          recipient_id
          sender_id
          status
        }
      }`;
      const variables = { recipient, sender, status: "pending" };
      const optionsFetch = {
        body: JSON.stringify({ query, variables }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      };
      const urlFetch = CONSTANTS.urlGraphQL;
      return fetch(urlFetch, optionsFetch).then(requestRefresh).catch(requestRefresh);
    },
    [requestRefresh, send]
  );
  const onClick = useMemo(
    () => ({ accept: onClick_accept, decline: onClick_decline, delete: onClick_delete, send: onClick_send }),
    [onClick_accept, onClick_decline, onClick_delete, onClick_send]
  );
  const mapSection = useCallback(
    (voice_part: string) => {
      const singers = context.data.singers;
      return (
        <TrampSection
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
  useEffect(() => (setTitle(t("name", nameParts)), undefined), [nameParts, setTitle, t]);
  return (<main id="main">
    <h1 style={{ textAlign: "center" }}>{t("welcome")}</h1>
    <h2 style={{ textAlign: "center" }}>{t("name", nameParts)}</h2>
    <TrampContext.Provider value={{ onClick, self: context.data.card }}>
      {context.show?.card ? CONSTANTS.parts.map(mapSection) : (<></>)}
    </TrampContext.Provider>
  </main>);
};
TrampPage.displayName = "TrampPage";

export default TrampPage;
