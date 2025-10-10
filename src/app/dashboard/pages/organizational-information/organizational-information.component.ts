import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { AmefService } from '../services/amef.service';
import { FormsErrorLabelComponent } from "src/app/shared/forms-error-label/forms-error-label.component";
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-organizational-information',
  imports: [ReactiveFormsModule, FormsErrorLabelComponent, RouterLink],
  templateUrl: './organizational-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationalInformationComponent {
  private fbuilder = inject(FormBuilder);
  authService = inject(AuthService);
  amefService = inject(AmefService)
  router = inject(Router)

  organizationalInformationCreate = signal<boolean>(false)


  // Form conectado al HTML
  fb = this.fbuilder.group({

    // Team como CSV por ahora (luego puedes mapearlo a string[] en el submit)
    team: ['', [Validators.required, Validators.minLength(1)]],

    // Identificación
    proyectCode: ['', [Validators.required]],
    leadingDepartment: ['', [Validators.required, Validators.minLength(1)]],
    system: [null, Validators.required],
    subsystem: [null, Validators.required],
    component: [null, Validators.required],

    // Fechas
    dateOfOrigin: ['', [Validators.required]],
    targetDate: ['', [Validators.required]],
  });


  async onSubmit() {

    if (this.fb.invalid) {
      this.fb.markAllAsTouched();
      return;
    }

    // Mapeo opcional: team CSV -> string[]
    const raw = this.fb.value;
    const teamArray = (raw.team ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      ...raw,
      team: teamArray,
      // Asegurar ISO strings si usas <input type="date">
      dateOfOrigin: raw.dateOfOrigin,
      targetDate: raw.targetDate,
      preparedById: this.authService.user()?.id
    };

    try {
      const res: any = await firstValueFrom(this.amefService.createOrganizationalInformation(payload))

      this.organizationalInformationCreate.set(true)

      setTimeout(() => {
        this.organizationalInformationCreate.set(false);
      }, 1500);

      this.router.navigate(['dashboard/amef', res.amefId, 'analysis']);


      this.fb.reset()
    } catch (error) {
      console.log(error)
    }
  }

  disableSystem(value: string) {
    if (value) {
      this.fb.get('subsystem')?.disable()
      this.fb.get('component')?.disable()
    } else {
      this.enable()
    }
  }

  disableSubsystem(value: string) {
    if (value) {
      this.fb.get('system')?.disable()
      this.fb.get('component')?.disable()
    } else {
      this.enable()
    }
  }
  disableComponent(value: string) {
    if (value) {
      this.fb.get('system')?.disable()
      this.fb.get('subsystem')?.disable()
    } else {
      this.enable()
    }
  }

  enable() {
    this.fb.get('subsystem')?.enable()
    this.fb.get('system')?.enable()
    this.fb.get('component')?.enable()

    this.fb.patchValue({ system: null })
    this.fb.patchValue({ component: null })
    this.fb.patchValue({ subsystem: null })
  }
}
