import { Button, MessageBar, Input, Text, Image } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { useMachine } from "@xstate/react";
import { useCallback, useContext, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { EditRally as machineDefinition } from "../Machines";
import CONSTANTS from "../../app.constants";
import { AppContext, AuthContext } from "../../contexts";
import { IRally } from "../../helpers/GraphQL";

import styles from "./Rally.module.scss";

interface ITimestampedRally extends IRally {
  timestamp: number;
}

const EditRally = () => {
  const { setTitle } = useContext(AppContext);
  const { csrfToken } = AuthContext.useAuth();
  const [errors, setErrors] = useState({});
  const [messages, setMessages] = useState({});
  const { id } = useParams() as Record<string, string>;
  const { t } = useTranslation("rally");
  const [timestamp, setTimestamp] = useReducer(() => (Date.now()), Date.now());
  const mergeValues = (oldValues: ITimestampedRally, newValues: Partial<IRally>): ITimestampedRally =>
    ({ ...oldValues, ...newValues, timestamp });
  const [values, setValue] = useReducer(mergeValues, { timestamp } as ITimestampedRally);
  const [{ context }, send] = useMachine(machineDefinition);
  useEffect(
    () => (setTitle(`✏ ${context.rally?.name ?? t("placeholderNew")}`), undefined),
    [context.rally?.name, setTitle, t]
  );
  useEffect(() => (send({ type: "INIT", id: parseInt(id) }), undefined), [id, send]);
  useEffect(() => (setTimestamp(), setValue(context.rally ?? {}), undefined), [context.rally, setTimestamp]);
  const formatDatePostValue = useCallback(
    (date: Date | null) => ((date != null) ? new Date(date).toISOString().split("T")[0] : null),
    []
  );
  const getDateFromValue = useCallback(
    (date: Date | string | null) => ((date != null) ? new Date(date) : null),
    []
  );
  const displayMessages = useCallback(
    (messages: any, intent: "error" | "warning" | "success" | "info" = "info") => {
      const mapMessage = (message: any, index: number) => (<div key={`message--${index}`}>{message}</div>);
      return (messages == null)
        ? null
        : (
          <MessageBar intent={intent}>
            {Array.isArray(messages) ? messages.map(mapMessage) : mapMessage(messages, 0)}
          </MessageBar>
        );
    },
    []
  );
  const onChange_date = useCallback(
    (fieldName: string) => (newDate: Date | null) => (setValue({ [fieldName]: newDate })),
    [setValue]
  );
  const onChange_text = useCallback(
    (fieldName: string) => (_: any, newValue: any) => (setValue({ [fieldName]: newValue })),
    [setValue]
  );
  const onFormat_date = useCallback(
    (date: Date | null) => {
      const formatDate = (date: Date) => {
        const options = [{ day: "numeric" }, { month: "short" }, { year: "numeric" }];
        const parts = options.map((option: any) => (new Intl.DateTimeFormat("en-US", option).format(new Date(date))));
        return parts.join(" ");
      };
      return (date != null) ? (formatDate(date)) : "";
    },
    []
  );
  const onSubmit = useCallback(
    async (event: any) => {
      const onUpdate_success = (responseData: any) => {
        setErrors({});
        setMessages({ "*": (parseInt(id) > 0) ? t("message.updateSuccess") : t("message.createSuccess") });
        setTimeout(
          () => (window.location.href = `/rally/view/${responseData.data[Object.keys(responseData.data)[0]].id}`),
          2000
        );
      }
      event.preventDefault();
      event.stopPropagation();
      await csrfToken();
      try {
        const { image_url, name, start_date, stop_date } = values as any;
        let query: string;
        if (parseInt(id) > 0) {
          query = `mutation($id: ID!, $name: String!, $image_url: String, $start_date: Date, $stop_date: Date) {
            updateRally(id: $id, name: $name, image_url: $image_url, start_date: $start_date, stop_date: $stop_date) {
              id
              name
              image_url
              start_date
              stop_date
            }
          }`;
        } else {
          query = `mutation($name: String!, $image_url: String, $start_date: Date, $stop_date: Date) {
            createRally(name: $name, image_url: $image_url, start_date: $start_date, stop_date: $stop_date) {
              id
              name
              image_url
              start_date
              stop_date
            }
          }`;
        }
        const variables = {
          id: parseInt(id),
          image_url,
          name,
          start_date: formatDatePostValue(start_date),
          stop_date: formatDatePostValue(stop_date)
        };
        if (parseInt(id) === 0) {
          delete variables.id;
        }
        const optionsFetch = {
          body: JSON.stringify({ query, variables }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST"
        };
        const urlFetch = CONSTANTS.urlGraphQL;
        return fetch(urlFetch, optionsFetch).then(async (response) => {
          const responseData = await response.json();
          if ((responseData.errors ?? []).length > 0) {
            setErrors({ "*": responseData.errors.map((error: any) => (error.message)) });
          } else {
            onUpdate_success(responseData);
          }
        }).catch(async (response: any) => {
          let errorData = {};
          if (response.json != null) {
            errorData = await response.json();
          }
          throw { response, data: errorData };
        });
      } catch (error: any) {
        if (error.response.status === 422) {
          setErrors({ "*": error.response.data.message, ...error.response.data.errors });
        }
      }
    },
    [formatDatePostValue, setErrors, setMessages, values]
  );
  return context.show.form
    ? (
      <form className={styles.form}>
        <h1 style={{ textAlign: "center" }}>{t((parseInt(id) > 0) ? "title.update" : "title.create")}</h1>
        <h2 style={{ textAlign: "center" }}>
          {t("subtitle.update", { rally: context.rally?.name ?? t("placeholderNew") })}
        </h2>
        {(errors as any)["*"] != null ? displayMessages((errors as any)["*"], "error") : (<></>)}
        {(messages as any)["*"] != null ? displayMessages((messages as any)["*"], "success") : (<></>)}
        <div className={[styles["flex--horizontal"], styles["gap--1em"]].join(" ")} id="main">
          <div className={[styles["flex--vertical"], styles["gap--1em"]].join(" ")}>
            <label className={[styles["flex--vertical"], styles["gap--0_5em"]].join(" ")}>
              <Text>{t("label.name")}</Text>
              <Input
                defaultValue={values.name}
                key={`rally-name--${timestamp}`}
                onChange={onChange_text("name")}
                required={true}
                type="text"
              />
            </label>
            <label className={[styles["flex--vertical"], styles["gap--0_5em"]].join(" ")}>
              <Text>{t("label.image_url")}</Text>
              <Input
                defaultValue={values.image_url}
                key={`rally-image_url--${timestamp}`}
                onChange={onChange_text("image_url")}
                required={false}
                type="url"
              />
            </label>
            <label className={[styles["flex--vertical"], styles["gap--0_5em"]].join(" ")}>
              <Text>{t("label.start_date")}</Text>
              <DatePicker
                formatDate={onFormat_date}
                key={`rally-start_date--${timestamp}`}
                onSelectDate={onChange_date("start_date")}
                value={getDateFromValue(values.start_date)}
              />
            </label>
            <label className={[styles["flex--vertical"], styles["gap--0_5em"]].join(" ")}>
              <Text>{t("label.stop_date")}</Text>
              <DatePicker
                formatDate={onFormat_date}
                key={`rally-stop_date--${timestamp}`}
                onSelectDate={onChange_date("stop_date")}
                value={getDateFromValue(values.stop_date)}
              />
            </label>
          </div>
          <div className={styles["image-container"]}><Image src={values.image_url} /></div>
        </div>
        <div className={styles.actionBar}>
          <Button appearance="secondary" onClick={() => (window.history.back())} type="button">{t("button.cancel")}</Button>
          <Button appearance="primary" onClick={onSubmit} type="submit">{t("button.save")}</Button>
        </div>
      </form>
    ) : (<></>);
};
EditRally.displayName = "EditRally";

export default EditRally;
