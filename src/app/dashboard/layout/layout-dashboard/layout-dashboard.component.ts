import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-dashboard',
  imports: [RouterOutlet],
  templateUrl: './layout-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutDashboardComponent { }
