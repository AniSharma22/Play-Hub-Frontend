import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should display success message on showSuccess', () => {
    service.showSuccess('test');

    expect(messageServiceSpy.add).toHaveBeenCalledOnceWith({
      severity: 'success',
      summary: 'Success',
      detail: 'test',
    });
  });

  it('should display error message on showError', () => {
    service.showError('test');

    expect(messageServiceSpy.add).toHaveBeenCalledOnceWith({
      severity: 'error',
      summary: 'Error',
      detail: 'test',
    });
  });

  it('should display info message on showInfo', () => {
    service.showInfo('test');

    expect(messageServiceSpy.add).toHaveBeenCalledOnceWith({
      severity: 'info',
      summary: 'Info',
      detail: 'test',
    });
  });

  it('should display warn message on showWarn', () => {
    service.showWarn('test');

    expect(messageServiceSpy.add).toHaveBeenCalledOnceWith({
      severity: 'warn',
      summary: 'Warn',
      detail: 'test',
    });
  });

  it('should display contrast message on showContrast', () => {
    service.showContrast('test');

    expect(messageServiceSpy.add).toHaveBeenCalledOnceWith({
      severity: 'contrast',
      summary: 'Error',
      detail: 'test',
    });
  });

  it('should display secondary message on showSecondary', () => {
    service.showSecondary('test');

    expect(messageServiceSpy.add).toHaveBeenCalledOnceWith({
      severity: 'secondary',
      summary: 'Secondary',
      detail: 'test',
    });
  });
});
