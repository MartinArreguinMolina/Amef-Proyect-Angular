import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environments } from '@env/environmets';
import { Amef, AmefPatch, AnalysisDto } from '../../interfaces/interfaces';
import { AnalysisItem, CreateAnalysisPayload, UpdateAnalysisPayload } from '../analysis/analysis.component';
import { Observable, delay} from 'rxjs';
import { UserReponse } from '@interfaces/interfaces';
import { io, Socket } from 'socket.io-client';
import { AuthService } from 'src/app/auth/service/auth-service.service';

export interface Analysis {
  id:                        string;
  organizationalInformation: OrganizationalInformation;
  actions:                   any[];
  systemFunction:            string;
  failureMode:               string;
  failureEffects:            string;
  severity:                  number;
  failureCauses:             string;
  occurrence:                number;
  currentControls:           string;
  detection:                 number;
  npr:                       number;
}

export interface OrganizationalInformation {
  amefId:            string;
  revision:          number;
  system:            string;
  subsystem:         null;
  component:         null;
  proyectCode:       string;
  leadingDepartment: string;
  dateOfOrigin:      Date;
  targetDate:        Date;
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

@Injectable({ providedIn: 'root' })
export class AmefService {
  private http = inject(HttpClient);
  private baseUrl = environments.baseUlr;
  private socket: Socket;
  private authService = inject(AuthService)

  comment = signal<Comment | null>(null);
  commentUpdate = signal<Comment | null>(null);
  deletedComment = signal<Comment | null>(null);
  private newCommentCount = signal<Map<string, number>>(new Map())


  numberNewComments = computed(() => this.newCommentCount())
  userId = computed(() => this.authService.user()!.id)

  constructor() {
    this.socket = io('http://localhost:3000/ws-comments', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      withCredentials: false,
    });

    this.socket.on('connect', () => console.log('WS conectado'));
    this.socket.on('disconnect', (reason) => console.log('WS desconectado:', reason));
    this.socket.on('connect_error', (err) => console.log('connect_error:', err.message));
    this.socket.on('reconnect_error', (err) => console.log('reconnect_error:', err.message));
    this.onCommentNew();
    this.onUpdateComment();
    this.onDeleteComment()
  }

  resetNumberNewComments(id: string){
    this.newCommentCount.update(v => {
      const next = new Map(v);
      next.delete(id);
      return next;
    })
  }

  jointCommentRoom(analysisId: string) {
    this.socket.emit('joinRoom', analysisId);
  }

  onCommentNew(){
    this.socket.on('comment:new', (data: Comment) => {
      console.log('Nuevo comentario recibido via WS:', data.analysis.id);
      this.comment.set(data);

      if(this.userId() !== data.user.id){

        this.newCommentCount.update(prev => {
          const next = new Map(prev)
          next.set(data.analysis.id, (next.get(data.analysis.id) ?? 0) + 1)

          return next;
        })

        console.log('Numero de nuevos comentarios', this.newCommentCount())
      }
    });
  }

  onUpdateComment(){
    this.socket.on('comment:update', (data: Comment) => {
      console.log('Comentario actualizado recibido via WS:', data);
      this.commentUpdate.set(data);
    });
  }

  onDeleteComment(){
    this.socket.on('comment:delete', (data: Comment) => {
      console.log('Comentario eliminado', data)
      this.deletedComment.set(data)
    })
  }

  connect() {
    if (!this.socket.connected) this.socket.connect()
  }

  disconnect() {
    // if (this.socket.connected) this.socket.disconnect()
  }

  getUsersByDepartmentAndTerm(department: string, user: string) {
    return this.http.get<UserReponse[]>(`${this.baseUrl}/auth/department/${department}/user/${user}`)
  }

  getDepartaments(term: string) {
    return this.http.get<{ id: string, department: string }[]>(`${this.baseUrl}/departments/${term}`)
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

  getAnalysisPlane(amefId: string, analysisId: string){
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

  deleteComment(id: string){
    return this.http.delete(`${this.baseUrl}/comments/${id}`)
  }
}
