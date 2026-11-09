import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeCautiousComponent } from './be-cautious.component';

describe('BeCautiousComponent', () => {
  let component: BeCautiousComponent;
  let fixture: ComponentFixture<BeCautiousComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeCautiousComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BeCautiousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render main heading', () => {
    // h3: it sits under the "Reasons to Reduce Oxalate Intake" h2
    const heading = fixture.nativeElement.querySelector('h3');
    expect(heading.textContent.trim()).toBe('Be Cautious of Oxalate Dumping');
  });

  it('should render description paragraph', () => {
    const description = fixture.nativeElement.querySelector('.caution-text');
    expect(description.textContent).toContain('lowering dietary oxalate');
    expect(description.textContent).toContain('reduce the risks of');
  });

  it('should mark the description up as a paragraph, not a heading', () => {
    // It used to be an <h6>, which put a heading level-skip under the h2
    const description = fixture.nativeElement.querySelector('.caution-text');
    expect(description.tagName).toBe('P');
    expect(fixture.nativeElement.querySelector('h6')).toBeNull();
  });

  it('should highlight the word "dumping"', () => {
    const span = fixture.nativeElement.querySelector('.highlight');
    expect(span.textContent).toContain('dumping');
  });

  it('should contain header and title-group CSS classes', () => {
    const header = fixture.nativeElement.querySelector('.header');
    const titleGroup = fixture.nativeElement.querySelector('.title-group');
    expect(header).not.toBeNull();
    expect(titleGroup).not.toBeNull();
  });
});
