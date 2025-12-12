import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { BeCautiousComponent } from '../be-cautious/be-cautious.component';

describe('BeCautiousComponent', () => {
  let component: BeCautiousComponent;
  let fixture: ComponentFixture<BeCautiousComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeCautiousComponent], // standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(BeCautiousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the main heading', () => {
    const headingDe: DebugElement = fixture.debugElement.query(By.css('h2'));

    expect(headingDe).toBeTruthy();
    expect(headingDe.nativeElement.textContent).toContain('Be Cautious');
  });

  it('should render the descriptive text', () => {
    const descriptionDe: DebugElement = fixture.debugElement.query(
      By.css('h6')
    );

    expect(descriptionDe).toBeTruthy();

    const text = descriptionDe.nativeElement.textContent;
    expect(text).toContain('lowering dietary oxalate');
    expect(text).toContain('reduce the risks');
  });

  it('should visually highlight the word "dumping"', () => {
    const highlightedElements = fixture.debugElement.queryAll(
      By.css('.highlight')
    );

    expect(highlightedElements.length).toBeGreaterThan(0);
    expect(highlightedElements[0].nativeElement.textContent).toContain(
      'dumping'
    );
  });

  it('should include structural layout containers', () => {
    const header = fixture.debugElement.query(By.css('.header'));
    const titleGroup = fixture.debugElement.query(By.css('.title-group'));

    expect(header).toBeTruthy();
    expect(titleGroup).toBeTruthy();
  });
});
