import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient, private router: Router) { }

  validacion() {
    if (typeof sessionStorage !== 'undefined') {
      let x: any = sessionStorage.getItem('id');
      let j: any = sessionStorage.getItem('email');
      let h: any = sessionStorage.getItem('usuario');
      if (!x || !j || !h) {
        this.router.navigate(['login']);
      } else {
        this.router.navigate(['home']);
      }
    } else {
      console.error('sessionStorage is not available in this environment.');
    }
  }

  registroUsuario(model: any) {
    return this.http.post('https://rpsoftdev.store:444/api/login/guardarUsuario', model);
  }

  login(model: any) {
    return this.http.post('https://rpsoftdev.store:444/api/login/loginUser', model);
  }

}
