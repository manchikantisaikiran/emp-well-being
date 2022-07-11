import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GET_ANALYTICS_DATA, LOGIN_ENDPOINT } from '@enpoints';
import { LoginApiBody, LoginApiSuccessResponse } from '@interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  url = environment.api_base_url;

  constructor(private http: HttpClient,
    private utils: UtilsService) { }

    defineHeaders() {
      let headers = new HttpHeaders({});
      const currentUser: any = this.utils.currentUser$.getValue();
      if (currentUser) {
        headers = headers.append("Authorization", `Bearer ${currentUser.token}`);
      }
      
      return headers;
    }

  login(body: LoginApiBody) {
    const url = this.url + LOGIN_ENDPOINT;
    return this.http.post(url, body)
  }

  getCSVData() {
    const url = this.url + GET_ANALYTICS_DATA;
    const headers = this.defineHeaders();
    return this.http.get(url, { responseType: 'text', headers });
  }

  
}
