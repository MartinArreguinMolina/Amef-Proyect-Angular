import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth-service.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { FormsErrorLabelComponent } from "src/app/shared/forms-error-label/forms-error-label.component";
import { FormUtils } from 'src/app/utils/form-utils';
import { NotificationComponent } from 'src/app/shared/notification/notification.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsErrorLabelComponent, NotificationComponent],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  fb = inject(FormBuilder)
  router = inject(Router);
  authService = inject(AuthService)

  credentialError = signal<boolean>(false)

  login = this.fb.group({


    email: ['', [Validators.required, Validators.pattern(FormUtils.emailPattern)]],
    password: ['', Validators.required]
  })

  async onSubmit() {
    if (this.login.invalid) {
      this.login.markAllAsTouched()
      return;
    }

    const currentLogin = {
      ...this.login.value as any
    }


    const res = await firstValueFrom(this.authService.login(currentLogin));

    if (res) {
      this.router.navigateByUrl('/')
    } else {
      this.credentialError.set(true)

      setTimeout(() => {
        this.credentialError.set(false)
      }, 3000)
    }

  }
}
