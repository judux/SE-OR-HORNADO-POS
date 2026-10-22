import { Component, inject } from '@angular/core';
import { ConnectionService } from '../../../core/services/connection.service';

@Component({
  selector: 'app-connection-banner',
  standalone: true,
  template: `
    @if (!connection.online()) {
      <div role="alert" class="fixed top-0 inset-x-0 z-[100] bg-red-600 text-white text-sm font-bold pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] px-4 flex items-center justify-center gap-2 shadow-lg">
        <span class="material-symbols-rounded text-base">wifi_off</span>
        Sin conexión — los pedidos y cobros NO se están enviando
      </div>
    }
  `
})
export class ConnectionBannerComponent {
  public connection = inject(ConnectionService);
}
