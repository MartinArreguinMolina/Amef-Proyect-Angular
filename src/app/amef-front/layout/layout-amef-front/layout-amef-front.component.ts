import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "src/app/shared/footer/footer.component";

@Component({
  selector: 'app-layout-amef-front',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './layout-amef-front.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutAmefFrontComponent { }
