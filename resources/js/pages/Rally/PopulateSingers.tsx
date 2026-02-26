import { PrimaryButton, Stack, Text, ProgressIndicator } from "@fluentui/react";
import { useMachine } from "@xstate/react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { PopulateSingers as machineDefinition } from "../Machines";
import { AppContext } from "../../contexts";
import { WizardPage1, WizardPage2, WizardPage3, WizardPage4 } from "../../components/PopulateWizard";
import PopulateSingersContext, { IFieldState, MappedField } from "../../contexts/PopulateSingersContext";
import styles from "./Rally.module.scss";

const WIZARD_PAGES = ["requestExcel", "mapFields", "reviewMatches", "writing", "completed"];

const PopulateSingers = () => {
  const { setTitle } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation("rally");
  const [{ context, value: state }, send] = useMachine(machineDefinition);
  const [localFieldMapping, setLocalFieldMapping] = useState<Record<string, MappedField>>({});

  useEffect(() => (setTitle(t("title.populateSingers")), undefined), [setTitle, t]);
  useEffect(() => (send({ type: "INIT", params: { id } }), undefined), []);

  const handleFileInputChange = useCallback(
    (file: File): void => { send({ type: "FILE_SELECTED", params: { file } }); },
    [send]
  );

  const handleFieldMappingChange = useCallback(
    (importedField: string, targetField: MappedField) => {
      setLocalFieldMapping(prev => ({ ...prev, [importedField]: targetField }));
    },
    [setLocalFieldMapping]
  );

  const handleSubmitFile = useCallback(
    () => { context.excelFile && send({ type: "SUBMIT_FILE" }) },
    [context.excelFile, send]
  );

  const getCurrentStateName = (): string => {
    return state;
  };

  const isOnWizardPage = (): boolean => {
    return context.show.wizard; // Assuming the wizard is shown when the "wizard" flag is true
  };

  const renderPage1 = useCallback(
    () => (<WizardPage1 onFileSelected={handleFileInputChange} onNext={handleSubmitFile} />),
    [handleFileInputChange, handleSubmitFile]
  );

  const renderPage2 = useCallback(
    () => {
      const onNext = () => { send({ type: "NEXT", params: { fieldMapping: localFieldMapping } }); }
      const onPrevious = () => { send({ type: "PREVIOUS" }); }
      return (<WizardPage2 {...{ handleFieldMappingChange, localFieldMapping, onNext, onPrevious }} />);
    },
    [handleFieldMappingChange, localFieldMapping, send]
  );

  const renderPage3 = useCallback(
    () => {
      const onNext = (cardEdits: Record<number, Record<string, IFieldState>>) => {
        send({ type: "NEXT", params: { cardEdits } });
      };
      const onPrevious = () => { send({ type: "PREVIOUS" }); };
      return (<WizardPage3 onNext={onNext} onPrevious={onPrevious} />);
    },
    [send]
  );

  const renderPage4 = useCallback(() => (<WizardPage4 />), []);

  const renderPage5 = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 20 }} horizontalAlign="center">
        <Text variant="large" block>
          {t("wizard.page5.title", "Import Completed")}
        </Text>
        <Text block>
          {t("wizard.page5.description", "The singers have been successfully imported.")}
        </Text>
        <PrimaryButton
          text={t("wizard.action.finish", "Finish")}
          onClick={() => (navigate(`/rally/view/${id}`), undefined)}
        />
      </Stack>
    ),
    [send, t]
  );

  const getPageNumber = useCallback(
    (): number => {
      const currentPage = getCurrentStateName();
      return WIZARD_PAGES.findIndex(page => currentPage.startsWith(page)) + 1;
    },
    [state]
  );

  const renderWizardContent = useCallback(
    () => {
      const currentPage = getCurrentStateName();
      const pageNumber = getPageNumber();
      const renderPages = [() => (null), renderPage1, renderPage2, renderPage3, renderPage4, renderPage5];
      const pageIndex = Math.max(0, Math.min(WIZARD_PAGES.length, pageNumber));
      const renderPage = renderPages[pageIndex];
      if (currentPage.startsWith("parsingFile")) {
        return (
          <Stack tokens={{ childrenGap: 20 }} horizontalAlign="center">
            <Text>{t("wizard.loading", "Parsing Excel file...")}</Text>
          </Stack>
        );
      }
      return renderPage();
    },
    [getPageNumber, renderPage1, renderPage2, renderPage3, renderPage4, renderPage5, t]
  );

  return (
    <main id="main">
      <h1 className={styles["text-align--center"]}>{t("title.populateSingers")}</h1>
      <h2 className={styles["text-align--center"]}>{context.rally?.name}</h2>

      {isOnWizardPage() && (
        <PopulateSingersContext.Provider value={context}>
          <Stack className={styles.stack} tokens={{ childrenGap: 20 }}>
            <Text variant="small" block>
              {t("wizard.step", "Step {{current}} of {{total}}", { current: getPageNumber(), total: WIZARD_PAGES.length })}
            </Text>
            <ProgressIndicator
              percentComplete={getPageNumber() / WIZARD_PAGES.length}
            />
            {renderWizardContent()}
          </Stack>
        </PopulateSingersContext.Provider>
      )}
    </main>
  );
};
PopulateSingers.displayName = "PopulateSingers";

export default PopulateSingers;