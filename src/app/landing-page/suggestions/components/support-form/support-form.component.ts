import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FAQ, SupportForm } from '../../services/suggestions.service';
import { BaseFormComponent } from '../base-form/base-form.component';

@Component({
  selector: 'app-support-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './support-form.component.html',
  styleUrls: ['../../suggestions.component.css'],
})
export class SupportFormComponent extends BaseFormComponent {
  @Input() faqs: FAQ[] = [];
  @Output() toggleFaq = new EventEmitter<FAQ>();
  override submitted = this.submitted as EventEmitter<SupportForm>;
}
