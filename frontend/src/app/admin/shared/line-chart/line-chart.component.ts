import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

export interface LineChartPoint {
  label: string;
  amount: number;
}

/**
 * Hand-rolled inline-SVG line/area chart (no charting library can be
 * installed in this environment - see the round-1 notes on the blocked npm
 * registry). Used for the revenue chart (gap doc item 17); native <title>
 * elements give a hover tooltip without any JS dependency.
 */
@Component({
  selector: 'nh-line-chart',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
})
export class LineChartComponent {
  readonly points = input.required<LineChartPoint[]>();
  readonly width = 320;
  readonly height = 120;

  readonly plot = computed(() => {
    const pts = this.points();
    const max = Math.max(1, ...pts.map((p) => p.amount));
    const stepX = pts.length > 1 ? this.width / (pts.length - 1) : this.width;
    return pts.map((point, index) => ({
      x: pts.length > 1 ? index * stepX : this.width / 2,
      y: this.height - (point.amount / max) * (this.height - 18) - 8,
      ...point,
    }));
  });

  readonly linePath = computed(() =>
    this.plot()
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
      .join(' '),
  );

  readonly areaPath = computed(() => {
    const plot = this.plot();
    if (!plot.length) return '';
    const last = plot[plot.length - 1];
    return `M${plot[0].x.toFixed(1)},${this.height} L${plot.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')} L${last.x.toFixed(1)},${this.height} Z`;
  });
}
