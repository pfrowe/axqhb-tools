import { Button, MessageBar, Text } from "@fluentui/react-components";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { usePopulateSingersContext } from "../../contexts/PopulateSingersContext";

import styles from "./Wizard.module.scss";

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
    <div className={styles["flex--vertical"]}>
      <Text block size={500}>{t("wizard.page1.title", "Select an Excel File")}</Text>
      <Text block>
        {t("wizard.page1.description", "Choose an Excel file containing singer information. The first worksheet will be read and imported.")}
      </Text>
      {context.parseError && (
        <MessageBar intent="error">
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
      <div className={styles["flex--horizontal"]}>
        <Button appearance="secondary" onClick={() => fileInputRef.current?.click()}>
          {t("wizard.action.selectFile", "Select File")}
        </Button>
        {context.excelFile && (<Text>{context.excelFile.name}</Text>)}
      </div>
      <div className={[styles["flex--horizontal"], styles["flex--justify-content--flex-end"]].join(" ")}>
        <Button
          appearance="primary"
          onClick={handleSubmitFile}
          disabled={!context.excelFile}
        >
          {t("wizard.action.next", "Next")}
        </Button>
      </div>
    </div>
  );
};
WizardPage1.displayName = "WizardPage1";

export default WizardPage1;