import { Dropdown, Stack, StackItem, Text, Toggle } from "@fluentui/react";
import React, { useCallback, useEffect, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { MergePhoneNumber, MergeTextField } from "./MergeFields";
import { IFieldState } from "../../contexts/PopulateSingersContext";

import styles from "./EditableSingerCard.module.scss";

interface IEditableSingerCardProps {
  index: number;
  imported: Record<string, any>;
  dbSinger: Record<string, any>;
  score: number;
  registered: boolean;
  initialState?: Record<string, IFieldState>;
  onChange?: (idx: number, state: Record<string, IFieldState>) => void;
}

const EditableSingerCard: React.FC<IEditableSingerCardProps> = ({
  index, imported = {}, dbSinger = {}, score = 0, registered = false, initialState, onChange
}) => {
  const { t } = useTranslation("rally");
  const fields = useMemo(
    () => Array.from(new Set([...Object.keys(imported || {}), ...Object.keys(dbSinger || {})])),
    [imported, dbSinger]
  );
  const buildInitial = useCallback(
    (): Record<string, IFieldState> => {
      const initial: Record<string, IFieldState> = {};
      fields.forEach((fieldName) => {
        const importedValue = imported?.[fieldName] ?? null;
        const databaseValue = dbSinger?.[fieldName] ?? null;
        if (initialState && initialState[fieldName]) {
          initial[fieldName] = initialState[fieldName];
        } else if (score > 0) {
          if (importedValue != null && importedValue !== "") initial[fieldName] = { source: "imported" };
          else if (databaseValue != null && databaseValue !== "") initial[fieldName] = { source: "db" };
          else initial[fieldName] = { source: "custom", customValue: "" };
        } else {
          initial[fieldName] = { source: "custom", customValue: importedValue ?? "" };
        }
      });
      return initial;
    },
    [fields, imported, dbSinger, score, initialState]
  );
  const mergeValues = useCallback(
    (prev: Record<string, IFieldState>, next: Record<string, IFieldState>): Record<string, IFieldState> =>
      ({ ...prev, ...next }),
    []
  );
  const [state, updateState] = useReducer(mergeValues, {}, buildInitial);
  useEffect(() => (onChange?.(index, state)), [state, index, onChange]);
  const formClass = useMemo(
    () => ([
      styles.editable__form,
      ...(registered ? [styles.registered] : (score > 0 ? [styles.found] : [styles.neutral])),
    ].join(" ")),
    [registered, score]
  );
  const registrationText = useMemo(
    () => {
      const classRegistered = registered ? styles["registration--positive"] : styles["registration--neutral"];
      return (<Text variant="small" block className={classRegistered}>
        {registered ? t("wizard.page3.registered") : t("wizard.page3.notRegistered")
        }</Text>);
    },
    [registered, t]
  );
  const scoreText = useMemo(
    () => (score > 0 ? t("wizard.page3.matched", { score: Math.round((score / 600) * 100) }) : t("wizard.page3.noMatch")),
    [score, t]
  );
  const singerName = useMemo(
    () => (`${imported?.family_name ?? dbSinger?.family_name ?? ""}, ${imported?.given_name ?? dbSinger?.given_name ?? ""}`),
    [imported, dbSinger]
  );
  const getPhoneField = useCallback(
    (fieldName: string) => {
      const importedValue = imported?.[fieldName] ?? null;
      const databaseValue = dbSinger?.[fieldName] ?? null;
      const stateForField = state?.[fieldName] ?? {
        source: (score > 0)
          ? (importedValue != null ? "imported" : (databaseValue != null ? "db" : "custom"))
          : "custom",
        customValue: ""
      };
      return (<MergePhoneNumber
        databaseValue={((score > 0) && (databaseValue != null)) ? databaseValue : null}
        fieldName={fieldName}
        importedValue={importedValue}
        initialState={stateForField}
        key={`card-${index}__field-${fieldName}`}
        onChange={(newState) => (updateState({ [fieldName]: newState }))}
      />);
    },
    [imported, dbSinger, score, state, index]
  );
  const getTextField = useCallback(
    (fieldName: string) => {
      const importedValue = imported?.[fieldName] ?? null;
      const databaseValue = dbSinger?.[fieldName] ?? null;
      const stateForField = state?.[fieldName] ?? {
        source: (score > 0)
          ? (importedValue != null ? "imported" : (databaseValue != null ? "db" : "custom"))
          : "custom",
        customValue: ""
      };
      return (<MergeTextField
        databaseValue={((score > 0) && (databaseValue != null)) ? databaseValue : null}
        fieldName={fieldName}
        importedValue={importedValue}
        initialState={stateForField}
        key={`card-${index}__field-${fieldName}`}
        onChange={(newState) => (updateState({ [fieldName]: newState }))}
      />);
    },
    [imported, dbSinger, score, state, index]
  );
  const onChangeIsGuest = useCallback((newState: IFieldState) => (updateState({ is_guest_singer: newState })), []);
  const onChangeVoicePart = useCallback((newState: IFieldState) => (updateState({ voice_part: newState })), []);
  const voiceOptions = useMemo(
    () => ([
      { key: "tenor", text: t("voice_parts.tenor") },
      { key: "lead", text: t("voice_parts.lead") },
      { key: "bari", text: t("voice_parts.bari") },
      { key: "bass", text: t("voice_parts.bass") }
    ]),
    []
  );
  return (
    <div className={formClass}>
      <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal horizontalAlign="space-between" tokens={{ childrenGap: 8 }}>
          <StackItem>
            <Text variant="mediumPlus" block>{singerName}</Text>
            <Text variant="small" block>{scoreText}</Text>
          </StackItem>
          <StackItem>{registrationText}</StackItem>
        </Stack>
        {getTextField("given_name")}
        {getTextField("preferred_name")}
        {getTextField("family_name")}
        {getTextField("email")}
        {getPhoneField("phone")}
        <div className={styles.mergeField}>
          <Stack horizontal horizontalAlign="space-between" tokens={{ childrenGap: 8 }}>
            <StackItem>
              <Text className={styles.fieldName} variant="small" block>{t("fields.voice_part", "Voice Part")}</Text>
              <Dropdown
                defaultSelectedKey={imported?.voice_part ?? dbSinger?.voice_part ?? null}
                onChange={(_, option) => (onChangeVoicePart({ source: "custom", customValue: option?.key as string }))}
                options={voiceOptions}
                placeholder={t("fields.voice_part", "Voice Part")}
              />
            </StackItem>
            <StackItem>
              <Toggle
                defaultChecked={imported?.is_guest_singer ?? dbSinger?.is_guest_singer ?? false}
                onChange={(_, checked) => (onChangeIsGuest({ source: "custom", customValue: checked.toString() }))}
                label={t("fields.is_guest_singer", "Is Guest Singer")}
              />
            </StackItem>
          </Stack>
        </div>
        {getTextField("street_line_1")}
        {getTextField("street_line_2")}
        {getTextField("city")}
        {getTextField("geo_division_1")}
        {getTextField("postal_code")}
        {getTextField("country")}
      </Stack>
    </div>
  );
};

export default EditableSingerCard;
