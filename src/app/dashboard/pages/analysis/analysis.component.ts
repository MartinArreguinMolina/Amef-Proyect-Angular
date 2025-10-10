import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, OnInit,
  Directive, ElementRef, HostListener,
  computed, effect, inject, signal
} from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { AmefService } from '../services/amef.service';
import { of } from 'rxjs';
import { FormsErrorLabelComponent } from 'src/app/shared/forms-error-label/forms-error-label.component';

export interface AnalysisItem {
  id: string;
  systemFunction: string;
  failureMode: string;
  failureEffects: string;
  failureCauses: string;
  currentControls?: string | null;
  severity: number;
  occurrence: number;
  detection: number;
  npr: number;
}

type DetailForm = FormGroup<{
  id: FormControl<string | null>;
  systemFunction: FormControl<string>;
  failureMode: FormControl<string>;
  failureEffects: FormControl<string>;
  failureCauses: FormControl<string>;
  currentControls: FormControl<string | null>;
  severity: FormControl<number | null>;
  occurrence: FormControl<number | null>;
  detection: FormControl<number | null>;
  npr: FormControl<number | null>;
}>;

export type CreateAnalysisPayload = {
  systemFunction: string;
  failureMode: string;
  failureEffects: string;
  failureCauses: string;
  severity: number;
  occurrence: number;
  detection: number;
  currentControls?: string;
};
export type UpdateAnalysisPayload = Partial<CreateAnalysisPayload>;

@Directive({ selector: 'textarea[autoResize]', standalone: true })
export class AutoResizeTextareaDirective {
  constructor(private el: ElementRef<HTMLTextAreaElement>) { }
  ngAfterViewInit() { setTimeout(() => this.resize()); }
  @HostListener('input') onInput() { this.resize(); }
  private resize() {
    const ta = this.el.nativeElement;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }
}

type AP = 'H' | 'M' | 'L';

function bandS(s: number) { return s <= 6 ? 0 : (s <= 8 ? 1 : 2); }
function bandO(o: number) { return o <= 4 ? 0 : (o <= 7 ? 1 : 2); }
function bandD(d: number) { return d <= 4 ? 0 : (d <= 7 ? 1 : 2); }

const AP_TABLE: AP[][][] = [
  [
    ['L', 'M', 'M'],
    ['M', 'M', 'H'],
    ['M', 'H', 'H'],
  ],
  [
    ['M', 'M', 'H'],
    ['M', 'H', 'H'],
    ['H', 'H', 'H'],
  ],
  [
    ['M', 'H', 'H'],
    ['H', 'H', 'H'],
    ['H', 'H', 'H'],
  ]
];

function aiagVdaAP(s?: number | null, o?: number | null, d?: number | null): AP | null {
  if (!s || !o || !d) return null;
  return AP_TABLE[bandS(s)][bandO(o)][bandD(d)];
}

type ToastKind = 'success' | 'update' | 'delete' | 'error';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutoResizeTextareaDirective, FormsErrorLabelComponent, RouterLink],
  templateUrl: './analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisComponent implements OnInit {
  constructor(private location: Location){}

  goToThePreviousPage(){
    this.location.back();
  }

  tab = signal<'def' | 'eval' | 'acc'>('def');
  setTab(t: 'def' | 'eval' | 'acc') { this.tab.set(t); }
  isTab(t: 'def' | 'eval' | 'acc') { return this.tab() === t; }

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private api = inject(AmefService);

  amefId = signal<string>('');
  search = signal<string>('');
  selected = signal<string | null>(null);
  saving = signal<boolean>(false);
  creatingNew = signal<boolean>(false);

  toast = signal<{ kind: ToastKind; text: string } | null>(null);
  private toastTimer?: any;
  private showToast(text: string, kind: ToastKind = 'success', ms = 2200) {
    this.toast.set({ kind, text });
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), ms);
  }
  closeToast() { if (this.toastTimer) clearTimeout(this.toastTimer); this.toast.set(null); }

  analysesRes = rxResource<AnalysisItem[], string | null>({
    params: () => this.amefId() || null,
    stream: ({ params }) => params ? this.api.listAnalyses(params) : of([]),
  });

  listFiltered = computed<AnalysisItem[]>(() => {
    const list = this.analysesRes.value() ?? [];
    const q = this.search().trim().toLowerCase();
    if (!q) return list;
    return list.filter(a =>
      (a.systemFunction ?? '').toLowerCase().includes(q) ||
      (a.failureMode ?? '').toLowerCase().includes(q) ||
      (a.failureEffects ?? '').toLowerCase().includes(q) ||
      (a.failureCauses ?? '').toLowerCase().includes(q)
    );
  });

  form: DetailForm = this.fb.group({
    id: this.fb.control<string | null>(null),
    systemFunction: this.fb.control<string>('', { nonNullable: true, validators: [Validators.required] }),
    failureMode: this.fb.control<string>('', { nonNullable: true, validators: [Validators.required] }),
    failureEffects: this.fb.control<string>('', { nonNullable: true, validators: [Validators.required] }),
    failureCauses: this.fb.control<string>('', { nonNullable: true, validators: [Validators.required] }),
    currentControls: this.fb.control<string | null>(null),
    severity: this.fb.control<number | null>(null, { validators: [Validators.required, Validators.min(1), Validators.max(10)] }),
    occurrence: this.fb.control<number | null>(null, { validators: [Validators.required, Validators.min(1), Validators.max(10)] }),
    detection: this.fb.control<number | null>(null, { validators: [Validators.required, Validators.min(1), Validators.max(10)] }),
    npr: this.fb.control<number | null>(null),
  });

  private syncFormEffect = effect(() => {
    const list = this.listFiltered();
    const isCreating = this.creatingNew();
    const current = this.selected();
    if (isCreating) return;

    const still = current && list.some(x => x.id === current);
    const sel = still ? current! : (list[0]?.id ?? null);

    if (!sel) { this.selected.set(null); this.form.reset(); return; }
    if (sel !== current) this.selected.set(sel);

    const item = list.find(x => x.id === sel);
    if (!item) return;

    this.form.setValue({
      id: item.id,
      systemFunction: item.systemFunction,
      failureMode: item.failureMode,
      failureEffects: item.failureEffects,
      failureCauses: item.failureCauses,
      currentControls: item.currentControls ?? null,
      severity: item.severity,
      occurrence: item.occurrence,
      detection: item.detection,
      npr: item.npr,
    }, { emitEvent: false });
  });

  private nprEffect = effect(() => {
    const s = Number(this.form.controls.severity.value ?? 0);
    const o = Number(this.form.controls.occurrence.value ?? 0);
    const d = Number(this.form.controls.detection.value ?? 0);
    const npr = (s && o && d) ? s * o * d : null;
    this.form.controls.npr.setValue(npr, { emitEvent: false });
  });

  get ap(): AP | null {
    const v = this.form.value;
    const s = Number(v.severity);
    const o = Number(v.occurrence);
    const d = Number(v.detection);
    if (!s || !o || !d) return null;
    return aiagVdaAP(s, o, d);
  }

  apText(ap: AP | null): string {
    if (!ap) return '';
    return ap === 'H' ? 'Alta' : ap === 'M' ? 'Media' : 'Baja';
  }
  apClass(ap: AP | null): string {
    if (ap === 'H') return 'bg-red-100 text-red-800 border-red-200';
    if (ap === 'M') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (ap === 'L') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('amefId');
    if (id) this.amefId.set(id);
  }

  setSearch(value: string) { this.search.set(value); }
  select(id: string) { this.creatingNew.set(false); this.selected.set(id); }

  private resetFormBlank() {
    this.form.reset({
      id: null,
      systemFunction: '',
      failureMode: '',
      failureEffects: '',
      failureCauses: '',
      currentControls: null,
      severity: null,
      occurrence: null,
      detection: null,
      npr: null,
    });
  }

  newAnalysis() {
    this.creatingNew.set(true);
    this.selected.set(null);
    this.resetFormBlank();
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const wasCreate = !this.form.value.id;
    const id = this.form.value.id ?? undefined;
    const payload: CreateAnalysisPayload = {
      systemFunction: this.form.value.systemFunction!,
      failureMode: this.form.value.failureMode!,
      failureEffects: this.form.value.failureEffects!,
      failureCauses: this.form.value.failureCauses!,
      severity: Number(this.form.value.severity),
      occurrence: Number(this.form.value.occurrence),
      detection: Number(this.form.value.detection),
      ...(this.form.value.currentControls ? { currentControls: this.form.value.currentControls } : {}),
    };

    const req$ = id
      ? this.api.updateAnalysis(this.amefId(), id, payload as UpdateAnalysisPayload)
      : this.api.createAnalysis(this.amefId(), payload);

    req$.subscribe({
      next: (createdOrUpdated: any) => {
        this.saving.set(false);
        this.creatingNew.set(false);
        if (createdOrUpdated?.id) this.selected.set(createdOrUpdated.id);
        this.analysesRes.reload();
        this.showToast(wasCreate ? 'Análisis creado correctamente' : 'Análisis actualizado',
          wasCreate ? 'success' : 'update');
      },
      error: () => { this.saving.set(false); this.showToast('Ocurrió un error al guardar', 'error'); }
    });
  }

  delete() {
    const id = this.form.value.id;
    if (!id) return;
    this.api.deleteAnalysis(this.amefId(), id).subscribe({
      next: () => {
        this.creatingNew.set(false);
        this.selected.set(null);
        this.analysesRes.reload();
        this.showToast('Análisis eliminado', 'delete');
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
