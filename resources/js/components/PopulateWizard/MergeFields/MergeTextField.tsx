import { Dropdown, Input, Option, OptionOnSelectData, Text } from "@fluentui/react-components";
import { useCallback, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { IFieldState } from "../../../contexts/PopulateSingersContext";

import styles from "../EditableSingerCard.module.scss";

interface IMergeTextFieldProps {
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

const MergeTextField: React.FC<IMergeTextFieldProps> = (props: IMergeTextFieldProps) => {
  const { databaseValue, fieldName, importedValue, initialState, onChange } = props;
  const { t } = useTranslation("rally");
  const mergeState = useCallback((prev: IFieldState, next: Partial<IFieldState>) => ({ ...prev, ...next }), []);
  const [state, setState] = useReducer(mergeState, initialState);
  const handleChange = useCallback(
    (newState: IFieldState) => {
      setState(newState);
      onChange?.(newState);
    },
    [onChange]
  );
  const onChangeSource = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, { optionValue }: OptionOnSelectData) =>
      (handleChange({ source: optionValue as IFieldState["source"] })),
    [handleChange]
  );
  const options = useMemo(
    (): IOptionProps[] => ([
      {
        display: <>{`${t("wizard.page3.source.imported")}: ${importedValue}`}</>,
        key: "imported",
        text: `${t("wizard.page3.source.imported")}: ${importedValue}`,
        value: "imported"
      },
      {
        display: <>{`${t("wizard.page3.source.db")}: ${databaseValue}`}</>,
        key: "db",
        text: `${t("wizard.page3.source.db")}: ${databaseValue}`,
        value: "db"
      },
      {
        display: <>{t("wizard.page3.source.custom")}</>,
        key: "custom",
        text: t("wizard.page3.source.custom"),
        value: "custom"
      },
    ]),
    [importedValue, databaseValue, t]
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
          <div>
            <Dropdown
              defaultSelectedOptions={[state.source]}
              defaultValue={options.find((o) => (o.value === state.source))?.text}
              onOptionSelect={onChangeSource}
            >{options.map(mapOption)}</Dropdown>
          </div>
          {state.source === "custom" && (
            <div>
              <Input
                defaultValue={state.customValue ?? ""}
                placeholder={t("wizard.page3.enterValue", "Enter value")}
                onChange={(_, data) => (handleChange({ ...state, customValue: data.value }))}
              />
            </div>
          )}
        </div>
      ) : (
        <Input
          defaultValue={state.customValue ?? ""}
          placeholder={t("wizard.page3.enterValue", "Enter value")}
          onChange={(_, data) => (handleChange({ ...state, customValue: data.value }))}
        />
      )
    }
  </div>);
};

export default MergeTextField;