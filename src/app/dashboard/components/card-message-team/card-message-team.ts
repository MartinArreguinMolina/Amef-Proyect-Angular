import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { Comment } from 'src/app/dashboard/pages/services/amef.service';

@Component({
  selector: 'app-card-message-team',
  imports: [TitleCasePipe],
  templateUrl: './card-message-team.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardMessageTeam {
  private authService = inject(AuthService);
  comment = input.required<Comment>();
  userId = computed(() => this.authService.user()?.id);

  dateCreate = computed(() => new Date(this.comment().createdAt).toLocaleDateString());
  timeCreate = computed(() => new Date(this.comment().createdAt).toLocaleTimeString())

  dateUpdate = computed(() => new Date(this.comment().createdAt).toLocaleDateString());
  timeUpdate = computed(() => new Date(this.comment().createdAt).toLocaleTimeString())

}
