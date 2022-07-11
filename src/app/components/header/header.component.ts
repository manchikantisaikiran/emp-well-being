import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginApiSuccessResponse } from '@interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  currentUser$: BehaviorSubject<any> = this.utils.currentUser$;

  constructor(private utils: UtilsService,
    private router: Router) { }

  ngOnInit(): void {
  }

  logout(){
    this.utils.currentUser$.next(null);
    this.utils.removeLocalStroage('currentUser');
    this.router.navigate(['login']);
  }

}
