import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareMenuComponent } from './share-menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ShareMenuComponent', () => {
  let component: ShareMenuComponent;
  let fixture: ComponentFixture<ShareMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareMenuComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getShareableText', () => {
    it('should generate correct shareable text', () => {
      component.dailyTotal = { totalOxalate: 50, totalSolubleOxalate: 20 };
      component.dailyMeals = [
        {
          title: 'Breakfast',
          items: [
            {
              foodName: 'Spinach',
              oxalatePerServing: 15,
              solubleOxalatePerServing: 5,
            },
          ],
        },
        {
          title: 'Lunch',
          items: [
            {
              foodName: 'Carrot',
              oxalatePerServing: 10,
              solubleOxalatePerServing: 3,
            },
          ],
        },
      ];

      const expectedText = `📅 Daily Oxalate Summary
  
  🔹 Total Oxalate for the Day: 50mg
  
  🍽️ Meals Breakdown:
    🥄 Breakfast:
      - 🌿 Spinach: 15mg oxalate, 5mg soluble oxalate
    🥄 Lunch:
      - 🌿 Carrot: 10mg oxalate, 3mg soluble oxalate
  
  🔖 Note: Keep track of your daily oxalate intake to maintain a healthy balance.
  
  📲 Stay healthy, and track your meals!`;

      const actualText = component.getShareableText();

      expect(actualText.replace(/\s+/g, ' ')).toBe(
        expectedText.replace(/\s+/g, ' ')
      );
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard and set copySuccess to true', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(
        Promise.resolve()
      );
      spyOn(window, 'setTimeout');

      component.dailyTotal = { totalOxalate: 100, totalSolubleOxalate: 50 };
      component.dailyMeals = [];
      const shareableText = component.getShareableText();

      await component.copyToClipboard();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(shareableText);
      expect(component.copySuccess).toBeTrue();
      expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 2000);
    });

    it('should log an error if clipboard write fails', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(
        Promise.reject('Clipboard error')
      );
      spyOn(console, 'error');

      await component.copyToClipboard();

      expect(console.error).toHaveBeenCalledWith(
        'Failed to copy results',
        'Clipboard error'
      );
      expect(component.copySuccess).toBeFalse();
    });
  });

  describe('closeShareMenu', () => {
    it('should emit close event and stop propagation', () => {
      spyOn(component.close, 'emit');
      const mockEvent = new MouseEvent('click');
      spyOn(mockEvent, 'stopPropagation');

      component.closeShareMenu(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.close.emit).toHaveBeenCalled();
    });
  });
});
