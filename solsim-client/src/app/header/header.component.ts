import { Component } from '@angular/core';
import { PerformanceComponent } from '../performance/performance.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [PerformanceComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
