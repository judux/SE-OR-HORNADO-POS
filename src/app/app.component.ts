import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandColorService } from './core/services/brand-color.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'restaurante-pos';

  // Mantiene vivo el servicio que aplica el color institucional del restaurante.
  private brandColor = inject(BrandColorService);
}
