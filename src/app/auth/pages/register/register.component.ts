import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsErrorLabelComponent } from 'src/app/shared/forms-error-label/forms-error-label.component';
import { FormUtils } from 'src/app/utils/form-utils';
import { AuthService } from '../../service/auth-service.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationComponent } from 'src/app/shared/notification/notification.component';

@Component({
  selector: 'app-register',
  imports: [FormsErrorLabelComponent, ReactiveFormsModule, NotificationComponent],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  roleOpen = signal(false);
  deptOpen = signal(false);
  singUpSucess = signal(false);


  idRolSelected = signal('');
  idDeptSelected = signal('');
  seePassword = signal<boolean>(false);
  singUpError = this.authService.singUpError;

  registerForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern(FormUtils.emailPattern)]],
    password: ['', [Validators.required, Validators.pattern(FormUtils.passwordPattern), Validators.minLength(6), Validators.maxLength(50)]],
    confirmPassword: ['', [Validators.required, Validators.pattern(FormUtils.passwordPattern), Validators.minLength(6), Validators.maxLength(50)]],
    rol: ['', Validators.required],
    departament: ['', Validators.required],
  })

  onCheckboxChange(event: Event){
    this.seePassword.update((current) => !current);
  }

  roles = rxResource({
    stream: () => this.authService.getRoles(),
  })

  departaments = rxResource({
    stream: () => this.authService.getDepartaments(),
  })

  async onSubmit() {
    if(this.registerForm.invalid ){
      this.registerForm.markAllAsTouched();
    }

    if(this.registerForm.value.password !== this.registerForm.value.confirmPassword){
      this.registerForm.get('confirmPassword')?.setErrors({passwordsNotEqual: true});
      return;
    }

    const registerUser = {
      fullName: this.registerForm.value.fullName!,
      email: this.registerForm.value.email!,
      password: this.registerForm.value.password!,
      roles: [this.idRolSelected()!],
      departments: [this.idDeptSelected()!],
    }


    const res = await firstValueFrom(this.authService.singUp(registerUser as any));

    if(res){
      this.singUpSucess.set(true);

      setTimeout(() => {
        this.router.navigateByUrl('/auth/login');
      }, 3000);
    }else{
      setTimeout(() => {
        this.authService.singUpError.set(null);
      }, 3000);
    }
  }
}
