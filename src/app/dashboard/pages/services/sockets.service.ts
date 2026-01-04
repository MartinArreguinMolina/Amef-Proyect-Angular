import { computed, inject, Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { Comment} from '../../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class Sockets {
  authService = inject(AuthService)

  private socket: Socket;
  private newCommentCount = signal<Map<string, number>>(new Map())

  commentUpdate = signal<Comment | null>(null);
  userId = computed(() => this.authService.user()!.id)
  comment = signal<Comment | null>(null);
  deletedComment = signal<Comment | null>(null);
  numberNewComments = computed(() => this.newCommentCount())

  roomMembers = signal<number | null>(null)

  constructor() {
    const token = localStorage.getItem('token')
    const analysisId = localStorage.getItem('analysisId')

    this.socket = io('http://localhost:3000/ws-comments', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      withCredentials: false,
      auth: {
        token,
        analysisId
      }
    });

    this.onCommentNew();
    this.onUpdateComment();
    this.onDeleteComment()
    this.clientsUpdate()
  }

  resetNumberNewComments(id: string) {
    this.newCommentCount.update(v => {
      const next = new Map(v);
      next.delete(id);
      return next;
    })
  }

  jointCommentRoom(analysisId: string) {
    this.socket.emit('joinRoom', analysisId);
  }

  onCommentNew() {
    this.socket.on('comment:new', (data: Comment) => {
      this.comment.set(data);

      if (this.userId() !== data.user.id) {

        this.newCommentCount.update(prev => {
          const next = new Map(prev)
          next.set(data.analysis.id, (next.get(data.analysis.id) ?? 0) + 1)

          return next;
        })

        console.log('Numero de nuevos comentarios', this.newCommentCount())
      }
    });
  }

  onUpdateComment() {
    this.socket.on('comment:update', (data: Comment) => {
      this.commentUpdate.set(data);
    });
  }

  onDeleteComment() {
    this.socket.on('comment:delete', (data: Comment) => {
      this.deletedComment.set(data)
    })
  }

  clientsUpdate() {
    this.socket.on('clients:update', (data: number) => {
      this.roomMembers.set(data)
    })
  }

  connect(){
    this.socket.connect()
  }

  disconnect(){
    this.socket.disconnect()
  }

}
