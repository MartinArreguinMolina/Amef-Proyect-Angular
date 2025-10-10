import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth-service.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  fb = inject(FormBuilder)
  router = inject(Router);

  authService = inject(AuthService)

  login = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
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

    console.log(currentLogin)

    const res = await firstValueFrom(this.authService.login(currentLogin));

    if (res) this.router.navigateByUrl('/')
  }
}
