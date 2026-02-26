import { MessageBar, MessageBarType, ProgressIndicator, Stack, Text } from "@fluentui/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePopulateSingersContext } from "../../contexts/PopulateSingersContext";

const WizardPage4 = () => {
  const { t } = useTranslation("rally");
  const { operationProgress: { completed, currentOperation, error, status, total } } = usePopulateSingersContext();
  const completion = useMemo(() => total > 0 ? completed / total : 0, [completed, total]);
  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Stack tokens={{ childrenGap: 10 }}>
        <Text variant="large" block>
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
        <ProgressIndicator
          percentComplete={completion}
          label={total
            ? `${Math.round(completion * 100)}% - ${completed || 0} / ${total || 0}`
            : undefined
          }
        />
        {status === "completed"
          ? (
            <MessageBar messageBarType={MessageBarType.success}>
              {t("wizard.page4.success", "All {{count}} operations completed successfully!",
                { count: completed || 0 })}
            </MessageBar>
          ) : (<></>)
        }
        {status === "error"
          ? (
            <MessageBar messageBarType={MessageBarType.error}>
              {error || t("wizard.page4.genericError", "An error occurred during import")}
            </MessageBar>
          ) : (<></>)
        }
      </Stack>
    </Stack>
  );
};
WizardPage4.displayName = "WizardPage4";

export default WizardPage4;