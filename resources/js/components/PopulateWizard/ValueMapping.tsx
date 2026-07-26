import * as Fluent from "@fluentui/react-components";
import * as React from "react";
import { fieldsToMap, MappedValue, usePopulateSingersContext } from "../../contexts/PopulateSingersContext";
import styles from "./Wizard.module.scss";
import { useTranslation } from "react-i18next";

interface IValueMappingProps {
  importedField: string;
  localValueMapping: Record<string, MappedValue>;
  onChangeValueMapping: (importedField: string, update: MappedValue) => void;
  targetField: string;
}

const ValueMapping = ({ importedField, localValueMapping, onChangeValueMapping, targetField }: IValueMappingProps) => {
  const { parsedData } = usePopulateSingersContext();
  const { t } = useTranslation("rally");
  const handleChangeValueMapping = React.useCallback(
    (sourceValue: string) => (_: React.ChangeEvent<HTMLInputElement>, { optionValue }: Fluent.OptionOnSelectData) => {
      onChangeValueMapping(importedField, { [sourceValue]: optionValue });
    },
    [importedField, onChangeValueMapping]
  );
  const importedFieldValues = React.useMemo(
    () => (Array.from(new Set(parsedData.map((record) => (record[importedField])))).sort()),
    [importedField, parsedData]
  );
  const optionsValueMapping = React.useMemo(
    () => {
      const mapValueToOption = (value: string, index: number) => (
        <Fluent.Option key={`${targetField}__option--${index}`} value={value}>
          {t(`wizard.${targetField}.${value}`)}
        </Fluent.Option>
      );
      const targetValues = fieldsToMap[targetField] ?? [];
      return (<>{targetValues.map(mapValueToOption)}</>);
    },
    [targetField]
  );
  const thisValueMapping = React.useMemo(
    () => (localValueMapping[importedField] ?? {}),
    [importedField, localValueMapping]
  );
  const mapValueMappingRow = React.useCallback(
    (value: unknown) => {
      const valueString = (value ?? "").toString();
      const valueSelected = thisValueMapping[valueString];
      return (<div key={`${targetField}--${valueString}`} className={styles["mapped-value-row"]}>
        <Fluent.Input disabled={true} value={valueString} />
        <Fluent.Dropdown
          defaultSelectedOptions={[valueSelected]}
          defaultValue={(valueSelected !== undefined) ? t(`wizard.${targetField}.${valueSelected}`) : undefined}
          placeholder={t("wizard.page2.valueMappingPlaceholder", "Select mapped value…")}
          onOptionSelect={handleChangeValueMapping(valueString)}
          style={{ minWidth: "140px" }}
        >{optionsValueMapping}</Fluent.Dropdown>
      </div>);
    },
    [handleChangeValueMapping, optionsValueMapping, t, targetField, thisValueMapping]
  );
  return (<Fluent.Dialog>
    <Fluent.DialogTrigger>
      <Fluent.Button appearance="secondary">{t("wizard.page2.mapValues", "Map Values")}</Fluent.Button>
    </Fluent.DialogTrigger>
    <Fluent.DialogSurface>
      <Fluent.DialogBody>
        <Fluent.DialogTitle>{t("wizard.page2.mapValues", "Map Values")}</Fluent.DialogTitle>
        <Fluent.DialogContent className={styles["mapped-value-list"]}>
          {importedFieldValues.map(mapValueMappingRow)}
        </Fluent.DialogContent>
        <Fluent.DialogTrigger>
          <Fluent.Button appearance="primary">{t("wizard.page2.close", "Close")}</Fluent.Button>
        </Fluent.DialogTrigger>
      </Fluent.DialogBody>
    </Fluent.DialogSurface>
  </Fluent.Dialog>);
};
ValueMapping.displayName = "ValueMapping";

export default ValueMapping;