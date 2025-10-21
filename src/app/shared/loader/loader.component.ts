import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  imports: [],
  styleUrl: 'style.css',
  templateUrl: './loader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent { }
