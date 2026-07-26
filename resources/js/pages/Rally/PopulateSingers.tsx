import { Button, ProgressBar, Text } from "@fluentui/react-components";
import { useMachine } from "@xstate/react";
import { useCallback, useContext, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { PopulateSingers as machineDefinition } from "../Machines";
import { AppContext } from "../../contexts";
import { WizardPage1, WizardPage2, WizardPage3, WizardPage4 } from "../../components/PopulateWizard";
import PopulateSingersContext, { IFieldState, MappedField, MappedValue } from "../../contexts/PopulateSingersContext";

import styles from "./Rally.module.scss";

const WIZARD_PAGES = ["requestExcel", "mapFields", "reviewMatches", "writing", "completed"];

const PopulateSingers = () => {
  const { setTitle } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation("rally");
  const [{ context, value: state }, send] = useMachine(machineDefinition);
  const [localFieldMapping, setLocalFieldMapping] = useState<Record<string, MappedField>>({});
  interface ValueMappingMerge {
    action: "reset" | "update";
    field: string;
    value: MappedValue;
  }
  const mergeValueMapping = (
    prev: Record<string, MappedValue>, { action, field, value }: ValueMappingMerge
  ): Record<string, MappedValue> => {
    const valueNext = { ...prev };
    if (action === "reset") {
      delete valueNext[field];
    } else {
      valueNext[field] = { ...valueNext[field], ...value };
    }
    return valueNext;
  };
  const [localValueMapping, setLocalValueMapping] = useReducer(mergeValueMapping, {});
  useEffect(() => (setTitle(t("title.populateSingers")), undefined), [setTitle, t]);
  useEffect(() => (send({ type: "INIT", params: { id } }), undefined), []);

  const handleFileInputChange = useCallback(
    (file: File): void => { send({ type: "FILE_SELECTED", params: { file } }); },
    [send]
  );

  const handleSubmitFile = useCallback(
    () => { context.excelFile && send({ type: "SUBMIT_FILE" }) },
    [context.excelFile, send]
  );

  const onFieldMappingChange = useCallback(
    (importedField: string, targetField: MappedField) => {
      setLocalFieldMapping(prev => ({ ...prev, [importedField]: targetField }));
    },
    [setLocalFieldMapping]
  );

  const onValueMappingChange = useCallback(
    (importedField: string, update: MappedValue) => {
      setLocalValueMapping({
        action: Object.keys(update).length > 0 ? "update" : "reset",
        field: importedField,
        value: update
      })
    },
    [setLocalValueMapping]
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
      const onNext = () => {
        send({ type: "NEXT", params: { fieldMapping: localFieldMapping, valueMapping: localValueMapping } });
      }
      const onPrevious = () => { send({ type: "PREVIOUS" }); }
      const props = {
        localFieldMapping,
        onFieldMappingChange,
        onValueMappingChange,
        localValueMapping,
        onNext,
        onPrevious
      };
      return (<WizardPage2 {...props} />);
    },
    [onFieldMappingChange, localFieldMapping, onValueMappingChange, localValueMapping, send]
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
      <div className={styles["flex-vertical"]}>
        <Text align="center" block size={500}>{t("wizard.page5.title", "Import Completed")}</Text>
        <Text align="center" block>
          {t("wizard.page5.description", "The singers have been successfully imported.")}
        </Text>
        <Button
          appearance="primary"
          onClick={() => (navigate(`/rally/view/${id}`), undefined)}
        >{t("wizard.action.finish", "Finish")}</Button>
      </div>
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
          <div className={styles["flex-vertical"]}><Text>{t("wizard.loading", "Parsing Excel file...")}</Text></div>
        );
      }
      return renderPage();
    },
    [getPageNumber, renderPage1, renderPage2, renderPage3, renderPage4, renderPage5, t]
  );

  return (
    <main id="main">
      <h1 className={[styles["margin--revert"], styles["text-align--center"]].join(" ")}>
        {t("title.populateSingers")}
      </h1>
      <h2 className={[styles["margin--revert"], styles["text-align--center"]].join(" ")}>{context.rally?.name}</h2>
      {isOnWizardPage() && (
        <PopulateSingersContext.Provider value={context}>
          <div className={styles["flex-vertical"]}>
            <Text block size={300}>
              {t("wizard.step", "Step {{current}} of {{total}}", { current: getPageNumber(), total: WIZARD_PAGES.length })}
            </Text>
            <ProgressBar value={getPageNumber() / WIZARD_PAGES.length} />
            {renderWizardContent()}
          </div>
        </PopulateSingersContext.Provider>
      )}
    </main>
  );
};
PopulateSingers.displayName = "PopulateSingers";

export default PopulateSingers;