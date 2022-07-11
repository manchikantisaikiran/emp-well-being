import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  currentUser$ = new BehaviorSubject(null);


  constructor() { }

  getLocalStorage(key: string) {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }

    return null;
  }

  setLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeLocalStroage(key: string){
    localStorage.removeItem(key);
  }

  getCurrentUser(){
    const currentUser = this.getLocalStorage('currentUser');
    this.currentUser$.next(currentUser);
  }
}
