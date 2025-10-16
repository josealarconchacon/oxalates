import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportFormComponent } from './support-form.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { EventEmitter } from '@angular/core';

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

interface SupportForm {
  name: string;
  email: string;
  issueType: string;
  message: string;
}

describe('SupportFormComponent', () => {
  let component: SupportFormComponent;
  let fixture: ComponentFixture<SupportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportFormComponent);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      name: new FormControl('Eli Sam'),
      email: new FormControl('elisam@example.com'),
      issueType: new FormControl('Technical'),
      message: new FormControl('This is a test message!'),
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept faqs as input', () => {
    component.faqs = faqsMock;
    fixture.detectChanges();
    expect(component.faqs.length).toBe(2);
    expect(component.faqs[0].question).toBe('What?');
    expect(component.faqs[0].isOpen).toBe(false);
    expect(component.faqs[1].isOpen).toBe(true);
  });

  it('should emit toggleFaq output', () => {
    spyOn(component.toggleFaq, 'emit');
    component.toggleFaq.emit(faq);
    expect(component.toggleFaq.emit).toHaveBeenCalledWith(faq);
  });

  it('should emit submitted as SupportForm', () => {
    spyOn(component.submitted, 'emit');
    component.onSubmit();
    expect(component.submitted.emit).toHaveBeenCalledWith(supportFormValue);
  });
});

const faqsMock: FAQ[] = [
  { question: 'What?', answer: 'That.', isOpen: false },
  { question: 'How?', answer: 'Like this.', isOpen: true },
];

const faq: FAQ = { question: 'Test Q', answer: 'Test A', isOpen: false };

const supportFormValue: SupportForm = {
  name: 'Eli Sam',
  email: 'elisam@example.com',
  issueType: 'Technical',
  message: 'This is a test message!',
};
