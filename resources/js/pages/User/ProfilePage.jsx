import * as React from "react";
import { MessageBar, MessageBarType, PrimaryButton, TextField } from "@fluentui/react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { AppContext, AuthContext } from "../../contexts";

const ProfilePage = () => {
  const { setTitle } = React.useContext(AppContext);
  const { csrfToken, setUser, user } = AuthContext.useAuth();
  const [errors, setErrors] = React.useState({});
  const [messages, setMessages] = React.useState({});
  const { t } = useTranslation("user");
  const mergeValues = (oldValues, newValues) => ({ ...oldValues, ...newValues });
  const [values, setValue] = React.useReducer(mergeValues, { prev_email: user.email, ...user });
  React.useEffect(() => (setTitle(t("title.profile")) && undefined), [setTitle, t]);
  const getErrors = React.useCallback(
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
  const onChange_text = React.useCallback(
    (fieldName) => (_, newValue) => (setValue({ [fieldName]: newValue })),
    [setValue]
  );
  const onSubmit = React.useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await csrfToken();
      try {
        const response = await axios.post("/profile", values);
        if (response.status === 200) {
          setMessages({ "*": t("message.profile_updated") });
          setTimeout(() => (setMessages({})), 5000);
          setUser(response.data.user);
        }
      } catch (error) {
        if (error.response.status === 422) {
          setErrors({ "*": error.response.data.message, ...error.response.data.errors });
        }
      }
    },
    [csrfToken, setErrors, setMessages, setUser, values]
  );
  return (
    <form>
      <section className="div--rows gap--1em margin--2em" id="main">
        <h1>{t("title.profile")}</h1>
        {errors["*"]
          ? (<MessageBar isMultiline={false} messageBarType={MessageBarType.error}>{errors["*"]}</MessageBar>)
          : (<></>)
        }
        {messages["*"]
          ? (<MessageBar isMultiline={false} messageBarType={MessageBarType.success}>{messages["*"]}</MessageBar>)
          : (<></>)
        }
        <label>
          {t("label.first_name")}
          <TextField
            defaultValue={values.first_name}
            errorMessage={getErrors("first_name")}
            onChange={onChange_text("first_name")}
            required={true}
            size={64}
            type="text"
          />
        </label>
        <label>
          {t("label.preferred_name")}
          <TextField
            defaultValue={values.preferred_name}
            errorMessage={getErrors("preferred_name")}
            onChange={onChange_text("preferred_name")}
            required={false}
            size={64}
            type="text"
          />
        </label>
        <label>
          {t("label.last_name")}
          <TextField
            defaultValue={values.last_name}
            errorMessage={getErrors("last_name")}
            onChange={onChange_text("last_name")}
            required={true}
            size={64}
            type="text"
          />
        </label>
        <label>
          {t("label.email")}
          <TextField
            defaultValue={values.email}
            errorMessage={getErrors("email")}
            onChange={onChange_text("email")}
            required={true}
            size={64}
            type="email"
          />
        </label>
        <label>
          {t("label.password")}
          <TextField
            canRevealPassword={true}
            errorMessage={getErrors("password")}
            onChange={onChange_text("password")}
            required={true}
            revealPasswordAriaLabel={t("label.reveal_password")}
            size={64}
            type="password"
          />
        </label>
        <label>
          {t("label.password_confirmation")}
          <TextField
            canRevealPassword={true}
            errorMessage={getErrors("password_confirmation")}
            onChange={onChange_text("password_confirmation")}
            required={true}
            revealPasswordAriaLabel={t("label.reveal_password")}
            size={64}
            type="password"
          />
        </label>
        <div className="div--form-buttons">
          <PrimaryButton onClick={onSubmit} type="submit">{t("submit.profile")}</PrimaryButton>
        </div>
      </section>
    </form>
  );
};
ProfilePage.displayName = "ProfilePage";

export default ProfilePage;