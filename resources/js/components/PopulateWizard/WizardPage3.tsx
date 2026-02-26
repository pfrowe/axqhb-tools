import { DefaultButton, IconButton, PrimaryButton, Stack, StackItem, Text } from "@fluentui/react";
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
      <Stack tokens={{ childrenGap: 20 }}>
        <Text variant="large" block>
          {t("wizard.page3.title", "Review Data")}
        </Text>
        <Text block>
          {t("wizard.page3.description", "Map the columns from your Excel file to the singer database fields.")}
        </Text>
        <Stack horizontal tokens={{ childrenGap: 20 }}>
          <StackItem grow>
            <EditableSingerCard
              key={currentCardIndex}
              index={currentCardIndex}
              imported={currentSinger?.imported ?? {}}
              dbSinger={currentSinger?.matched ?? {}}
              score={score}
              registered={registered}
              initialState={cardEdits[currentCardIndex]}
              onChange={onChange}
            />
          </StackItem>

          <StackItem>
            <Stack className={styles.navigation} horizontalAlign="center" verticalAlign="center" tokens={{ childrenGap: 10 }}>
              <IconButton
                iconProps={{ iconName: "ChevronUp" }}
                onClick={onNavigate("previous")}
                disabled={isFirstCard}
                title={t("wizard.page3.previousSinger", "Previous Singer")}
              />
              <Text className={styles.position} block>
                {currentCardIndex + 1} / {totalCards}
              </Text>
              <IconButton
                iconProps={{ iconName: "ChevronDown" }}
                onClick={onNavigate("next")}
                disabled={isLastCard}
                title={t("wizard.page3.nextSinger", "Next Singer")}
              />
            </Stack>
          </StackItem>
        </Stack>

        <Stack horizontal tokens={{ childrenGap: 10 }} horizontalAlign="space-between">
          <StackItem>
            <DefaultButton
              text={t("wizard.action.previous", "Previous")}
              onClick={onPrevious}
            />
          </StackItem>
          <StackItem>
            <PrimaryButton
              text={t("wizard.action.next", "Next")}
              onClick={() => (onNext(cardEdits))}
            />
          </StackItem>
        </Stack>
      </Stack>
    ) : (
      <Stack tokens={{ childrenGap: 20 }}>
        <Text variant="large" block>
          {t("wizard.page3.title", "Review Data")}
        </Text>
        <Text block>{t("wizard.page3.noSingers", "No singers to review.")}</Text>
      </Stack>
    );
};

export default WizardPage3;