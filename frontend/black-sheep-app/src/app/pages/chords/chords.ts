import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ChordService } from '../../core/services/chord.service';
import { CHORD_FAMILIES, FAMILY_COLORS, ChordVariant } from '../../core/constants/chords';

@Component({
  selector: 'app-chords',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './chords.html',
  styleUrl: './chords.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chords {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  chordService = inject(ChordService);

  readonly families = CHORD_FAMILIES;
  readonly familyColors = FAMILY_COLORS;

  /** Raíz seleccionada vía URL: /acordes/:root (default = 'C') */
  selectedRoot = toSignal(
    this.route.paramMap.pipe(map(p => p.get('root') ?? 'C')),
    { initialValue: 'C' },
  );

  /** Variante seleccionada vía query param: ?v=m7 (default = '' = mayor) */
  selectedVariantSuffix = toSignal(
    this.route.queryParamMap.pipe(map(q => q.get('v') ?? '')),
    { initialValue: '' },
  );

  /** Acorde activo completo (raíz + variante seleccionada) */
  activeChord = computed(() =>
    this.chordService.resolve(this.selectedRoot(), this.selectedVariantSuffix())
  );

  /** Todas las variantes resueltas para la raíz actual */
  allVariantsForRoot = computed(() =>
    this.chordService.resolveAllVariants(this.selectedRoot())
  );

  /** Variantes agrupadas por familia para el listado */
  variantsByFamily = computed(() => {
    const all = this.allVariantsForRoot();
    return this.families.map(fam => ({
      ...fam,
      chords: all.filter(c => c.variant.family === fam.key),
    }));
  });

  selectVariant(suffix: string): void {
    this.router.navigate(['/acordes', this.selectedRoot()], {
      queryParams: { v: suffix || null },
      queryParamsHandling: 'merge',
    });
  }
}
