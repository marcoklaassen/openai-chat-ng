import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_VERSION, APP_COMMIT } from '../version';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  version = APP_VERSION;
  commit = APP_COMMIT;
}

