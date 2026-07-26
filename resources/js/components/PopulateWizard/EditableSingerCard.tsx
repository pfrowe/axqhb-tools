import { Button, Dropdown, Option, OptionOnSelectData, Switch, SwitchOnChangeData, Text } from "@fluentui/react-components";
import { LinkDismissRegular } from "@fluentui/react-icons";
import React, { useCallback, useEffect, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { MergePhoneNumber, MergeTextField } from "./MergeFields";
import PopulateSingersContext, { IFieldState } from "../../contexts/PopulateSingersContext";

import styles from "./EditableSingerCard.module.scss";

interface IEditableSingerCardProps {
  dbSinger: Record<string, any>;
  imported: Record<string, any>;
  index: number;
  initialState?: Record<string, IFieldState>;
  onChange?: (idx: number, state: Record<string, IFieldState>) => void;
  registered: boolean;
  score: number;
}

const EditableSingerCard: React.FC<IEditableSingerCardProps> = ({
  dbSinger = {}, index, imported = {}, initialState, onChange, score = 0, registered = false
}) => {
  const { valueMapping } = React.useContext(PopulateSingersContext);
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
      return (<Text block className={classRegistered} size={200}>
        {registered ? t("wizard.page3.registered") : t("wizard.page3.notRegistered")
        }</Text>);
    },
    [registered, t]
  );
  const scoreText = useMemo(
    () => {
      const interpolations = {
        score: Math.round((score / 600) * 100),
        singer: `${dbSinger?.given_name} ${dbSinger?.family_name}`
      };
      return (score > 0 ? t("wizard.page3.matched", interpolations) : t("wizard.page3.noMatch"));
    },
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
  const onChangeIsGuest = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, { checked }: SwitchOnChangeData) =>
      (updateState({ is_guest_singer: { source: "custom", customValue: checked.toString() } })),
    []
  );
  const onChangeVoicePart = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, { optionValue }: OptionOnSelectData) =>
      (updateState({ voice_part: { source: "custom", customValue: optionValue } })),
    []
  );
  const onClickUnlink = useCallback(() => (updateState({ id: { customValue: "-1", source: "custom" } })), [updateState]);
  const unlinkButton = useMemo(
    () => (
      <Button
        appearance="secondary"
        disabled={initialState?.id?.source !== "db"}
        onClick={onClickUnlink}
      >
        <LinkDismissRegular />
        {t("wizard.action.unlink", "Unlink")}
      </Button>
    ),
    [initialState?.id, onClickUnlink]
  );
  const hashDefaultValue = useMemo(
    (): Record<string, string> => {
      const getDefaultValue = ([key, value]: [string, IFieldState]): [string, string] => {
        const { customValue, source } = value ?? { source: "imported" };
        let result: string;
        switch (source) {
          case "db": result = dbSinger?.[key] ?? customValue ?? ""; break;
          case "imported": result = imported?.[key] ?? customValue ?? ""; break;
          default: result = customValue ?? ""; break;
        }
        return [key, result];
      };
      return Object.fromEntries(Object.entries(initialState).map(getDefaultValue));
    },
    [dbSinger, imported, initialState]
  );
  const defaultVoicePart = useMemo(
    () => (valueMapping.voice_part?.[hashDefaultValue.voice_part] ?? ""),
    [hashDefaultValue, valueMapping]
  );
  const voiceOptions = useMemo(
    () => (<>
      <Option key="tenor">{t("voice_parts.tenor")}</Option>
      <Option key="lead">{t("voice_parts.lead")}</Option>
      <Option key="bari">{t("voice_parts.bari")}</Option>
      <Option key="bass">{t("voice_parts.bass")}</Option>
    </>),
    []
  );
  return (
    <div className={formClass}>
      <div className={styles["flex--vertical"]}>
        <div className={[styles["flex--horizontal"], styles["flex--justify-content--space-between"]].join(" ")}>
          <Text size={400} block>{singerName}</Text>
          {registrationText}
        </div>
        <div className={[styles["flex--horizontal"], styles["flex--justify-content--space-between"]].join(" ")}>
          <Text size={200} block>{scoreText}</Text>
          {unlinkButton}
        </div>
        {getTextField("given_name")}
        {getTextField("preferred_name")}
        {getTextField("family_name")}
        {getTextField("email")}
        {getPhoneField("phone")}
        <div className={styles.mergeField}>
          <div className={styles["flex--horizontal"]}>
            <div>
              <Text block className={styles.fieldName} size={200}>{t("fields.voice_part", "Voice Part")}</Text>
              <Dropdown
                defaultSelectedOptions={[defaultVoicePart]}
                onOptionSelect={onChangeVoicePart}
                placeholder={t("fields.voice_part", "Voice Part")}
              >{voiceOptions}</Dropdown>
            </div>
            <div>
              <Switch
                defaultChecked={hashDefaultValue.is_guest_singer === "true"}
                onChange={onChangeIsGuest}
                label={t("fields.is_guest_singer", "Is Guest Singer")}
              />
            </div>
          </div>
        </div>
        {getTextField("street_line_1")}
        {getTextField("street_line_2")}
        {getTextField("city")}
        {getTextField("geo_division_1")}
        {getTextField("postal_code")}
        {getTextField("country")}
      </div>
    </div>
  );
};

export default EditableSingerCard;
