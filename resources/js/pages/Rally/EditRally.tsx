import { useMachine } from "@xstate/react";
import { useCallback, useContext, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { EditRally as machineDefinition } from "../Machines";
import CONSTANTS from "../../app.constants";
import { AppContext, AuthContext } from "../../contexts";
import { DatePicker, DefaultButton, MessageBar, MessageBarType, PrimaryButton, TextField } from "@fluentui/react";

import "../../../css/rally.css";
import styles from "./Rally.module.scss";

const EditRally = () => {
  const { setTitle } = useContext(AppContext);
  const { csrfToken } = AuthContext.useAuth();
  const [errors, setErrors] = useState({});
  const [messages, setMessages] = useState({});
  const { id } = useParams();
  const { t } = useTranslation("rally");
  const [timestamp, setTimestamp] = useReducer(() => (Date.now()), Date.now());
  const mergeValues = (oldValues: any, newValues: any) => ({ ...oldValues, ...newValues, timestamp });
  const [values, setValue] = useReducer(mergeValues, {});
  const [{ context }, send] = useMachine(machineDefinition);
  useEffect(
    () => (setTitle(`✏ ${context.rally?.name ?? t("placeholderNew")}`), undefined),
    [context.rally?.name, setTitle, t]
  );
  useEffect(() => (send({ type: "INIT", id: (id as any) * 1 }), undefined), [id, send]);
  useEffect(() => (setTimestamp(), setValue(context.rally ?? {}), undefined), [context.rally, setTimestamp]);
  const formatDatePostValue = useCallback(
    (date: any) => ((date != null) ? new Date(date).toISOString().split("T")[0] : null),
    []
  );
  const displayMessages = useCallback(
    (messages: any, type = MessageBarType.info) => {
      const mapMessage = (message: any, index: number) => (<div key={`message--${index}`}>{message}</div>);
      return (messages == null)
        ? null
        : (
          <MessageBar isMultiline={Array.isArray(messages)} messageBarType={type}>
            {Array.isArray(messages) ? messages.map(mapMessage) : mapMessage(messages, 0)}
          </MessageBar>
        );
    },
    []
  );
  const getErrors = useCallback(
    (fieldName: string) => {
      const mapLine = (line: any, index: number) => (<div key={`${fieldName}-error--${index}`}>{line}</div>);
      return ((errors as any)[fieldName] == null)
        ? null
        : (
          (typeof (errors as any)[fieldName] === "string")
            ? (errors as any)[fieldName]
            : (<div className="div--rows">{(errors as any)[fieldName].map(mapLine)}</div>)
        );
    },
    [errors]
  );
  const onChange_date = useCallback(
    (fieldName: string) => (newDate: any) => (setValue({ [fieldName]: newDate })),
    [setValue]
  );
  const onChange_text = useCallback(
    (fieldName: string) => (_: any, newValue: any) => (setValue({ [fieldName]: newValue })),
    [setValue]
  );
  const onFormat_date = useCallback(
    (date: any) => {
      const formatDate = (date: any) => {
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
        setMessages({ "*": ((id as any) > 0) ? t("message.updateSuccess") : t("message.createSuccess") });
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
        if ((id as any) > 0) {
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
          id: (id as any) * 1,
          image_url,
          name,
          start_date: formatDatePostValue(start_date),
          stop_date: formatDatePostValue(stop_date)
        };
        if ((id as any) === 0) {
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
      <form>
        <div className="div--rows gap--1em margin--2em">
          <div className="div--columns gap--1em" id="main">
            <div className="div--rows gap--1em">
              <h1 style={{ textAlign: "center" }}>{t(((id as any) > 0) ? "title.update" : "title.create")}</h1>
              <h2 style={{ textAlign: "center" }}>
                {t("subtitle.update", { rally: context.rally?.name ?? t("placeholderNew") })}
              </h2>
              {(errors as any)["*"] != null ? displayMessages((errors as any)["*"], MessageBarType.error) : (<></>)}
              {(messages as any)["*"] != null ? displayMessages((messages as any)["*"], MessageBarType.success) : (<></>)}
              <label>
                {t("label.name")}
                <TextField
                  defaultValue={(values as any).name}
                  errorMessage={getErrors("name")}
                  key={`rally-name--${timestamp}`}
                  onChange={onChange_text("name")}
                  required={true}
                  size={64}
                  type="text"
                />
              </label>
              <label>
                <div>
                  {t("label.image_url")}
                  <TextField
                    defaultValue={(values as any).image_url}
                    errorMessage={getErrors("image_url")}
                    key={`rally-image_url--${timestamp}`}
                    onChange={onChange_text("image_url")}
                    required={false}
                    size={256}
                    type="url"
                  />
                </div>
              </label>
              <label>
                {t("label.start_date")}
                <DatePicker
                  formatDate={onFormat_date}
                  key={`rally-start_date--${timestamp}`}
                  onSelectDate={onChange_date("start_date")}
                  value={(values as any).start_date}
                />
              </label>
              <label>
                {t("label.stop_date")}
                <DatePicker
                  formatDate={onFormat_date}
                  key={`rally-stop_date--${timestamp}`}
                  onSelectDate={onChange_date("stop_date")}
                  value={(values as any).stop_date}
                />
              </label>
            </div>
            <div>
              <img src={(values as any).image_url} />
            </div>
          </div>
          <div className={styles.actionBar}>
            <DefaultButton onClick={() => (window.history.back())} type="button">{t("button.cancel")}</DefaultButton>
            <PrimaryButton onClick={onSubmit} type="submit">{t("button.save")}</PrimaryButton>
          </div>
        </div>
      </form>
    ) : (<></>);
};
EditRally.displayName = "EditRally";

export default EditRally;
