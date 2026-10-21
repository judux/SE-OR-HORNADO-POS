import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ConnectionBannerComponent } from './shared/components/connection-banner/connection-banner.component';
import { UpdateBannerComponent } from './shared/components/update-banner/update-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent, ConnectionBannerComponent, UpdateBannerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container />
    <app-confirm-dialog />
    <app-connection-banner />
    <app-update-banner />
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'restaurante-pos';
}
