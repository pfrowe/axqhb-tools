import React from "react";
import { IRally } from "../helpers/GraphQL";

export interface IFieldState {
  source: "imported" | "db" | "custom";
  customValue?: string;
}

export type LoadElements = "excel" | "rally" | "singers";

export type MappedField = "given_name" | "family_name" | "preferred_name" | "email" | "phone" | "street_line_1"
  | "street_line_2" | "postal_code" | "city" | "geo_division_1" | "country" | "voice_part" | "is_guest_singer";

export const MAPPED_FIELDS: MappedField[] = [
  "city", "country", "email", "family_name", "geo_division_1", "given_name", "is_guest_singer", "phone", "postal_code",
  "preferred_name", "street_line_1", "street_line_2", "voice_part",
];

export type MappedRecord = Record<MappedField, string>;

interface IMatchedRecord {
  id: number;
  matchScore: number;
  matchReason: string;
  // Optional properties for matched singer fields
  city?: string;
  country?: string;
  email?: string;
  family_name?: string;
  geo_division_1?: string;
  given_name?: string;
  is_guest_singer?: boolean | string;
  phone?: string;
  postal_code?: string;
  preferred_name?: string;
  street_line_1?: string;
  street_line_2?: string;
  voice_part?: string;
  // Optional properties added from registration data
  isRegistered?: boolean;
  unique_id?: string;
}

export type ShowElements = "singers" | "wizard";

export interface IMatchedSinger {
  imported: Record<string, string>;
  matched: IMatchedRecord | null;
  matchScore: number;
  registration?: {
    id: number;
    isRegistered: boolean;
    is_guest_singer: boolean;
    unique_id?: string;
    voice_part: string;
  }
}

export interface IOperation {
  edits: Record<string, IFieldState>;
  index: number;
  matched: IMatchedSinger;
  newSinger?: boolean;
  type: "createSinger" | "createRallySinger" | "updateRallySinger" | "updateSinger";
}

export interface IOperationProgress {
  total: number;
  completed: number;
  currentOperation?: string;
  status: "idle" | "running" | "completed" | "error";
  error?: string;
}

export interface IPopulateSingersContext {
  cardEdits?: Record<number, Record<string, IFieldState>>;
  createdSingers?: Record<number, { id: string }>;
  currentOperationIndex?: number;
  excelData?: string[];
  excelFile?: File;
  fieldMapping?: Record<string, MappedField>; // Maps imported field names to target field names
  id: number;
  loaded: Record<LoadElements, boolean>;
  matchedSingers?: Array<IMatchedSinger>;
  operationProgress?: IOperationProgress;
  operations?: IOperation[];
  parsedData?: Record<string, string>[];
  parseError?: string;
  rally: IRally | null;
  singers: any[];
  show: Record<ShowElements, boolean>;
}

const PopulateSingersContext = React.createContext<IPopulateSingersContext>({
  id: -1,
  loaded: { excel: false, rally: false, singers: false },
  rally: null,
  singers: [],
  show: { singers: false, wizard: false }
});

export const usePopulateSingersContext = () => React.useContext(PopulateSingersContext);

export default PopulateSingersContext;