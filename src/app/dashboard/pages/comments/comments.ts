import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CardMessageTeam } from '../../components/card-message-team/card-message-team';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { AmefService } from '../services/amef.service';
import { firstValueFrom, of } from 'rxjs';
import { LoaderComponent } from 'src/app/shared/loader/loader.component';
import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-comments',
  imports: [CardMessageTeam, LoaderComponent, UpperCasePipe, TitleCasePipe],
  templateUrl: './comments.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Comments implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('teamMessagesContainer')
  private teamMessagesContainer?: ElementRef<HTMLDivElement>;

  @ViewChild('userMessagesContainer')
  private userMessagesContainer?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      const _ = this.comments.value(); // fuerza la dependencia
      setTimeout(() => this.scrollTeamToBottom(), 0);
    });

    // Cuando cambian tus comentarios
    effect(() => {
      const _ = this.commentsByUser.value();
      setTimeout(() => this.scrollUserToBottom(), 0);
    });
  }

  ngAfterViewInit(): void {
    this.scrollTeamToBottom();
    this.scrollUserToBottom();
  }

  private scrollTeamToBottom(): void {
    const el = this.teamMessagesContainer?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  private scrollUserToBottom(): void {
    const el = this.userMessagesContainer?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  authService = inject(AuthService);
  amefService = inject(AmefService)
  router = inject(ActivatedRoute);

  analysisId = signal<string>('')
  amefId = signal<string>('')


  roomMember = rxResource({
    stream: () => {
      return this.amefService.getRoomMembersByAnalysis(this.userId()!, this.amefId(), this.analysisId());
    }
  })

  async ngOnDestroy() {
    await firstValueFrom(this.amefService.updateRoomMember(this.roomMember.value()?.id!, {
      lastConnection: new Date().toISOString()
    }))
  }

  ngOnInit() {
    this.scrollTeamToBottom();
    this.scrollUserToBottom();
    const analysisId = this.router.snapshot.paramMap.get('analysisId');
    this.analysisId.set(analysisId!)

    const amefId = this.router.snapshot.paramMap.get('amefId')
    this.amefId.set(amefId!)


    this.amefService.jointCommentRoom(analysisId!)

    if (this.amefService.numberNewComments().get(this.analysisId())! > 0) {
      this.amefService.resetNumberNewComments(this.analysisId())
    }
  }

  analysis = rxResource({
    stream: () => this.amefService.getAnalysisPlane(this.amefId(), this.analysisId())
  })

  private changeComments = effect(() => {
    const newComment = this.amefService.comment();
    const updateComment = this.amefService.commentUpdate();
    const deletedComment = this.amefService.deletedComment()

    if (newComment) {
      this.comments.reload()
    }

    if (updateComment) {
      this.comments.reload()
    }

    if (deletedComment) {
      this.comments.reload()
      this.commentsByUser.reload()
    }

  })

  searchCommentByUser = signal<string>('');
  commentId = signal<string>('')
  userId = computed(() => this.authService.user()?.id);
  searchComment = signal<string>('')
  comment = signal<string>('')

  comentsGrup = computed(() => {
    return this.comments
  })

  locateDateString(date: string): string {
    return new Date(date).toLocaleDateString()
  }

  async sendCommentChange(id: string, comment: string) {
    const currentComment = await firstValueFrom(this.amefService.updateComment(id, {
      comment: comment,
    }))

    if (currentComment) {
      this.comments.reload()
      this.commentsByUser.reload()
    }
  }

  async deleteComment(id: string) {
    await firstValueFrom(this.amefService.deleteComment(id))
  }

  clearCommentId() {
    this.commentId.set('')
  }

  selectCommentId(id: string) {
    this.commentId.set(id)
  }

  changeComment(comment: string) {
    if (!comment) {
      this.comment.set('')
      return;
    }

    this.comment.set(comment)
  }

  changeSearchTermByUser(term: string) {
    if (!term) {
      this.searchCommentByUser.set('')
      return;
    }

    this.searchCommentByUser.set(term)
  }

  changeSearchTerm(term: string) {
    if (!term) {
      this.searchComment.set('')
      return;
    }

    this.searchComment.set(term)
  }

  comments = rxResource({
    params: () => {
      const analysisId = this.analysisId()
      const term = this.searchComment()

      return { analysisId, term }
    },
    stream: ({ params }) => {
      if (!params.analysisId) return of([])

      if (params.analysisId && params.term) return this.amefService.getCommentsByIdAndTerm(params.analysisId, params.term)

      return this.amefService.getCommentsById(params.analysisId)
    }
  })

  commentsByUser = rxResource({
    params: () => {
      const analysisId = this.analysisId()
      const userID = this.userId();
      const term = this.searchCommentByUser()

      return { userID, analysisId, term }
    },
    stream: ({ params }) => {
      if (!params.userID || !params.analysisId) return of([])

      if (params.userID && params.analysisId && params.term) return this.amefService.getCommentsByUserIdAndTerm(params.userID, params.analysisId, params.term)

      return this.amefService.getCommentsByUserId(params.userID, params.analysisId)
    }
  })

  async sendComment() {
    if (!this.comment()) return;

    const comment = await firstValueFrom(this.amefService.createComment({
      analysisUuid: this.analysisId(),
      comment: this.comment(),
      userUuid: this.authService.user()!.id,
    } as any))

    if (comment) {
      this.comments.reload()
      this.commentsByUser.reload()
      this.comment.set('')


      this.searchComment.set('')
      this.searchCommentByUser.set('')
    }
  }
}
