import { DefaultButton, MessageBar, MessageBarType, PrimaryButton, Stack, StackItem, Text } from "@fluentui/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { usePopulateSingersContext } from "../../contexts/PopulateSingersContext";

interface IWizardPage1Props {
  onFileSelected: (file: File) => void;
  onNext: () => void;
}

const WizardPage1 = ({ onFileSelected, onNext }: IWizardPage1Props) => {
  const { t } = useTranslation("rally");
  const context = usePopulateSingersContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };
  const handleSubmitFile = () => {
    if (context.excelFile) {
      onNext();
    }
  };
  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="large" block>
        {t("wizard.page1.title", "Select an Excel File")}
      </Text>
      <Text block>
        {t("wizard.page1.description", "Choose an Excel file containing singer information. The first worksheet will be read and imported.")}
      </Text>

      {context.parseError && (
        <MessageBar messageBarType={MessageBarType.error}>
          {context.parseError}
        </MessageBar>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />

      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <StackItem>
          <DefaultButton
            text={t("wizard.action.selectFile", "Select File")}
            onClick={() => fileInputRef.current?.click()}
          />
        </StackItem>
        {context.excelFile && (
          <StackItem>
            <Text>{context.excelFile.name}</Text>
          </StackItem>
        )}
      </Stack>

      <Stack horizontal tokens={{ childrenGap: 10 }} horizontalAlign="end">
        <StackItem>
          <PrimaryButton
            text={t("wizard.action.next", "Next")}
            onClick={handleSubmitFile}
            disabled={!context.excelFile}
          />
        </StackItem>
      </Stack>
    </Stack>
  );
};
WizardPage1.displayName = "WizardPage1";

export default WizardPage1;