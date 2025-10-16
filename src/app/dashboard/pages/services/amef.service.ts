import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environments } from '@env/environmets';
import { Amef, AnalysisDto } from '../../interfaces/interfaces';
import { AnalysisItem, CreateAnalysisPayload, UpdateAnalysisPayload } from '../analysis/analysis.component';
import { Observable, delay } from 'rxjs';
import { UserReponse } from '@interfaces/interfaces';

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

@Injectable({ providedIn: 'root' })
export class AmefService {
  private http = inject(HttpClient);
  private baseUrl = environments.baseUlr;

  getUsersByDepartmentAndTerm(department: string, user: string){
    return this.http.get<UserReponse[]>(`${this.baseUrl}/auth/department/${department}/user/${user}`)
  }

  getDepartaments(term: string){
    return this.http.get<{id: string, department: string}[]>(`${this.baseUrl}/departments/${term}`)
  }

  createOrganizationalInformation(body: {}) {
    return this.http.post(`${this.baseUrl}/organizational-information`, body);
  }

  getAmefsByIdAndTerm(id: string, term: string){
    return this.http.get<Amef[]>(`${this.baseUrl}/organizational-information/${id}/term/${term}`)
  }

  getAmefsById(id: string){
    return this.http.get<Amef[]>(`${this.baseUrl}/organizational-information/${id}`)
  }

  getAmefs() {
    return this.http.get<Amef[]>(`${this.baseUrl}/organizational-information`);
  }

  getAmefByTerm(term: string) {
    return this.http.get<Amef[]>(`${this.baseUrl}/organizational-information/findAllByTerm/${term}`).pipe(
      delay(200)
    )
  }

  listAnalyses(amefId: string) {
    return this.http.get<AnalysisItem[]>(`${this.baseUrl}/amef/${amefId}/analysis`);
  }

  createAnalysis(amefId: string, dto: CreateAnalysisPayload) {
    return this.http.post<AnalysisDto>(`${this.baseUrl}/amef/${amefId}/analysis`, dto);
  }

  updateAnalysis(amefId: string, analysisId: string, dto: UpdateAnalysisPayload) {
    return this.http.patch<AnalysisDto>(`${this.baseUrl}/amef/${amefId}/analysis/${analysisId}`, dto);
  }

  deleteAnalysis(amefId: string, analysisId: string) {
    return this.http.delete<void>(`${this.baseUrl}/amef/${amefId}/analysis/${analysisId}`);
  }

  createAction(amefId: string, analysisId: string, dto: ActionCreateDto): Observable<ActionItem> {
    return this.http.post<ActionItem>(
      `${this.baseUrl}/amef/${amefId}/analysis/${analysisId}/actions`,
      dto
    );
  }

  getActions(amefId: string, analysisId: string) {
    return this.http.get<ActionItem[]>(
      `${this.baseUrl}/amef/${amefId}/analysis/${analysisId}/actions`
    );
  }

  updateAction(amefId: string, analysisId: string, actionId: string, dto: ActionCreateDto): Observable<ActionItem> {
    return this.http.patch<ActionItem>(
      `${this.baseUrl}/amef/${amefId}/analysis/${analysisId}/actions/${actionId}`,
      dto
    );
  }

  deleteAction(amefId: string, analysisId: string, actionId: string) {
    return this.http.delete<void>(
      `${this.baseUrl}/amef/${amefId}/analysis/${analysisId}/actions/${actionId}`
    );
  }

  getAnalysis(amefId: string, analysisId: string) {
    return this.http.get<{ severity: number; occurrence: number; detection: number }>(
      `${this.baseUrl}/amef/${amefId}/analysis/${analysisId}`
    );
  }
}
