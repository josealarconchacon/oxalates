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
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2.textContent.trim()).toBe('Be Cautious of Oxalate Dumping');
  });

  it('should render description paragraph', () => {
    const h6 = fixture.nativeElement.querySelector('h6');
    expect(h6.textContent).toContain('lowering dietary oxalate');
    expect(h6.textContent).toContain('reduce the risks of');
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
