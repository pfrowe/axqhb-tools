import { Dropdown, Text, TextField } from "@fluentui/react";
import { useCallback, useMemo, useState } from "react";
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

const MergeTextField: React.FC<IMergeTextFieldProps> = (props: IMergeTextFieldProps) => {
  const { databaseValue, fieldName, importedValue, initialState, onChange } = props;
  const { t } = useTranslation("rally");
  const [state, setState] = useState<IFieldState>(initialState);
  const handleChange = useCallback(
    (newState: IFieldState) => {
      setState(newState);
      onChange?.(newState);
    },
    [onChange]
  );
  const options = useMemo(
    () => ([
      { key: "imported", text: `${t("wizard.page3.source.imported")}: ${importedValue ?? ""}` },
      { key: "db", text: `${t("wizard.page3.source.db")}: ${databaseValue ?? ""}` },
      { key: "custom", text: t("wizard.page3.source.custom") }
    ]),
    [importedValue, databaseValue, t]
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
              <TextField
                defaultValue={state.customValue ?? ""}
                placeholder={t("wizard.page3.enterValue", "Enter value")}
                onChange={(_, value) => (handleChange({ ...state, customValue: value }))}
              />
            </div>
          )}
        </div>
      ) : (
        <TextField
          defaultValue={state.customValue ?? ""}
          placeholder={t("wizard.page3.enterValue", "Enter value")}
          onChange={(_, value) => (handleChange({ ...state, customValue: value }))}
        />
      )
    }
  </div>);
};

export default MergeTextField;