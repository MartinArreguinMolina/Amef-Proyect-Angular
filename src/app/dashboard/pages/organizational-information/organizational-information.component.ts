import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, of, single } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { AmefService } from '../services/amef.service';
import { FormsErrorLabelComponent } from "src/app/shared/forms-error-label/forms-error-label.component";
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TitleCasePipe } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-organizational-information',
  imports: [ReactiveFormsModule, FormsErrorLabelComponent, RouterLink, TitleCasePipe],
  templateUrl: './organizational-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationalInformationComponent {
  constructor(private location: Location) { }

  goToBack() {
    this.location.back()
  }

  private fbuilder = inject(FormBuilder);
  authService = inject(AuthService);
  amefService = inject(AmefService);
  router = inject(Router)
  usersSignal = signal<string[]>([]);
  usersArrayEmpty = signal<boolean>(false);
  dateError = signal<boolean>(false);
  leadingDepartmentError = signal<boolean>(false);

  organizationalInformationCreate = signal<boolean>(false)

  userFilter = signal<string | null>('')

  departmentFilter = signal<string>('')


  fb = this.fbuilder.group({
    team: [''],
    proyectCode: ['', [Validators.required]],
    leadingDepartment: [''],
    system: [null, Validators.required],
    subsystem: [null, Validators.required],
    component: [null, Validators.required],
    dateOfOrigin: ['', [Validators.required]],
    targetDate: ['', [Validators.required]],
  });

  changeUserFilter(term: string) {
    if (!term) {
      this.userFilter.set(null)
      return;
    };
    this.userFilter.set(term);
  }

  changeDepartmentFilter(term: string) {
    if (!term) {
      this.departmentFilter.set('')
      return;
    }

    this.departmentFilter.set(term)
  }

  departments = rxResource({
    params: () => {
      return { department: this.departmentFilter() }
    },

    stream: ({ params }) => params.department ? this.amefService.getDepartaments(params.department) : of([])
  })

  addLeadingDepartment(leadingDepartment: string) {
    this.fb.patchValue({ leadingDepartment: leadingDepartment })
    this.leadingDepartmentError.set(false)
    this.departmentFilter.set('')
  }

  users = rxResource({
    params: () => this.userFilter(),
    stream: ({ params }) => {
      if (!params) return of([])
      return this.authService.getUserTerm(params);
    }
  })

  addUser(user: string) {
    if (this.usersSignal().includes(user)) return;
    this.usersSignal.update((r) => [...r, user])
  }


  deleteUser(user: string) {
    this.usersSignal.update((r) => {
      const users = r.filter((currentUser) => currentUser !== user);
      return users
    })
  }

  async onSubmit() {

    if (this.fb.invalid || this.usersSignal().length <= 0) {
      this.usersArrayEmpty.set(true)
      this.leadingDepartmentError.set(true)
      this.fb.markAllAsTouched();
      setTimeout(() => {
        this.usersArrayEmpty.set(false)
        this.leadingDepartmentError.set(false)
      }, 4000)
      return;
    }

    if (this.departmentFilter() || !this.fb.value.leadingDepartment) {
      this.leadingDepartmentError.set(true)
      return;
    }

    const dateOfOrigin = new Date(this.fb.value.dateOfOrigin!).getTime()
    const targetDate = new Date(this.fb.value.targetDate!).getTime()

    if (dateOfOrigin > targetDate) {
      this.dateError.set(true);
      return;
    }

    const raw = this.fb.value;
    const teamArray = this.usersSignal()

    const payload = {
      ...raw,
      team: teamArray,
      dateOfOrigin: raw.dateOfOrigin,
      targetDate: raw.targetDate,
      preparedById: this.authService.user()?.id
    };

    try {
      const res: any = await firstValueFrom(this.amefService.createOrganizationalInformation(payload))

      this.organizationalInformationCreate.set(true)

      setTimeout(() => {
        this.organizationalInformationCreate.set(false);
        this.router.navigate(['dashboard/amef', res.amefId, 'analysis']);
      }, 3000);

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
