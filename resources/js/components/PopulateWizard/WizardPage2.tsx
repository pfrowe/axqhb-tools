import React, { useCallback, useMemo } from "react";
import { Dropdown, Button, MessageBar, Text, OptionOnSelectData, Option } from "@fluentui/react-components";
import { MAPPED_FIELDS, MappedField, usePopulateSingersContext } from "../../contexts/PopulateSingersContext";
import { useTranslation } from "react-i18next";
import styles from "./Wizard.module.scss";

interface IWizardPage2Props {
  handleFieldMappingChange: (importedField: string, targetField: MappedField) => void;
  localFieldMapping: Record<string, MappedField>;
  onNext: () => void;
  onPrevious: () => void;
}
const WizardPage2 = ({ handleFieldMappingChange, localFieldMapping, onNext, onPrevious }: IWizardPage2Props) => {
  const context = usePopulateSingersContext();
  const { t } = useTranslation("rally");
  // Extract field names from the first row of parsed data
  const importedFields = useMemo(
    () => (context.parsedData?.[0] ? Object.keys(context.parsedData[0]) : []),
    [context.parsedData]
  );
  const mapImportField = useCallback(
    (importedField: string) => {
      interface IOption { key: string; text: string }
      const mapField = (field: MappedField): IOption => (
        { key: field, text: t(`fields.${field}`, field.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())) }
      );
      const mapOption = (field: IOption) => (<Option key={field.key} value={field.key}>{field.text}</Option>);
      const onChangeDestination = (_: React.ChangeEvent<HTMLInputElement>, { optionValue }: OptionOnSelectData) =>
        handleFieldMappingChange(importedField, optionValue as MappedField);
      const sortOption = (left: IOption, right: IOption) => (left.text.localeCompare(right.text));
      return (<div key={importedField} className={styles["imported-field-cell"]}>
        <Text>{importedField}</Text>
        <Dropdown
          defaultSelectedOptions={[localFieldMapping?.[importedField] || ""]}
          placeholder={t("wizard.page2.dropdownPlaceholder", "Select a target field...")}
          onOptionSelect={onChangeDestination}
          style={{ maxWidth: "300px" }}
        >{MAPPED_FIELDS.map(mapField).sort(sortOption).map(mapOption)}</Dropdown>
        {(context.parsedData && context.parsedData.length > 0)
          ? (
            <Text className={styles.hint} size={200}>
              {t("wizard.page2.example", "Example")}: {String(context.parsedData[0][importedField]).substring(0, 50)}
            </Text>
          )
          : (<></>)
        }
      </div>);
    },
    [context.parsedData, handleFieldMappingChange, importedFields, localFieldMapping, t]
  );
  return (
    <div className={styles["flex--vertical"]}>
      <Text block size={500}>{t("wizard.page2.title", "Map Fields")}</Text>
      <Text block>
        {t("wizard.page2.description", "Map the columns from your Excel file to the singer database fields.")}
      </Text>
      {importedFields.length > 0 ? (
        <>
          <Text block>
            {t(
              "wizard.page2.fieldsFound",
              `Found ${importedFields.length} field(s) in the Excel file:`,
              { count: importedFields.length }
            )}
          </Text>
          <div className={styles["imported-fields-grid"]}>{importedFields.map(mapImportField)}</div>
          <MessageBar intent="info">
            {t("wizard.page2.info", "Map each imported field to a corresponding singer database field. Fields left unmapped will be ignored.")}
          </MessageBar>
        </>
      ) : (
        <MessageBar intent="warning">
          {t("wizard.page2.noFields", "No fields found in the Excel file.")}
        </MessageBar>
      )}
      <div className={styles["horizontal-navigation"]}>
        <Button appearance="secondary" onClick={onPrevious}>
          {t("wizard.action.previous", "Previous")}
        </Button>
        <Button appearance="primary" onClick={onNext} disabled={importedFields.length === 0}>
          {t("wizard.action.next", "Next")}
        </Button>
      </div>
    </div>
  );
};
WizardPage2.displayName = "WizardPage2";
export default WizardPage2;