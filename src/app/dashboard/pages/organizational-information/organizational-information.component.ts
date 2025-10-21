import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, input, linkedSignal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { firstValueFrom, of } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { AmefService } from '../services/amef.service';
import { FormsErrorLabelComponent } from "src/app/shared/forms-error-label/forms-error-label.component";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgClass, TitleCasePipe } from '@angular/common';
import { Location } from '@angular/common';
import { NotificationComponent } from 'src/app/shared/notification/notification.component';


function validLeadingDepartment(leadingDepartment: string[]) {
  return (control: AbstractControl): ValidationErrors | null => {
    const currentValue = control.value;

    if (currentValue == null || currentValue === '') return null

    return leadingDepartment.includes(currentValue) ? null : { selectionInvalid: true }
  }
}

interface User {
  userId: string,
  fullName: string
}

@Component({
  selector: 'app-organizational-information',
  imports: [ReactiveFormsModule, FormsErrorLabelComponent, RouterLink, TitleCasePipe, NgClass, NotificationComponent],
  templateUrl: './organizational-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationalInformationComponent {
  activatedRoute = inject(ActivatedRoute)
  fbuilder = inject(FormBuilder);
  authService = inject(AuthService);
  amefService = inject(AmefService);
  router = inject(Router)

  usersSignal = signal<User[]>([]);
  usersArrayEmpty = signal<boolean>(false);
  dateError = signal<boolean>(false);
  organizationalInformationCreate = signal<boolean>(false)
  userFilter = signal<string | null>('')
  departmentFilter = signal<string>('')
  departmentUserFilter = signal<string>('')
  disableListDepartments = signal<boolean>(true)
  update = signal<boolean>(false)
  successfulUpdate = signal<boolean>(false)

  fb = this.fbuilder.group({
    team: [''],
    proyectCode: ['', [Validators.required]],
    leadingDepartment: ['', [Validators.required]],
    system: ['', Validators.required],
    subsystem: ['', Validators.required],
    component: ['', Validators.required],
    dateOfOrigin: ['', [Validators.required]],
    targetDate: ['', [Validators.required]],
  });


  constructor(private location: Location) {
    console.log(this.selectedAmefId())
  }

  goToBack() {
    this.location.back()
  }


  amefId = this.activatedRoute.snapshot.queryParamMap.get('id') ?? ''
  selectedAmefId = linkedSignal(() => this.amefId)

  private dataSelectedValuesAmef = effect(async () => {
    const amefId = this.selectedAmefId()

    if (!amefId) {
      return
    }

    this.update.set(true)
    const amef = await firstValueFrom(this.amefService.getAmefById(this.selectedAmefId()))

    const planeUsers = amef.team.map((a) => {
      return { userId: a.id, fullName: a.fullName }
    });

    this.usersSignal.set(planeUsers)
    this.departmentFilter.set(amef.leadingDepartment)
    this.disableListDepartments.set(false)

    const { component, subsystem, system } = amef


    if (component) this.disableComponent(component ?? '');
    if (system) this.disableSystem(system ?? '');
    if (subsystem) this.disableSubsystem(subsystem ?? '');



    this.fb.patchValue({
      system: system ?? '',
      subsystem: subsystem ?? '',
      component: component ?? '',
      dateOfOrigin: amef.dateOfOrigin,
      targetDate: amef.targetDate ?? '',
      proyectCode: amef.proyectCode ?? '',
      leadingDepartment: amef.leadingDepartment ?? ''
    })
  })

  changeUserFilter(term: string) {
    if (!term) {
      this.userFilter.set(null)
      return;
    };
    this.userFilter.set(term);
  }

  users = rxResource({
    params: () => ({ userFilter: this.userFilter(), deparment: this.departmentUserFilter() }),
    stream: ({ params }) =>
      (params.deparment && params.userFilter)
        ? this.amefService.getUsersByDepartmentAndTerm(params.deparment, params.userFilter)
        : (params.userFilter && !params.deparment)
          ? this.authService.getUserTerm(params.userFilter)
          : of([])
  })

  currentUsers = computed(() => this.users.value()?.filter((u) => u.id !== this.authService.user()?.id))

  changeDepartmentFilter(term: string) {
    if (!term) {
      this.departmentFilter.set('')
      return;
    }

    this.departmentFilter.set(term)
    this.disableListDepartments.set(true)
  }

  addLeadingDepartment(department: string) {
    this.fb.patchValue({ leadingDepartment: department })
    this.disableListDepartments.set(false)
  }

  departments = rxResource({
    params: () => {
      return { department: this.departmentFilter() }
    },

    stream: ({ params }) => params.department ? this.amefService.getDepartaments(params.department) : of([])
  })

  allDepartments = rxResource({
    stream: () => this.amefService.getDepartaments('')
  })

  addDepartmentUserFilter(deparment: string) {
    this.departmentUserFilter.set(deparment)
  }

  deleteDepartmentUserFilter() {
    this.departmentUserFilter.set('')
  }

  allowedDepartments = computed(() => {
    return this.departments.value()?.map((d) => d.department) ?? []
  })

  private _bindLeadingDepartmentValidator = effect(() => {

    const currentLeadingDepartments = this.allowedDepartments()
    const controlLeadingDepartment = this.fb.get('leadingDepartment');

    if (!controlLeadingDepartment) return;


    controlLeadingDepartment.setValidators([Validators.required, validLeadingDepartment(currentLeadingDepartments)])
    controlLeadingDepartment.updateValueAndValidity({ emitEvent: false, onlySelf: false })
  })

  addUser(currentUser: User) {
    this.usersSignal.update((r) => [...r.filter(user => user.userId !== currentUser.userId), currentUser])
  }

  deleteUser(userId: string) {
    this.usersSignal.update((r) => {
      const users = r.filter((currentUser) => currentUser.userId !== userId);
      return users
    })
  }

  async onSubmit() {

    if (this.usersSignal().length <= 0) {
      this.usersArrayEmpty.set(true)
      this.fb.markAllAsTouched();
      setTimeout(() => {
        this.usersArrayEmpty.set(false)
      }, 4000)
      return;
    }

    if (this.fb.invalid) {
      console.log('AQUI ES', this.fb.status, this.fb.errors);
      this.fb.markAllAsTouched();
      return;
    }

    const dateOfOrigin = new Date(this.fb.value.dateOfOrigin!).getTime()
    const targetDate = new Date(this.fb.value.targetDate!).getTime()

    if (dateOfOrigin > targetDate) {
      this.dateError.set(true);
      return;
    }

    const raw = this.fb.value;
    const teamArray = this.usersSignal().map(user => {
      return user.userId
    })

    console.log(teamArray)

    const payload = {
      ...raw,
      team: teamArray,
      dateOfOrigin: raw.dateOfOrigin,
      targetDate: raw.targetDate,
      preparedById: this.authService.user()?.id
    };

    try {

      if (!this.update()) {
        const res: any = await firstValueFrom(this.amefService.createOrganizationalInformation(payload))

        this.organizationalInformationCreate.set(true)

        setTimeout(() => {
          this.organizationalInformationCreate.set(false);
          this.router.navigate(['dashboard/amef', res.amefId, 'analysis']);
        }, 3000);

        this.fb.reset()
      }else{
        const res = await firstValueFrom(this.amefService.updateAmef(this.selectedAmefId(), payload))

        this.successfulUpdate.set(true)

        setTimeout(() => {
          this.successfulUpdate.set(false)
        }, 3000)
      }
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
