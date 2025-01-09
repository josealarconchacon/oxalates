import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-contribution',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClipboardModule, FormsModule],
  templateUrl: './contribution.component.html',
  styleUrls: ['./contribution.component.css'],
})
export class ContributionComponent implements OnInit {
  goToLogin() {
    throw new Error('Method not implemented.');
  }
  currentStep = 1;
  steps = [
    { title: 'Contribution', description: 'Why Contributing' },
    { title: 'How', description: 'How Can you Contribute' },
  ];

  ngOnInit(): void {}

  continue(): void {
    if (this.currentStep < this.steps.length) this.currentStep++;
  }

  previousStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  setCurrentStep(step: number): void {
    this.currentStep = step;
  }

  isStepCompleted(index: number): boolean {
    return index < this.currentStep - 1;
  }
}
