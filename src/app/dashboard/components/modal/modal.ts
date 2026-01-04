import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  delete = input.required<() => void>()
  title = input.required<string>()
  description = input.required<string>()

  executeDelte(){
    this.delete()()
  }
}
