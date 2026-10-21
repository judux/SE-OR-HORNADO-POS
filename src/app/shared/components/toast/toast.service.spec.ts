import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe agregar un toast al llamar a show()', () => {
    service.show('Mensaje de prueba', 'success');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe('Mensaje de prueba');
    expect(toasts[0].type).toBe('success');
  });

  it('debe remover el toast con dismiss()', () => {
    service.show('A eliminar', 'info', 0);
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts()[0].leaving).toBeTrue();
  });
});
