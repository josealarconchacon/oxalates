import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';
import { AuthService } from '../../user-auth/service/auth-service.service';
import { AuthMessageService } from '../../shared/services/auth-message.service';

describe('FooterComponent copyright year', () => {
  it('shows the current year instead of a hard-coded one', async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['isAuthenticated']),
        },
        {
          provide: AuthMessageService,
          useValue: jasmine.createSpyObj('AuthMessageService', [
            'showAuthMessage',
          ]),
        },
      ],
    })
      .overrideComponent(FooterComponent, { remove: { providers: [AuthService] } })
      .compileComponents();

    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector('.footer-text')
      .textContent as string;
    expect(text).toContain(`© ${new Date().getFullYear()} Oxalate Info`);
  });
});
