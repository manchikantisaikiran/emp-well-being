import { Component } from '@angular/core';
import { UtilsService } from './services/utils.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'emp_wellbeing';

  constructor(private utils: UtilsService){
    console.log('app')
    this.utils.getCurrentUser();
  }
}
