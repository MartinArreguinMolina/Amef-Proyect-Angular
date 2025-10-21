import { UserReponse } from "@interfaces/interfaces";

export interface Amef {
  amefId: string,
  revision: number,
  team: string[],
  system: null | string,
  subsystem: null | string,
  component: null | string,
  proyectCode: string,
  leadingDepartment: string,
  dateOfOrigin: string,
  targetDate: string,
  preparedBy: PreparedBy
}

export interface AmefPatch {
  amefId: string,
  revision: number,
  team: UserReponse[],
  system: null | string,
  subsystem: null | string,
  component: null | string,
  proyectCode: string,
  leadingDepartment: string,
  dateOfOrigin: string,
  targetDate: string,
}

export interface PreparedBy {
  id: string,
  fullName: string,
  email: string,
  isActive: true,
  roles: string[]
}

export interface AnalysisDto {
  id?: string;
  systemFunction: string;
  failureMode: string;
  failureEffects: string;
  severity: number;
  failureCauses: string;
  occurrence: number;
  currentControls?: string;
  detection: number;
  npr?: number;
}


export interface ActionDto {
  recommendedAction: string;
  responsible: string;
  targetDate: string;
  implementedAction: string;
  completionDate: string;
  newSeverity: number;
  newOccurrence: number;
  newDetection: number;
}
