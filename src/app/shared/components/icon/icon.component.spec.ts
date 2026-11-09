import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [IconComponent] });
    fixture = TestBed.createComponent(IconComponent);
  });

  it('draws the named icon as a hidden, decorative SVG', () => {
    fixture.componentRef.setInput('name', 'search');
    fixture.detectChanges();

    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelector('circle')).not.toBeNull();
    expect(svg.querySelector('circle')!.namespaceURI).toBe(
      'http://www.w3.org/2000/svg'
    );
  });

  it('uses the size input for width and height', () => {
    fixture.componentRef.setInput('name', 'leaf');
    fixture.componentRef.setInput('size', 24);
    fixture.detectChanges();

    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
  });
});
