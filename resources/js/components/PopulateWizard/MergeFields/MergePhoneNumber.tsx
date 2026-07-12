import { Dropdown, Option, OptionOnSelectData, Text } from "@fluentui/react-components";
import { useCallback, useMemo, useReducer } from "react";
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

interface IOptionProps {
  display: JSX.Element;
  key: string;
  text: string;
  value: string;
}

const MergePhoneNumber = (props: IMergePhoneNumberProps) => {
  const { databaseValue, fieldName, importedValue, initialState, onChange } = props;
  const { t } = useTranslation("rally");
  const mergeState = useCallback((prev: IFieldState, next: Partial<IFieldState>) => ({ ...prev, ...next }), []);
  const [state, setState] = useReducer(mergeState, initialState);
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
    [onChange, setState]
  );
  const onChangeSource = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, { optionValue }: OptionOnSelectData) =>
      (handleChange({ source: optionValue as IFieldState["source"] })),
    [handleChange]
  );
  const options = useMemo(
    (): IOptionProps[] => ([
      {
        display: <>{`${t("wizard.page3.source.imported")}: ${formatPhone(importedValue)}`}</>,
        key: "imported",
        text: `${t("wizard.page3.source.imported")}: ${formatPhone(importedValue)}`,
        value: "imported"
      },
      {
        display: <>{`${t("wizard.page3.source.db")}: ${formatPhone(databaseValue)}`}</>,
        key: "db",
        text: `${t("wizard.page3.source.db")}: ${formatPhone(databaseValue)}`,
        value: "db"
      },
      {
        display: <>{t("wizard.page3.source.custom")}</>,
        key: "custom",
        text: t("wizard.page3.source.custom"),
        value: "custom"
      },
    ]),
    [formatPhone, importedValue, databaseValue, t]
  );
  const mapOption = useCallback(
    ({ display, key, text, value }: IOptionProps) => (<Option key={key} text={text} value={value}>{display}</Option>),
    []
  );
  return (<div className={styles.mergeField}>
    <Text className={styles.fieldName} size={200} block>
      {t(`fields.${fieldName}`, fieldName)}
    </Text>
    {databaseValue != null
      ? (
        <div className={styles.layout}>
          <Dropdown
            defaultSelectedOptions={[state.source]}
            defaultValue={options.find((o) => (o.value === state.source))?.text}
            onOptionSelect={onChangeSource}
          >{options.map(mapOption)}</Dropdown>
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