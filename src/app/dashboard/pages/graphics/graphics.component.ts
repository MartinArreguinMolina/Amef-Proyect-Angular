import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore, ThemeOption } from 'ngx-echarts';

// ECharts core (modular)
import * as echarts from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';

// Charts & components necesarios
import { PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { CoolTheme } from './data.graphics';

// Registrar TODO lo que usas en `options`
echarts.use([PieChart, GridComponent, LegendComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './graphics.component.html',
  providers: [provideEchartsCore({ echarts })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphicsComponent {
  // Puedes usar string (si registras el tema global) o un objeto ThemeOption:
  coolTheme: string | ThemeOption = CoolTheme;

  options: EChartsCoreOption = {
    title: {
      left: '50%',
      text: 'Nightingale Rose Diagram',
      subtext: 'Mocking Data',
      textAlign: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    legend: {
      align: 'auto',
      bottom: 10,
      data: ['rose1', 'rose2', 'rose3', 'rose4', 'rose5', 'rose6', 'rose7', 'rose8'],
    },
    // `calculable` es legacy; puedes omitirlo si no usas toolbox de cálculo
    series: [
      {
        name: 'area',
        type: 'pie',
        radius: [30, 150],
        roseType: 'area',
        // opcional: mejora el label si quieres
        // label: { show: true, formatter: '{b}: {d}%' },
        data: [
          { value: 10, name: 'rose1' },
          { value: 5, name: 'rose2' },
          { value: 15, name: 'rose3' },
          { value: 25, name: 'rose4' },
          { value: 20, name: 'rose5' },
          { value: 35, name: 'rose6' },
          { value: 30, name: 'rose7' },
          { value: 40, name: 'rose8' },
        ],
      },
    ],
  };
}
