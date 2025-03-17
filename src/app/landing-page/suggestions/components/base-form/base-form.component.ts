import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  template: '',
})
export abstract class BaseFormComponent {
  @Input() form!: FormGroup;
  @Output() submitted = new EventEmitter<any>();

  onSubmit(): void {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
    }
  }
}
