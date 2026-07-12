import { MessageBar, ProgressBar, Text } from "@fluentui/react-components";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePopulateSingersContext } from "../../contexts/PopulateSingersContext";

import styles from "./Wizard.module.scss";

const WizardPage4 = () => {
  const { t } = useTranslation("rally");
  const { operationProgress: { completed, currentOperation, error, status, total } } = usePopulateSingersContext();
  const completion = useMemo(() => total > 0 ? completed / total : 0, [completed, total]);
  return (
    <div className={styles["flex-vertical"]}>
      <div className={styles["flex-vertical"]}>
        <Text block size={500}>
          {status === "completed"
            ? t("wizard.page4.completed", "Import completed!")
            : status === "error"
              ? t("wizard.page4.failed", "Import failed")
              : t("wizard.page4.processing", "Processing...")}
        </Text>
        {currentOperation !== ""
          ? (
            <Text block>
              {t("wizard.page4.currentOperation", "Current: {{operation}}", { operation: currentOperation })}
            </Text>
          ) : (<></>)
        }
        <ProgressBar
          content={total
            ? `${Math.round(completion * 100)}% - ${completed || 0} / ${total || 0}`
            : undefined
          }
          value={completion}
        />
        {status === "completed"
          ? (
            <MessageBar intent="success">
              {t("wizard.page4.success", "All {{count}} operations completed successfully!",
                { count: completed || 0 })}
            </MessageBar>
          ) : (<></>)
        }
        {status === "error"
          ? (
            <MessageBar intent="error">
              {error || t("wizard.page4.genericError", "An error occurred during import")}
            </MessageBar>
          ) : (<></>)
        }
      </div>
    </div>
  );
};
WizardPage4.displayName = "WizardPage4";

export default WizardPage4;