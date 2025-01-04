import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RouterOutlet } from '@angular/router';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';

describe('AppComponent', () => {
  let primeNGConfigSpy: jasmine.SpyObj<PrimeNGConfig>;

  beforeEach(async () => {
    // Create spy for PrimeNGConfig
    primeNGConfigSpy = jasmine.createSpyObj('PrimeNGConfig', [], {
      ripple: false, // spy on the ripple property
    });

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [ToastModule, ConfirmDialogModule, RouterOutlet],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: PrimeNGConfig, useValue: primeNGConfigSpy },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should set ripple to true on init', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.ngOnInit();

    tick();
    expect(primeNGConfigSpy.ripple).toBe(false);
  }));
});
