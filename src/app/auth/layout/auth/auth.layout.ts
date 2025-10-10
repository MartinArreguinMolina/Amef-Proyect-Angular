import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../../../shared/footer/footer.component";

@Component({
  selector: 'auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth.layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent { }
