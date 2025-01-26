import * as React from "react";
import { MessageBar, MessageBarType, PrimaryButton, TextField } from "@fluentui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import { AppContext } from "../../contexts";

const ForgotPage = () => {
  const { setTitle } = React.useContext(AppContext);
  const [errors, setErrors] = React.useState({});
  const navigate = useNavigate();
  const { t } = useTranslation("user");
  const mergeValues = (oldValues, newValues) => ({ ...oldValues, ...newValues });
  const [values, setValue] = React.useReducer(mergeValues, {});
  React.useEffect(() => (setTitle(t("title.forgot")) && undefined), [setTitle, t]);
  const onChange_text = React.useCallback(
    (fieldName) => (_, newValue) => (setValue({ [fieldName]: newValue })),
    [setValue]
  );
  const onSubmit = React.useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        const response = await axios.post("/forgot", values);
        if (response.status === 200) {
          navigate("/user/reset");
        }
      } catch (error) {
        if (error.response.status >= 400) {
          setErrors({ "*": error.response.data.message });
        }
      }
    },
    [setErrors, values]
  );
  return (
    <form>
      <section className="div--rows gap--1em margin--2em" id="main">
        <h1>{t("title.forgot")}</h1>
        {errors["*"]
          ? (<MessageBar isMultiline={false} messageBarType={MessageBarType.error}>{errors["*"]}</MessageBar>)
          : (<></>)
        }
        <label>
          {t("label.email")}
          <TextField
            errorMessage={errors.email}
            onChange={onChange_text("email")}
            required={true}
            size={64}
            type="email"
          />
        </label>
        <div className="div--form-buttons">
          <PrimaryButton onClick={onSubmit} type="submit">{t("submit.forgot")}</PrimaryButton>
        </div>
      </section>
    </form>
  );
};
ForgotPage.displayName = "ForgotPage";

export default ForgotPage;