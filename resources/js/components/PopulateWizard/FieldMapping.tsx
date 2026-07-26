import { Dropdown, Option, OptionOnSelectData, Text } from "@fluentui/react-components";
import { ChangeEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import ValueMapping from "./ValueMapping";
import {
  fieldsToMap, MAPPED_FIELDS, MappedField, MappedValue, usePopulateSingersContext
} from "../../contexts/PopulateSingersContext";
import styles from "./Wizard.module.scss";

interface IFieldMappingProps {
  defaultValue: MappedField;
  importedField: string;
  localValueMapping: Record<string, MappedValue>;
  onChangeFieldMapping: (importedField: string, targetField: MappedField) => void;
  onChangeValueMapping: (importedField: string, update: MappedValue) => void;
}

const FieldMapping = (
  { defaultValue, importedField, localValueMapping, onChangeFieldMapping, onChangeValueMapping }: IFieldMappingProps
) => {
  const { parsedData } = usePopulateSingersContext();
  const [targetField, setTargetField] = useState(defaultValue);
  const { t } = useTranslation("rally");
  const handleChangeFieldMapping = useCallback(
    (_: ChangeEvent<HTMLInputElement>, { optionValue }: OptionOnSelectData) => {
      onChangeFieldMapping(importedField, optionValue as MappedField);
      onChangeValueMapping(importedField, {});
      setTargetField(optionValue as MappedField);
    },
    [importedField, onChangeFieldMapping, onChangeValueMapping]
  );
  interface IOption { key: string; text: string; }
  const mapField = useCallback(
    (field: MappedField): IOption => ({
      key: field,
      text: t(`fields.${field}`, field.replace(/_/g, " ").replace(/\b\w/g, (capital) => capital.toUpperCase()))
    }),
    [t]
  );
  const mapOption = useCallback(
    (field: IOption) => (<Option key={field.key} value={field.key}>{field.text}</Option>),
    []
  );
  const sortOption = useCallback((left: IOption, right: IOption) => (left.text.localeCompare(right.text)), []);
  return (
    <div key={importedField} className={styles["imported-field-cell"]}>
      <Text>{importedField}</Text>
      <div className={styles["imported-field-inputs"]}>
        <Dropdown
          defaultSelectedOptions={defaultValue ? [defaultValue] : []}
          placeholder={t("wizard.page2.dropdownPlaceholder", "Select a target field…")}
          onOptionSelect={handleChangeFieldMapping}
        >{MAPPED_FIELDS.map(mapField).sort(sortOption).map(mapOption)}</Dropdown>
        {(fieldsToMap[targetField] != null)
          ? (<ValueMapping {...{ importedField, localValueMapping, onChangeValueMapping, targetField }} />)
          : (<></>)
        }
      </div>
      {parsedData?.length > 0
        ? (
          <Text className={styles.hint} size={200}>
            {t("wizard.page2.example", "Example")}:{" "}
            {String(parsedData[0][importedField]).substring(0, 50)}
          </Text>
        ) : (<></>)
      }
    </div>
  );
};
FieldMapping.displayName = "FieldMapping";
export default FieldMapping;