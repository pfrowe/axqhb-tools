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
  const mergeValues = (oldValues, newValues) => ({ ...oldValues, ...newValues, timestamp });
  const [values, setValue] = useReducer(mergeValues, {});
  const [{ context }, send] = useMachine(machineDefinition);
  useEffect(
    () => (setTitle(`✏ ${context.rally?.name ?? t("placeholderNew")}`) && undefined),
    [context.rally?.name, setTitle, t]
  );
  useEffect(() => (send({ type: "INIT", id: id * 1 }) && undefined), [id, send]);
  useEffect(() => (setTimestamp(), setValue(context.rally ?? {}), undefined), [context.rally, setTimestamp]);
  const formatDatePostValue = useCallback(
    (date) => ((date != null) ? new Date(date).toISOString().split("T")[0] : null),
    []
  );
  const displayMessages = useCallback(
    (messages, type = MessageBarType.info) => {
      const mapMessage = (message, index) => (<div key={`message--${index}`}>{message}</div>);
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
    (fieldName) => {
      const mapLine = (line, index) => (<div key={`${fieldName}-error--${index}`}>{line}</div>);
      return (errors[fieldName] == null)
        ? null
        : (
          (typeof errors[fieldName] === "string")
            ? errors[fieldName]
            : (<div className="div--rows">{errors[fieldName].map(mapLine)}</div>)
        );
    },
    [errors]
  );
  const onChange_date = useCallback(
    (fieldName) => (newDate) => (setValue({ [fieldName]: newDate })),
    [setValue]
  );
  const onChange_text = useCallback(
    (fieldName) => (_, newValue) => (setValue({ [fieldName]: newValue })),
    [setValue]
  );
  const onFormat_date = useCallback(
    (date) => {
      const formatDate = (date) => {
        const options = [{ day: "numeric" }, { month: "short" }, { year: "numeric" }];
        const parts = options.map((option) => (new Intl.DateTimeFormat("en-US", option).format(new Date(date))));
        return parts.join(" ");
      };
      return (date != null) ? (formatDate(date)) : "";
    },
    []
  );
  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await csrfToken();
      try {
        const { image_url, name, start_date, stop_date } = values;
        const query = `mutation($id: ID!, $name: String!, $image_url: String, $start_date: Date, $stop_date: Date) {
          updateRally(id: $id, name: $name, image_url: $image_url, start_date: $start_date, stop_date: $stop_date) {
            id
            name
            image_url
            start_date
            stop_date
          }
        }`;
        const variables = {
          id: id * 1,
          image_url,
          name,
          start_date: formatDatePostValue(start_date),
          stop_date: formatDatePostValue(stop_date)
        };
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
            setErrors({ "*": responseData.errors.map((error) => (error.message)) });
          } else {
            setErrors({});
            setMessages({ "*": (id > 0) ? t("message.updateSuccess") : t("message.createSuccess") });
          }
        }).catch(async (response) => {
          let errorData = {};
          if (response.json != null) {
            errorData = await response.json();
          }
          throw { response, data: errorData };
        });
      } catch (error) {
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
              <h1 style={{ textAlign: "center" }}>{t((id > 0) ? "title.update" : "title.create")}</h1>
              <h2 style={{ textAlign: "center" }}>
                {t("subtitle.update", { rally: context.rally?.name ?? t("placeholderNew") })}
              </h2>
              {errors["*"] != null ? displayMessages(errors["*"], MessageBarType.error) : (<></>)}
              {messages["*"] != null ? displayMessages(messages["*"], MessageBarType.success) : (<></>)}
              <label>
                {t("label.name")}
                <TextField
                  defaultValue={values.name}
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
                    defaultValue={values.image_url}
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
                  value={values.start_date}
                />
              </label>
              <label>
                {t("label.stop_date")}
                <DatePicker
                  formatDate={onFormat_date}
                  key={`rally-stop_date--${timestamp}`}
                  onSelectDate={onChange_date("stop_date")}
                  value={values.stop_date}
                />
              </label>
            </div>
            <div>
              <img src={values.image_url} />
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