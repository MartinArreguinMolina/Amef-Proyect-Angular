import { NgClass, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { roomMembers, Comment} from '../../interfaces/interfaces';

@Component({
  selector: 'app-card-message-team',
  imports: [TitleCasePipe],
  templateUrl: './card-message-team.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardMessageTeam {
  private authService = inject(AuthService);
  comment = input.required<Comment>();
  roomMember = input.required<roomMembers>()

  userId = computed(() => this.authService.user()?.id);
  dateCreate = computed(() => new Date(this.comment().createdAt).toLocaleDateString());
  timeCreate = computed(() => new Date(this.comment().createdAt).toLocaleTimeString())

  isNew = computed(() => {
    return new Date(this.comment().createdAt).getTime() > new Date(this.roomMember().lastConnection!).getTime()
  })
}
