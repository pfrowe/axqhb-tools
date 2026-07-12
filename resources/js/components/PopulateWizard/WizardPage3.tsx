import { Button, Text } from "@fluentui/react-components";
import { ChevronDownRegular, ChevronUpRegular } from "@fluentui/react-icons";
import { useCallback, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import EditableSingerCard from "./EditableSingerCard";
import { IFieldState, usePopulateSingersContext } from "../../contexts/PopulateSingersContext";

import styles from "./Wizard.module.scss";

interface IWizardPage3Props {
  onNext: (cardEdits: Record<number, Record<string, IFieldState>>) => void;
  onPrevious: () => void;
}

const WizardPage3: React.FC<IWizardPage3Props> = ({ onNext, onPrevious }) => {
  const { matchedSingers } = usePopulateSingersContext();
  const navigateCard = useCallback(
    (prev: number, direction: "next" | "previous") => {
      const adjustment = direction === "next" ? 1 : -1;
      return Math.min(Math.max(prev + adjustment, 0), matchedSingers?.length ? matchedSingers.length - 1 : 0);
    },
    [matchedSingers]
  );
  const [currentCardIndex, navigateSingers] = useReducer(navigateCard, 0);
  const { t } = useTranslation("rally");
  const [cardEdits, setCardEdits] = useState<Record<number, Record<string, IFieldState>>>({});
  const totalCards = useMemo(() => (matchedSingers.length), [matchedSingers]);
  const isFirstCard = useMemo(() => (currentCardIndex < 1), [currentCardIndex]);
  const isLastCard = useMemo(() => (currentCardIndex >= totalCards - 1), [currentCardIndex, totalCards]);
  const currentSinger = useMemo(() => (matchedSingers[currentCardIndex]), [currentCardIndex, matchedSingers]);
  const score = useMemo(
    () => ((currentSinger?.matchScore && typeof currentSinger.matchScore === "number") ? currentSinger.matchScore : 0),
    [currentSinger]
  );
  const registered = useMemo(() => (currentSinger?.registration?.isRegistered ?? false), [currentSinger]);
  const onChange = useCallback(
    (index: number, update: Record<string, IFieldState>) => {
      setCardEdits((prev) => ({ ...prev, [index]: update }));
    },
    [setCardEdits]
  );
  const onNavigate = useCallback(
    (direction: "next" | "previous") => () => (navigateSingers(direction)),
    [navigateSingers]
  );
  return (totalCards > 0)
    ? (
      <div className={styles["flex--vertical"]}>
        <Text block size={500}>
          {t("wizard.page3.title", "Review Data")}
        </Text>
        <Text block>
          {t("wizard.page3.description", "Review the data that will be imported based on your field mappings. Make sure everything looks correct before proceeding.")}
        </Text>
        <div className={styles["flex--horizontal"]}>
          <div style={{ flex: 1 }}>
            <EditableSingerCard
              dbSinger={currentSinger?.matched ?? {}}
              imported={currentSinger?.imported ?? {}}
              index={currentCardIndex}
              initialState={cardEdits[currentCardIndex] ?? {}}
              key={`singer--${currentCardIndex}`}
              onChange={onChange}
              registered={registered}
              score={score}
            />
          </div>
          <div>
            <div className={styles["vertical-navigation"]}>
              <Button
                disabled={isFirstCard}
                onClick={onNavigate("previous")}
                title={t("wizard.page3.previousSinger", "Previous Singer")}
              ><ChevronUpRegular /></Button>
              <Text className={styles.position} block>
                {currentCardIndex + 1} / {totalCards}
              </Text>
              <Button
                disabled={isLastCard}
                onClick={onNavigate("next")}
                title={t("wizard.page3.nextSinger", "Next Singer")}
              ><ChevronDownRegular /></Button>
            </div>
          </div>
        </div>

        <div className={styles["horizontal-navigation"]}>
          <Button
            appearance="secondary"
            onClick={onPrevious}
          >
            {t("wizard.action.previous", "Previous")}
          </Button>
          <Button
            appearance="primary"
            onClick={() => (onNext(cardEdits))}
          >
            {t("wizard.action.next", "Next")}
          </Button>
        </div>
      </div>
    ) : (
      <div className={styles["vertical-navigation"]}>
        <Text size={500} block>{t("wizard.page3.title", "Review Data")}</Text>
        <Text block>{t("wizard.page3.noSingers", "No singers to review.")}</Text>
      </div>
    );
};

export default WizardPage3;