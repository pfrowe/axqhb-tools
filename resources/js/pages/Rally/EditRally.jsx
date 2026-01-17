import { useMachine } from "@xstate/react";
import { useCallback, useContext, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { EditRally as machineDefinition } from "../Machines";
import { AppContext, AuthContext } from "../../contexts";
import { DatePicker, MessageBar, PrimaryButton, TextField } from "@fluentui/react";

import "../../../css/rally.css";

const EditRally = () => {
  const { setTitle } = useContext(AppContext);
  const { csrfToken } = AuthContext.useAuth();
  const [errors, setErrors] = useState({});
  const [messages, setMessages] = useState({});
  const { id } = useParams();
  const { t } = useTranslation("rally");
  const mergeValues = (oldValues, newValues) => ({ ...oldValues, ...newValues });
  const [values, setValue] = useReducer(mergeValues, {});
  const [{ context }, send] = useMachine(machineDefinition);
  useEffect(
    () => (setTitle(`✏ ${context.rally?.name ?? t("placeholderNew")}`) && undefined),
    [context.rally?.name, setTitle, t]
  );
  useEffect(() => (send({ type: "INIT", id: id * 1 }) && undefined), [id, send]);
  useEffect(() => (setValue(context.rally ?? {}) && undefined), [context.rally]);
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
    (fieldName) => (_, newDate) => (setValue({ [fieldName]: newDate })),
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
        const parts = options.map((option) => (new Intl.DateTimeFormat("en-US", option).format(date)));
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
        console.log("Submit:\t", values);
      } catch (error) {
        if (error.response.status === 422) {
          setErrors({ "*": error.response.data.message, ...error.response.data.errors });
        }
      }
    },
    [values]
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
              {errors["*"]
                ? (<MessageBar isMultiline={false} messageBarType={MessageBarType.error}>{errors["*"]}</MessageBar>)
                : (<></>)
              }
              {messages["*"]
                ? (<MessageBar isMultiline={false} messageBarType={MessageBarType.success}>{messages["*"]}</MessageBar>)
                : (<></>)
              }
              <label>
                {t("label.name")}
                <TextField
                  defaultValue={values.name}
                  errorMessage={getErrors("name")}
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
                  defaultValue={values.start_date ? Date(values.start_date) : null}
                  formatDate={onFormat_date}
                  onSelectDate={onChange_date("start_date")}
                />
              </label>
              <label>
                {t("label.stop_date")}
                <DatePicker
                  defaultValue={values.stop_date ? Date(values.stop_date) : null}
                  formatDate={onFormat_date}
                  onSelectDate={onChange_date("stop_date")}
                />
              </label>
            </div>
            <div>
              <img src={values.image_url} />
            </div>
          </div>
          <div className="div--form-buttons">
            <PrimaryButton onClick={onSubmit} type="submit">{t("button.save")}</PrimaryButton>
          </div>
        </div>
      </form>
    ) : (<></>);
};
EditRally.displayName = "EditRally";

export default EditRally;