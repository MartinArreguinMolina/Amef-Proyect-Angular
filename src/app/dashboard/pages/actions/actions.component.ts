import { CommonModule, Location } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, OnInit,
  Directive, ElementRef, HostListener,
  computed, effect, inject, signal
} from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, Observable } from 'rxjs';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

import { AmefService, ActionItem, ActionCreateDto } from '../services/amef.service';
import { FormsErrorLabelComponent } from 'src/app/shared/forms-error-label/forms-error-label.component';
import { AuthService } from 'src/app/auth/service/auth-service.service';

/* Auto-resize */
@Directive({ selector: 'textarea[autoResize]', standalone: true })
export class AutoResizeTextareaDirective {
  constructor(private el: ElementRef<HTMLTextAreaElement>) {}
  ngAfterViewInit() { setTimeout(() => this.resize()); }
  @HostListener('input') onInput() { this.resize(); }
  private resize() {
    const ta = this.el.nativeElement;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }
}

/* Form tipado */
type ActionForm = FormGroup<{
  id: FormControl<string | null>;

  recommendedAction: FormControl<string>;
  responsible: FormControl<string>;
  targetDate: FormControl<string>;

  implementedAction: FormControl<string | null>;
  completionDate: FormControl<string | null>;

  newSeverity: FormControl<number | null>;
  newOccurrence: FormControl<number | null>;
  newDetection: FormControl<number | null>;
}>;

type ToastKind = 'success' | 'update' | 'delete' | 'error';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutoResizeTextareaDirective, FormsErrorLabelComponent, RouterLink],
  templateUrl: './actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(AmefService);
  private fb = inject(FormBuilder);

  authService = inject(AuthService)

  termSearch = signal<string>('')

  constructor(private location: Location){}

  goToBack(){
    this.location.back()
  }

  changeSearch(term: string){
    if(!term){
      this.termSearch.set('')
      return;
    }

    this.termSearch.set(term)
  }

  users = rxResource({
    params: () => {
      return ({term: this.termSearch()})
    },
    stream: ({params}) => this.authService.getUserTerm(params.term)
  })

  addUser(user: string){
    this.form.patchValue({responsible: user})
    this.termSearch.set('');
  }

  amefId = signal<string>('');
  analysisId = signal<string>('');

  search = signal<string>('');
  selected = signal<string | null>(null);
  saving = signal<boolean>(false);
  creatingNew = signal<boolean>(false);

  /* Toast */
  toast = signal<{ kind: ToastKind; text: string } | null>(null);
  private toastTimer?: any;
  private showToast(text: string, kind: ToastKind = 'success', ms = 2200) {
    this.toast.set({ kind, text });
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), ms);
  }
  closeToast() { if (this.toastTimer) clearTimeout(this.toastTimer); this.toast.set(null); }

  /* NPR base del análisis */
  analysisRes = rxResource<
    { severity: number; occurrence: number; detection: number } | null,
    { amefId: string; analysisId: string } | null
  >({
    params: () => {
      const a = this.amefId(); const b = this.analysisId();
      return (a && b) ? ({ amefId: a, analysisId: b }) : null;
    },
    stream: ({ params }) => params ? this.api.getAnalysis(params.amefId, params.analysisId) : of(null)
  });

  baseSeverity   = computed(() => this.analysisRes.value()?.severity   ?? 0);
  baseOccurrence = computed(() => this.analysisRes.value()?.occurrence ?? 0);
  baseDetection  = computed(() => this.analysisRes.value()?.detection  ?? 0);
  nprBefore = computed<number | null>(() => {
    const s = this.baseSeverity(), o = this.baseOccurrence(), d = this.baseDetection();
    return s && o && d ? s * o * d : null;
  });

  /* Acciones */
  actionsRes = rxResource<ActionItem[], { amefId: string; analysisId: string } | null>({
    params: () => {
      const a = this.amefId(); const b = this.analysisId();
      return (a && b) ? ({ amefId: a, analysisId: b }) : null;
    },
    stream: ({ params }) => params ? this.api.getActions(params.amefId, params.analysisId) : of([])
  });

  listFiltered = computed<ActionItem[]>(() => {
    const q = this.search().trim().toLowerCase();
    const list = this.actionsRes.value() ?? [];
    const filtered = list.filter(a =>
      !q ||
      (a.recommendedAction ?? '').toLowerCase().includes(q) ||
      (a.responsible ?? '').toLowerCase().includes(q)
    );
    // vencidas primero, luego target asc
    return filtered.sort((a, b) => {
      const overdue = (x: ActionItem) =>
        !x.completionDate &&
        x.targetDate &&
        new Date(x.targetDate).getTime() < Date.now();
      const ao = overdue(a) ? -1 : 0;
      const bo = overdue(b) ? -1 : 0;
      if (ao !== bo) return ao - bo;
      return (new Date(a.targetDate || 0).getTime()) - (new Date(b.targetDate || 0).getTime());
    });
  });

  /* Formulario */
  form: ActionForm = this.fb.group({
    id: this.fb.control<string | null>(null),

    recommendedAction: this.fb.control<string>('', { nonNullable: true, validators: [Validators.required] }),
    responsible:       this.fb.control<string>('', { nonNullable: true, validators: [Validators.required] }),
    targetDate:        this.fb.control<string>('', { nonNullable: true, validators: [Validators.required] }),

    implementedAction: this.fb.control<string | null>(null),
    completionDate:    this.fb.control<string | null>(null),

    newSeverity:   this.fb.control<number | null>(null, { validators: [Validators.min(1), Validators.max(10)] }),
    newOccurrence: this.fb.control<number | null>(null, { validators: [Validators.min(1), Validators.max(10)] }),
    newDetection:  this.fb.control<number | null>(null, { validators: [Validators.min(1), Validators.max(10)] }),
  });

  /** Puente: observable del form -> señal reactiva */
  private formState = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue()
  });

  /* NPR' (solo si hay S’/O’/D’) */
  nprAfter = computed<number | null>(() => {
    const v = this.formState();   // <- cambia cuando el form emite
    const s = Number(v.newSeverity   ?? 0);
    const o = Number(v.newOccurrence ?? 0);
    const d = Number(v.newDetection  ?? 0);
    return (s && o && d) ? s * o * d : null;
  });

  // NPR efectivo mostrado en el círculo: usa NPR' si existe, si no el NPR base
  nprEffective = computed<number | null>(() => this.nprAfter() ?? this.nprBefore());

  /* Sincroniza selección -> form (emitimos cambios para refrescar NPR) */
  private syncFormEffect = effect(() => {
    const list = this.listFiltered();
    const current = this.selected();
    const stillExists = current && list.some(x => x.id === current);
    const sel = stillExists ? current! : (list[0]?.id ?? null);

    if (this.creatingNew()) return;

    if (!sel) {
      this.selected.set(null);
      this.form.reset(); // emite por defecto
      return;
    }

    if (sel !== current) this.selected.set(sel);
    const item = list.find(x => x.id === sel);
    if (!item) return;

    this.form.setValue({
      id: item.id,
      recommendedAction: item.recommendedAction ?? '',
      responsible:       item.responsible ?? '',
      targetDate:        item.targetDate ?? '',

      implementedAction: item.implementedAction ?? null,
      completionDate:    item.completionDate ?? null,

      newSeverity:   item.newSeverity ?? null,
      newOccurrence: item.newOccurrence ?? null,
      newDetection:  item.newDetection ?? null,
    }); // <- sin emitEvent:false
  });

  ngOnInit(): void {
    const amefId = this.route.snapshot.paramMap.get('amefId');
    const analysisId = this.route.snapshot.paramMap.get('analysisId');
    if (amefId) this.amefId.set(amefId);
    if (analysisId) this.analysisId.set(analysisId);
  }

  setSearch(v: string) { this.search.set(v); }

  select(id: string) {
    this.creatingNew.set(false);
    this.selected.set(id);
  }

  newAction() {
    this.creatingNew.set(true);
    this.selected.set(null);
    this.form.reset({ id: null });
  }

  save() {
    // Validación simple de fechas si ambas existen
    const target = this.form.value.targetDate ? new Date(this.form.value.targetDate).getTime() : 0;
    const done   = this.form.value.completionDate ? new Date(this.form.value.completionDate).getTime() : 0;
    if (done && target && done < target) {
      this.showToast('La fecha de cierre no puede ser anterior a la target', 'error');
      return;
    }

    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving.set(true);
    const wasCreate = !this.form.value.id;

    // DTO con campos opcionales, acorde a CreateActionDto
    const dto: ActionCreateDto = {
      recommendedAction: this.form.value.recommendedAction!,
      responsible:       this.form.value.responsible!,
      targetDate:        this.form.value.targetDate!,
      ...(this.form.value.implementedAction ? { implementedAction: this.form.value.implementedAction } : {}),
      ...(this.form.value.completionDate   ? { completionDate: this.form.value.completionDate } : {}),
      ...(this.form.value.newSeverity      ? { newSeverity:   Number(this.form.value.newSeverity) } : {}),
      ...(this.form.value.newOccurrence    ? { newOccurrence: Number(this.form.value.newOccurrence) } : {}),
      ...(this.form.value.newDetection     ? { newDetection:  Number(this.form.value.newDetection) } : {}),
    };

    const req$: Observable<ActionItem> = wasCreate
      ? this.api.createAction(this.amefId(), this.analysisId(), dto)
      : this.api.updateAction(this.amefId(), this.analysisId(), this.form.value.id!, dto);

    req$.subscribe({
      next: (saved: ActionItem) => {
        this.saving.set(false);
        this.creatingNew.set(false);
        if (saved?.id) this.selected.set(saved.id);
        this.actionsRes.reload();

        if (this.nprBefore() && this.nprAfter() && this.nprAfter()! >= this.nprBefore()!) {
          this.showToast(wasCreate ? 'Acción creada, pero NPR no disminuye' : 'Acción actualizada, NPR no disminuye', 'update');
        } else {
          this.showToast(wasCreate ? 'Acción creada' : 'Acción actualizada', wasCreate ? 'success' : 'update');
        }
      },
      error: () => {
        this.saving.set(false);
        this.showToast('No se pudo guardar la acción', 'error');
      }
    });
  }

  delete() {
    const id = this.form.value.id;
    if (!id) return;
    this.api.deleteAction(this.amefId(), this.analysisId(), id).subscribe({
      next: () => {
        this.creatingNew.set(false);
        this.selected.set(null);
        this.actionsRes.reload();
        this.showToast('Acción eliminada', 'delete');
      },
      error: () => this.showToast('No se pudo eliminar', 'error')
    });
  }

  nprColor(npr: number | null) {
    if (!npr) return 'badge-ghost';
    if (npr >= 200) return 'bg-red-100 text-red-800 border-red-200';
    if (npr >= 100) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
}
