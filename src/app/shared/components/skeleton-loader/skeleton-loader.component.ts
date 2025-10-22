import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.css'],
})
export class SkeletonLoaderComponent {
  @Input() type: 'text' | 'circle' | 'rect' | 'card' | 'list' = 'rect';
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() count: number = 1;
  @Input() circle: boolean = false;

  get skeletonArray(): number[] {
    return Array(this.count).fill(0);
  }
}
