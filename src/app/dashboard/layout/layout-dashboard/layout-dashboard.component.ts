import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "src/app/shared/navbar/navbar.component";

@Component({
  selector: 'app-layout-dashboard',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './layout-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutDashboardComponent { }
