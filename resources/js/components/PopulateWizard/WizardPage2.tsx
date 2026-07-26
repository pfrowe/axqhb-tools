import React, { useCallback, useMemo } from "react";
import { Button, MessageBar, OptionOnSelectData, Text } from "@fluentui/react-components";
import { MappedField, MappedValue, usePopulateSingersContext } from "../../contexts/PopulateSingersContext";
import { useTranslation } from "react-i18next";
import styles from "./Wizard.module.scss";
import FieldMapping from "./FieldMapping";
interface IWizardPage2Props {
  localFieldMapping: Record<string, MappedField>;
  localValueMapping: Record<string, MappedValue>;
  onFieldMappingChange: (importedField: string, targetField: MappedField) => void;
  onNext: () => void;
  onPrevious: () => void;
  onValueMappingChange: (importedField: string, update: MappedValue) => void;
}
const WizardPage2 = ({
  localFieldMapping, localValueMapping, onFieldMappingChange, onNext, onPrevious, onValueMappingChange
}: IWizardPage2Props) => {
  const context = usePopulateSingersContext();
  const { t } = useTranslation("rally");
  const importedFields = useMemo(
    () => (context.parsedData?.[0] ? Object.keys(context.parsedData[0]) : []),
    [context.parsedData]
  );
  const handleChangeDestination = useCallback(
    (importedField: string) => (_: React.ChangeEvent<HTMLInputElement>, { optionValue }: OptionOnSelectData) => {
      onFieldMappingChange(importedField, optionValue as MappedField);
    },
    [onFieldMappingChange]
  );
  const handleChangeValueMapping = useCallback(
    (importedField: string, update: MappedValue) => { onValueMappingChange(importedField, update); },
    []
  );
  const mapImportField = useCallback(
    (importedField: string) => (
      <FieldMapping
        defaultValue={localFieldMapping[importedField]}
        importedField={importedField}
        key={`fieldMapping--${importedField}`}
        localValueMapping={localValueMapping}
        onChangeFieldMapping={handleChangeDestination}
        onChangeValueMapping={handleChangeValueMapping}
      />
    ),
    [handleChangeDestination, handleChangeValueMapping, localFieldMapping, localValueMapping]
  );
  return (
    <div className={styles["flex--vertical"]}>
      <Text block size={500}>
        {t("wizard.page2.title", "Map Fields")}
      </Text>
      <Text block>
        {t(
          "wizard.page2.description",
          "Map the columns from your Excel file to the singer database fields."
        )}
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
            {t(
              "wizard.page2.info",
              "Map each imported field to a corresponding singer database field. Fields left unmapped will be ignored."
            )}
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