import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'message-notification',
  imports: [],
  templateUrl: './notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  title = input.required<string>()
  subtitle = input.required<string>()
  error = input<boolean>(false)
}
