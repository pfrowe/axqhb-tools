import * as XLSX from "xlsx";
import { assign, fromPromise, raise, setup } from "xstate";
import CONSTANTS from "../../app.constants";
import { IMatchedSinger, IPopulateSingersContext, IFieldState, LoadElements, IOperation } from "../../contexts/PopulateSingersContext";
import { IRallySinger } from "../../helpers/GraphQL";

// GraphQL mutation functions
const createSingerMutation = async (singerData: Record<string, any>) => {
  const query = `mutation($input: CreateSingerInput!) {
    createSinger(input: $input) {
      id
      given_name
      family_name
      email
      phone
      street_line_1
      street_line_2
      postal_code
      city
      geo_division_1
      country
      preferred_name
    }
  }`;
  const variables = { input: singerData };
  const optionsFetch = {
    body: JSON.stringify({ query, variables }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  const response = await fetch(CONSTANTS.urlGraphQL, optionsFetch);
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0]?.message || "Failed to create singer");
  return result.data.createSinger;
};

const createRallySingerMutation = async (rallyId: string, singerId: string, voicePart?: string, isGuest?: boolean) => {
  const query = `mutation($rallyId: ID!, $singerId: ID!, $voicePart: String!, $isGuestSinger: Boolean!) {
    createRallySinger(input: {rally_id: $rallyId, singer_id: $singerId, voice_part: $voicePart, is_guest_singer: $isGuestSinger}) {
      id
      unique_id
      voice_part
      is_guest_singer
    }
  }`;
  const variables = { rallyId, singerId, voicePart, isGuestSinger: isGuest };
  const optionsFetch = {
    body: JSON.stringify({ query, variables }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  const response = await fetch(CONSTANTS.urlGraphQL, optionsFetch);
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0]?.message || "Failed to create rally singer");
  return result.data.createRallySinger;
};

const updateRallySingerMutation = async (rallySingerId: number, voicePart?: string, isGuest?: boolean) => {
  const query = `mutation($id: ID!, $voicePart: String, $isGuestSinger: Boolean) {
    updateRallySinger(id: $id, input: {voice_part: $voicePart, is_guest_singer: $isGuestSinger}) {
      id
      unique_id
      voice_part
      is_guest_singer
    }
  }`;
  const variables = { id: rallySingerId, voicePart, isGuestSinger: isGuest };
  const optionsFetch = {
    body: JSON.stringify({ query, variables }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  const response = await fetch(CONSTANTS.urlGraphQL, optionsFetch);
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0]?.message || "Failed to update rally singer");
  return result.data.updateRallySinger;
};

const updateSingerMutation = async (singerId: number, singerData: Record<string, any>) => {
  const query = `mutation($id: ID!, $input: UpdateSingerInput!) {
    updateSinger(id: $id, input: $input) {
      id
      given_name
      family_name
      email
      phone
      street_line_1
      street_line_2
      postal_code
      city
      geo_division_1
      country
      preferred_name
    }
  }`;
  const variables = { id: singerId, input: singerData };
  const optionsFetch = {
    body: JSON.stringify({ query, variables }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  const response = await fetch(CONSTANTS.urlGraphQL, optionsFetch);
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0]?.message || "Failed to update singer");
  return result.data.updateSinger;
};

// Helper function to calculate required operations
const calculateRequiredOperations = (
  matchedSingers: IMatchedSinger[],
  cardEdits?: Record<number, Record<string, IFieldState>>
) => {
  const operations: Array<IOperation> = [];

  for (let i = 0; i < matchedSingers.length; i++) {
    const matched = matchedSingers[i];
    const edits = cardEdits?.[i] || {};

    if ((matched.matchScore === 0) || ((edits.id?.source === "custom") && (parseInt(edits.id.customValue) < 0))) {
      // New singer - needs creation and rally singer registration
      operations.push({
        type: "createSinger",
        index: i,
        matched,
        edits
      });
      operations.push({
        type: "createRallySinger",
        index: i,
        matched,
        edits,
        newSinger: true
      });
    } else if (!matched.registration?.isRegistered) {
      // Existing singer not yet registered for this rally
      operations.push({
        type: "createRallySinger",
        index: i,
        matched,
        edits
      });
      // Check if any singer fields changed
      const singerFieldsEdited = Object.entries(edits).some(([key, state]: [string, IFieldState]) =>
        !["voice_part", "is_guest_singer"].includes(key) && state.source !== "db"
      );
      if (singerFieldsEdited) {
        operations.push({
          type: "updateSinger",
          index: i,
          matched,
          edits
        });
      }
    } else {
      // Already registered - check for updates
      const voicePartChanged = edits.voice_part && edits.voice_part.source !== "db";
      const isGuestChanged = edits.is_guest_singer && edits.is_guest_singer.source !== "db";
      if (voicePartChanged || isGuestChanged) {
        operations.push({
          type: "updateRallySinger",
          index: i,
          matched,
          edits
        });
      }
      const singerFieldsEdited = Object.entries(edits).some(([key, state]: [string, IFieldState]) =>
        !["voice_part", "is_guest_singer"].includes(key) && state.source !== "db"
      );
      if (singerFieldsEdited) {
        operations.push({
          type: "updateSinger",
          index: i,
          matched,
          edits
        });
      }
    }
  }

  return operations;
};

// Extract boolean value for is_guest_singer field
const getGuestValue = (customValue?: string | boolean): boolean => {
  if (typeof customValue === "boolean") return customValue;
  if (typeof customValue === "string") return customValue.toLowerCase() === "true";
  return false;
};

interface IProcessImportMutationInput {
  operation: IOperation;
  rallyId: number;
  createdSingers: Record<number, { id: string }>;
}

const processImportMutation = async (
  { input: { operation, rallyId, createdSingers } }: { input: IProcessImportMutationInput }
): Promise<Partial<IPopulateSingersContext>> => {
  const result: Partial<IPopulateSingersContext> = { createdSingers };
  try {
    const isGuest = getGuestValue(operation.edits.is_guest_singer?.customValue ?? (
      operation.edits.is_guest_singer?.source === "db"
        ? operation.matched.matched?.is_guest_singer
        : operation.matched.imported?.is_guest_singer
    ));
    const voicePart = operation.edits.voice_part?.customValue ??
      (operation.edits.voice_part?.source === "db" ? operation.matched.matched?.voice_part : operation.matched.imported?.voice_part) ??
      "";
    if (operation.type === "createSinger") {
      const singerData = {};
      ["given_name", "family_name", "email", "phone", "street_line_1", "street_line_2", "postal_code", "city", "geo_division_1", "country", "preferred_name"].forEach(field => {
        const value = operation.edits[field]?.customValue ?? operation.matched.imported?.[field];
        if (value) singerData[field] = value;
      });
      const created = await createSingerMutation(singerData);
      result.createdSingers[operation.index] = created;
    } else if (operation.type === "createRallySinger") {
      const singerId = operation.newSinger ? createdSingers[operation.index].id : operation.matched.matched.id;
      await createRallySingerMutation(rallyId.toString(), singerId.toString(), voicePart, isGuest);
    } else if (operation.type === "updateRallySinger") {
      const rallySingerId = operation.matched.registration?.id;
      await updateRallySingerMutation(rallySingerId, voicePart, isGuest);
    } else if (operation.type === "updateSinger") {
      const singerData = {};
      ["given_name", "family_name", "email", "phone", "street_line_1", "street_line_2", "postal_code", "city", "geo_division_1", "country", "preferred_name"].forEach(field => {
        if (operation.edits[field] && !["voice_part", "is_guest_singer"].includes(field)) {
          const value = operation.edits[field].customValue ?? operation.matched.imported?.[field];
          if (value) singerData[field] = value;
        }
      });
      if (Object.keys(singerData).length > 0) {
        await updateSingerMutation(operation.matched.matched.id, singerData);
      }
    }
    return result;
  } catch (error) {
    throw new Error(`Error during ${operation.type}: ${(error as any)?.message || "Unknown error"}`);
  }
};

const checkLoaded = (checks: LoadElements[]) => ({ context: { loaded } }) =>
  (checks.every(key => loaded[key]));

const getRally = async ({ input: { id } }) => {
  const query = `query($id: ID) {
    rally(id: $id) {
      image_url
      name
      start_date
      stop_date
      singers {
        id
        is_guest_singer
        unique_id
        voice_part
        singer {
          family_name
          given_name
          id
        }
      }
    }
  }`;
  const variables = { id };
  const optionsFetch = {
    body: JSON.stringify({ query, variables }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  return (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.rally;
};

const getSingers = async () => {
  const query = `query {
    singers {
      city
      country
      email
      family_name
      geo_division_1
      given_name
      id
      phone
      postal_code
      preferred_name
      street_line_1
      street_line_2
    }
  }`;
  const optionsFetch = {
    body: JSON.stringify({ query }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST"
  };
  return (await (await fetch(CONSTANTS.urlGraphQL, optionsFetch)).json()).data.singers;
};

const parseExcel = async ({ input: { file } }): Promise<Record<string, string>[]> => {
  try {
    const data = XLSX.read(await file.arrayBuffer(), { raw: false, type: "array" });
    const firstSheetName = data.SheetNames[0];
    const firstSheet = data.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(firstSheet);
  } catch (error) {
    throw new Error("Failed to parse Excel file. Please ensure it is a valid .xlsx file.");
  }
}

// Normalize phone number by extracting only digits
const normalizePhone = (phone: string): string => {
  return (phone?.toString() ?? "").replace(/\D/g, '') || '';
};

// Match imported singers with database singers
const matchImportedSingers = async (
  { input: { parsedData, rally, singers, fieldMapping } }: { input: Partial<IPopulateSingersContext> }
) => {
  const matchImportWithSinger = (importedRow: Record<string, string>): IMatchedSinger => {
    const getMatchRanks = (mappedImported: Record<string, string>) => {
      const getScore = (dbSinger: Record<string, string>): { matchScore: number; matchReason: string } => {
        const matchOnEmail = () => {
          const importedEmail = mappedImported.email;
          const dbEmail = dbSinger.email?.toLowerCase().trim();
          let result = null;
          if (importedEmail && dbEmail && (importedEmail === dbEmail)) {
            result = { score: 300, reason: "email" }; // Highest score for email match
          }
          return result;
        };
        const matchOnNames = () => {
          let result = null;
          // Priority 3: Given and family names match
          const importedGiven = mappedImported['given_name']?.toLowerCase().trim();
          const importedFamily = mappedImported['family_name']?.toLowerCase().trim();
          const dbGiven = dbSinger.given_name?.toLowerCase().trim();
          const dbFamily = dbSinger.family_name?.toLowerCase().trim();
          if (
            importedGiven && dbGiven && importedFamily && dbFamily && (importedGiven === dbGiven) &&
            (importedFamily === dbFamily)
          ) {
            result = { score: 100, reason: "names" }; // Lower score for name match
          }
          return result;
        };
        const matchOnPhone = () => {
          let result = null;
          // Priority 2: Semantic phone number match
          const importedPhone = normalizePhone(mappedImported['phone'] || '');
          const dbPhone = normalizePhone(dbSinger.phone || '');
          if (importedPhone && dbPhone && (importedPhone === dbPhone)) {
            result = { score: 200, reason: "phone" }; // High score for phone match
          }
          return result;
        };
        const reduceTotalScore = ({ matchScore, matchReason }, { score, reason }: { score: number, reason: string }) =>
          ({ matchReason: (matchReason !== "") ? `${matchReason},${reason}` : reason, matchScore: matchScore + score });
        return [matchOnEmail(), matchOnPhone(), matchOnNames()]
          .filter((result): result is { score: number; reason: string } => (result != null))
          .reduce(reduceTotalScore, { matchScore: 0, matchReason: "" });
      }
      return singers.map(dbSinger => ({ ...dbSinger, ...getScore(dbSinger) }));
    };
    const linkRegistration = (matchedSinger: IMatchedSinger): IMatchedSinger => {
      const filterRegistration = ({ singer: { id } }: IRallySinger): boolean =>
        (id.toString() === matchedSinger.matched.id.toString());
      let result = null;
      if ((matchedSinger?.matched != null) && (matchedSinger.matchScore > 0)) {
        const registration = rally.singers.find(filterRegistration);
        result = {
          id: registration?.id ?? -1,
          isRegistered: registration != null,
          is_guest_singer: registration?.is_guest_singer,
          unique_id: registration?.unique_id,
          voice_part: registration?.voice_part
        };
      }
      return { ...matchedSinger, matched: { ...result, ...matchedSinger.matched }, registration: result };
    };
    const mapImportToSingerFields = (importedRow: Record<string, string>): Record<string, string> => {
      const reduceSinger = (acc: Record<string, string>, [originalField, mappedField]: [string, string]) => {
        if (importedRow.hasOwnProperty(originalField)) {
          acc[mappedField] = importedRow[originalField];
        }
        return acc;
      };
      return Object.entries(fieldMapping).reduce(reduceSinger, {});
    };
    const sortByScoreDesc = (a: { matchScore: number }, b: { matchScore: number }) => (b.matchScore - a.matchScore);
    // Map the imported fields to standardized field names using fieldMapping
    const mappedImported: Record<string, string> = mapImportToSingerFields(importedRow);
    const rankedSingers = getMatchRanks(mappedImported).sort(sortByScoreDesc);
    return linkRegistration({
      imported: mappedImported,
      matched: rankedSingers[0] ?? null,
      matchScore: rankedSingers[0]?.matchScore ?? 0,
    });
  };
  return parsedData.map(matchImportWithSinger);
};

const machineDefinition = setup({
  actors: {
    getRally: fromPromise(getRally),
    getSingers: fromPromise(getSingers),
    parseExcel: fromPromise(parseExcel),
    matchImportedSingers: fromPromise(matchImportedSingers),
    processImportMutation: fromPromise(processImportMutation)
  },
  types: {
    context: {} as IPopulateSingersContext
  }
})
  .createMachine({
    context: {
      id: -1,
      fieldMapping: {},
      loaded: { excel: false, rally: false, singers: false },
      matchedSingers: [],
      operationProgress: { total: 0, completed: 0, status: "idle" },
      rally: null,
      singers: [],
      show: { singers: false, wizard: false }
    },
    initial: "init",
    states: {
      init: {
        on: {
          INIT: {
            actions: [assign(({ event: { params: { id } } }) => ({ id }))],
            target: "loading"
          }
        }
      },
      loading: {
        invoke: [
          {
            id: "getRally",
            input: ({ context: { id } }) => ({ id }),
            src: "getRally",
            onDone: {
              actions: [
                assign({
                  loaded: ({ context }) => ({ ...context.loaded, rally: true }),
                  rally: ({ event }) => (event.output)
                }),
                raise({ type: "CHECK_LOADED" })
              ]
            }
          },
          {
            id: "getSingers",
            src: "getSingers",
            onDone: {
              actions: [
                assign({
                  loaded: ({ context }) => ({ ...context.loaded, singers: true }),
                  singers: ({ event }) => (event.output)
                }),
                raise({ type: "CHECK_LOADED" })
              ]
            }
          }
        ],
        on: {
          CHECK_LOADED: {
            guard: checkLoaded(["rally", "singers"]),
            target: "requestExcel"
          }
        }
      },
      mapFields: {
        entry: [assign({ show: ({ context }) => ({ ...context.show, wizard: true }) })],
        on: {
          NEXT: {
            actions: [assign(({ event: { params: { fieldMapping } } }) => ({ fieldMapping }))],
            target: "matchSingers"
          },
          PREVIOUS: {
            target: "requestExcel"
          }
        }
      },
      matchSingers: {
        invoke: {
          id: "matchImportedSingers",
          input: ({ context }) => (context),
          src: "matchImportedSingers",
          onDone: {
            actions: [assign({
              matchedSingers: ({ event }) => (event.output)
            })],
            target: "reviewMatches"
          }
        }
      },
      parsingExcel: {
        entry: assign({ parseError: undefined }),
        invoke: {
          id: "parseExcel",
          input: ({ context: { excelFile } }) => ({ file: excelFile }),
          src: "parseExcel",
          onDone: {
            actions: [assign({
              excelData: ({ event }) => (event.output.map((row: any) => JSON.stringify(row))),
              parsedData: ({ event }) => (event.output)
            })],
            target: "mapFields"
          }
        }
      },
      requestExcel: {
        entry: [assign({ show: ({ context }) => ({ ...context.show, wizard: true }) })],
        on: {
          FILE_SELECTED: {
            actions: [assign(({ event: { params: { file } } }) => ({ excelFile: file }))],
          },
          SUBMIT_FILE: {
            target: "parsingExcel"
          }
        }
      },
      reviewMatches: {
        entry: [assign({ show: ({ context }) => ({ ...context.show, wizard: true }) })],
        on: {
          NEXT: {
            actions: [assign(({ event: { params: { cardEdits } } }) => ({ cardEdits }))],
            target: "initiateWriting"
          },
          PREVIOUS: {
            target: "mapFields"
          }
        }
      },
      initiateWriting: {
        entry: [
          assign(({ context }) => {
            const operations = calculateRequiredOperations(context.matchedSingers, context.cardEdits);
            return {
              operations,
              operationProgress: {
                total: operations.length,
                completed: 0,
                currentOperation: "Starting import...",
                status: "running" as "running" | "completed" | "error"
              },
              show: { ...context.show, wizard: true },
              currentOperationIndex: context.currentOperationIndex || 0
            };
          })
        ],
        always: "writing"
      },
      writing: {
        invoke: {
          id: "processImportMutation",
          input: ({ context: { createdSingers, currentOperationIndex, id, operations } }) => ({
            createdSingers: createdSingers || {},
            operation: operations[currentOperationIndex], // Pass the current operation to the invoked service
            rallyId: id
          }),
          src: "processImportMutation",
          onDone: {
            actions: [
              assign({
                createdSingers: ({ context, event }) => ({ ...context.createdSingers, ...event.output.createdSingers }),
                currentOperationIndex: ({ context }) => (context.currentOperationIndex + 1),
                operationProgress: ({ context }) => {
                  const nextIndex = context.currentOperationIndex + 1;
                  const isComplete = nextIndex >= context.operations.length;
                  return {
                    ...context.operationProgress,
                    completed: context.operationProgress.completed + 1,
                    currentOperation: isComplete
                      ? "Import completed"
                      : `Processing ${context.operations[nextIndex].type} for record ${context.operations[nextIndex].index + 1} of ${context.matchedSingers.length}`,
                    status: isComplete ? "completed" : "running"
                  };
                }
              })
            ],
            target: "checkCompletion"
          },
          onError: {
            actions: [assign({
              operationProgress: ({ context, event }) => ({
                ...context.operationProgress,
                status: "error",
                error: (event.error as any)?.message || "An error occurred during import"
              })
            })],
            target: "error"
          }
        }
      },
      checkCompletion: {
        always: [
          {
            guard: ({ context }) => (context.operationProgress.completed >= context.operationProgress.total),
            target: "completed"
          },
          {
            target: "writing"
          }
        ]
      },
      completed: {
        type: "final"
      },
      error: {
        type: "final"
      }
    }
  });

export default machineDefinition;