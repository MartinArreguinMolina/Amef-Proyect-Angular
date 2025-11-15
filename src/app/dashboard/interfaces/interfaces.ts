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

export interface Analysis {
  id: string;
  organizationalInformation: OrganizationalInformation;
  actions: any[];
  systemFunction: string;
  failureMode: string;
  failureEffects: string;
  severity: number;
  failureCauses: string;
  occurrence: number;
  currentControls: string;
  detection: number;
  npr: number;
}

export interface OrganizationalInformation {
  amefId: string;
  revision: number;
  system: string;
  subsystem: null;
  component: null;
  proyectCode: string;
  leadingDepartment: string;
  dateOfOrigin: Date;
  targetDate: Date;
}

export interface ActionItem {
  id: string;
  recommendedAction: string;
  responsible: string;
  targetDate: string;

  implementedAction?: string | null;
  completionDate?: string | null;

  newSeverity?: number | null;
  newOccurrence?: number | null;
  newDetection?: number | null;

  nprBefore?: number | null;
}

export interface ActionCreateDto {
  recommendedAction: string;
  responsible: string;
  targetDate: string;

  implementedAction?: string;
  completionDate?: string;

  newSeverity?: number;
  newOccurrence?: number;
  newDetection?: number;
}

export interface Comment {
  id: string
  comment: string;
  createdAt: string,
  updatedAt: string,
  analysis: Analysis
  user: Userplane
}

export interface Userplane {
  id: string
  fullName: string,
  email: string,
  department: string,
  rol: string,
}

export interface DtoComments {
  userUuid: string,
  comment: string,
  analysisUuid: string,
  date: string,
}

export interface roomMembers {
  id: string,
  amefId: string,
  analysisId: string,
  userId: string,
  lastConnection: Date | null
}

export interface Departament {
  id: string,
  department: string
}
