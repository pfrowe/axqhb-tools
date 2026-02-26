import { useMemo } from "react";
import { Dropdown, DefaultButton, MessageBar, MessageBarType, PrimaryButton, Stack, StackItem, Text } from "@fluentui/react";
import { MAPPED_FIELDS, MappedField, usePopulateSingersContext } from "../../contexts/PopulateSingersContext";
import { useTranslation } from "react-i18next";

interface IWizardPage2Props {
  handleFieldMappingChange: (importedField: string, targetField: MappedField) => void;
  localFieldMapping: Record<string, MappedField>;
  onNext: () => void;
  onPrevious: () => void;
}

const WizardPage2 = ({ handleFieldMappingChange, localFieldMapping, onNext, onPrevious }: IWizardPage2Props) => {
  const context = usePopulateSingersContext();
  const { t } = useTranslation("rally");

  const fieldOptions = useMemo(
    () => {
      const mapOption = (field: MappedField) => (
        { key: field, text: t(`fields.${field}`, field.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())) }
      );
      const sortOption = (a: { text: string }, b: { text: string }) => a.text.localeCompare(b.text);
      return MAPPED_FIELDS.map(mapOption).sort(sortOption);
    },
    []
  );

  // Extract field names from the first row of parsed data
  const importedFields = useMemo(
    () => (context.parsedData?.[0] ? Object.keys(context.parsedData[0]) : []),
    [context.parsedData]
  );

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="large" block>
        {t("wizard.page2.title", "Map Fields")}
      </Text>
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

          <div style={{
            borderRadius: "4px",
            display: "grid",
            gap: "20px",
            gridTemplateColumns: "1fr 1fr",
            padding: "20px",
          }}>
            {importedFields.map(importedField => (
              <Stack key={importedField} tokens={{ childrenGap: 8 }}>
                <Text variant="small" style={{ fontWeight: 600 }}>
                  {importedField}
                </Text>
                <Dropdown
                  placeholder={t("wizard.page2.dropdownPlaceholder", "Select a target field...")}
                  options={fieldOptions}
                  selectedKey={localFieldMapping?.[importedField] || ""}
                  onChange={(_, option) => handleFieldMappingChange(importedField, option?.key as MappedField)}
                  style={{ maxWidth: "300px" }}
                />
                {context.parsedData && context.parsedData.length > 0 && (
                  <Text variant="xSmall" style={{ color: "#666", fontStyle: "italic" }}>
                    Example: {String(context.parsedData[0][importedField]).substring(0, 50)}
                    {String(context.parsedData[0][importedField]).length > 50 ? "..." : ""}
                  </Text>
                )}
              </Stack>
            ))}
          </div>
          <MessageBar messageBarType={MessageBarType.info}>
            {t("wizard.page2.info", "Map each imported field to a corresponding singer database field. Fields left unmapped will be ignored.")}
          </MessageBar>
        </>
      ) : (
        <MessageBar messageBarType={MessageBarType.warning}>
          {t("wizard.page2.noFields", "No fields found in the Excel file.")}
        </MessageBar>
      )}

      <Stack horizontal tokens={{ childrenGap: 10 }} horizontalAlign="space-between">
        <StackItem>
          <DefaultButton text={t("wizard.action.previous", "Previous")} onClick={onPrevious} />
        </StackItem>
        <StackItem>
          <PrimaryButton text={t("wizard.action.next", "Next")} onClick={onNext} disabled={importedFields.length === 0} />
        </StackItem>
      </Stack>
    </Stack>
  );
};
WizardPage2.displayName = "WizardPage2";

export default WizardPage2;