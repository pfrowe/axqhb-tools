import * as React from "react";
import { MessageBar, MessageBarType, PrimaryButton, TextField } from "@fluentui/react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppContext, AuthContext } from "../../contexts";

const RegisterPage = () => {
  const { setTitle } = React.useContext(AppContext);
  const { csrfToken, setUser } = AuthContext.useAuth();
  const [errors, setErrors] = React.useState({});
  const navigate = useNavigate();
  const { t } = useTranslation("user");
  const mergeValues = (oldValues: any, newValues: any) => ({ ...oldValues, ...newValues });
  const [values, setValue] = React.useReducer(mergeValues, {});
  React.useEffect(() => (setTitle(t("title.register")), undefined), [setTitle, t]);
  const getErrors = React.useCallback(
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
  const onChange_text = React.useCallback(
    (fieldName: string) => (_: any, newValue: any) => (setValue({ [fieldName]: newValue })),
    [setValue]
  );
  const onSubmit = React.useCallback(
    async (event: any) => {
      event.preventDefault();
      event.stopPropagation();
      await csrfToken();
      try {
        const response = await axios.post("/api/register", values);
        if (response.status === 200) {
          setUser(response.data.user);
          navigate("/");
        }
      } catch (error: any) {
        if (error.response.status === 422) {
          setErrors({ "*": error.response.data.message, ...error.response.data.errors });
        }
      }
    },
    [csrfToken, setErrors, setUser, values]
  );
  return (
    <form>
      <section className="div--rows gap--1em margin--2em" id="main">
        <h1>{t("title.register")}</h1>
        {(errors as any)["*"]
          ? (<MessageBar isMultiline={false} messageBarType={MessageBarType.error}>{(errors as any)["*"]}</MessageBar>)
          : (<></>)
        }
        <label>
          {t("label.name")}
          <TextField
            errorMessage={getErrors("name")}
            onChange={onChange_text("name")}
            required={true}
            size={64}
            type="text"
          />
        </label>
        <label>
          {t("label.email")}
          <TextField
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
          <PrimaryButton onClick={onSubmit} type="submit">{t("submit.register")}</PrimaryButton>
        </div>
      </section>
    </form>
  );
};
RegisterPage.displayName = "RegisterPage";

export default RegisterPage;
