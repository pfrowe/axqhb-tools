import { Dropdown, Text, TextField } from "@fluentui/react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IFieldState } from "../../../contexts/PopulateSingersContext";
import PhoneInputWithCountrySelect, { formatPhoneNumber } from "react-phone-number-input";

import styles from "../EditableSingerCard.module.scss";
import "react-phone-number-input/style.css";

interface IMergePhoneNumberProps {
  databaseValue: string | null;
  fieldName: string;
  importedValue: string | null;
  initialState: IFieldState;
  onChange: (state: IFieldState) => void;
}

const MergePhoneNumber = (props: IMergePhoneNumberProps) => {
  const { databaseValue, fieldName, importedValue, initialState, onChange } = props;
  const { t } = useTranslation("rally");
  const [state, setState] = useState<IFieldState>(initialState);
  const normalizePhone = useCallback(
    (phone: string | null): string => {
      const raw = (phone ?? "").replace(/\D/g, "");
      return (raw.length === 10) ? `+1${raw}` : (phone ?? "");
    },
    []
  );
  const formatPhone = useCallback(
    (phone: string | null): string => {
      return formatPhoneNumber(normalizePhone(phone)) ?? "";
    },
    []
  );
  const handleChange = useCallback(
    (newState: IFieldState) => {
      setState(newState);
      onChange?.(newState);
    },
    [onChange]
  );
  const options = useMemo(
    () => {
      return [
        { key: "imported", text: `${t("wizard.page3.source.imported")}: ${formatPhone(importedValue)}` },
        { key: "db", text: `${t("wizard.page3.source.db")}: ${formatPhone(databaseValue)}` },
        { key: "custom", text: t("wizard.page3.source.custom") }
      ];
    },
    [formatPhone, importedValue, databaseValue, t]
  );
  return (<div className={styles.mergeField}>
    <Text className={styles.fieldName} variant="small" block>
      {t(`fields.${fieldName}`, fieldName)}
    </Text>
    {databaseValue != null
      ? (
        <div className={styles.layout}>
          <div>
            <Dropdown
              defaultSelectedKey={state.source}
              options={options}
              onChange={(_, option) => (handleChange({ ...state, source: option?.key as IFieldState["source"] }))}
            />
          </div>
          {state.source === "custom" && (
            <div>
              <PhoneInputWithCountrySelect
                className={styles.phone}
                defaultCountry="US"
                value={normalizePhone(state.customValue)}
                placeholder={t("wizard.page3.enterValue", "Enter value")}
                onChange={(value) => (handleChange({ ...state, customValue: value ?? "" }))}
              />
            </div>
          )}
        </div>
      ) : (
        <PhoneInputWithCountrySelect
          className={styles.phone}
          defaultCountry="US"
          value={normalizePhone(state.customValue)}
          placeholder={t("wizard.page3.enterValue", "Enter value")}
          onChange={(value) => (handleChange({ ...state, customValue: value ?? "" }))}
        />
      )
    }
  </div>);
};
MergePhoneNumber.displayName = "MergePhoneNumber";

export default MergePhoneNumber;