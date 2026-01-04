import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environments } from '@env/environmets';
import { ActionCreateDto, ActionItem, Amef, AmefPatch, Analysis, AnalysisDto, Comment, Departament, DtoComments, roomMembers } from '../../interfaces/interfaces';
import { AnalysisItem, CreateAnalysisPayload, UpdateAnalysisPayload } from '../analysis/analysis.component';
import { Observable, delay } from 'rxjs';
import { UserReponse } from '@interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class AmefService {
  private http = inject(HttpClient);
  private baseUrl = environments.baseUlr;

  getUsersByDepartmentAndTerm(department: string, user: string) {
    return this.http.get<UserReponse[]>(`${this.baseUrl}/auth/department/${department}/user/${user}`)
  }

  getDepartaments(term: string) {
    return this.http.get<Departament[]>(`${this.baseUrl}/departments/${term}`)
  }

  getTeamByTerm(id: string, term: string) {
    return this.http.get<Amef[]>(`${this.baseUrl}/organizational-information/amef/${id}/term/${term}`).pipe(
      delay(200)
    )
  }

  getAmefsByTeam(id: string) {
    return this.http.get<Amef[]>(`${this.baseUrl}/organizational-information/amef/team/${id}`).pipe(
      delay(200)
    )
  }

  createOrganizationalInformation(body: {}) {
    return this.http.post(`${this.baseUrl}/organizational-information`, body);
  }

  updateAmef(id: string, body: {}) {
    return this.http.patch(`${this.baseUrl}/organizational-information/${id}`, body)
  }

  getAmefById(id: string) {
    return this.http.get<AmefPatch>(`${this.baseUrl}/organizational-information/id/${id}`)
  }

  getAmefsByIdAndTerm(id: string, term: string) {
    return this.http.get<Amef[]>(`${this.baseUrl}/organizational-information/${id}/term/${term}`).pipe(
      delay(200)
    )
  }

  getAmefsById(id: string) {
    return this.http.get<Amef[]>(`${this.baseUrl}/organizational-information/${id}`).pipe(
      delay(200)
    )
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

  getAnalysisPlane(amefId: string, analysisId: string) {
    return this.http.get<Analysis>(`${this.baseUrl}/amef/${amefId}/analysis/${analysisId}`)
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

  // COMENTARIOS
  getCommentsById(id: string) {
    return this.http.get<Comment[]>(`${this.baseUrl}/comments/${id}`).pipe(
      delay(300)
    )
  }

  getCommentsByIdAndTerm(id: string, term: string) {
    return this.http.get<Comment[]>(`${this.baseUrl}/comments/${id}/${term}`).pipe(
      delay(300)
    )
  }

  getCommentsByUserId(id: string, analysisId: string) {
    return this.http.get<Comment[]>(`${this.baseUrl}/comments/user/${id}/analysisId/${analysisId}`).pipe(
      delay(300)
    )
  }

  getCommentsByUserIdAndTerm(id: string, analysisId: string, term: string) {
    return this.http.get<Comment[]>(`${this.baseUrl}/comments/user/${id}/analysisId/${analysisId}/${term}`).pipe(
      delay(300)
    )
  }

  createComment(commentDto: DtoComments) {
    return this.http.post(`${this.baseUrl}/comments`, commentDto)
  }

  updateComment(id: string, body: {}) {
    return this.http.patch(`${this.baseUrl}/comments/${id}`, body)
  }

  deleteComment(id: string) {
    return this.http.delete(`${this.baseUrl}/comments/${id}`)
  }

  // roomMembers
  getRoomMembers(userId: string, amefId: string) {
    return this.http.get<roomMembers[]>(`${this.baseUrl}/room-members/${userId}/amef/${amefId}`)
  }

  getRoomMembersByAnalysis(userId: string, amefId: string, analysisId: string) {
    return this.http.get<roomMembers>(`${this.baseUrl}/room-members/${userId}/amef/${amefId}/analysis/${analysisId}`)
  }

  updateRoomMember(id: string, body: {}) {
    return this.http.patch(`${this.baseUrl}/room-members/${id}`, body)
  }

  // Mail
  sendNotificationEmail(data: {}) {
    return this.http.post(`${this.baseUrl}/mail`, data)
  }
}
