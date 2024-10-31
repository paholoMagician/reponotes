import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Environments } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  constructor(private env: Environments, private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  validacion() {

    if (isPlatformBrowser(this.platformId)) {

      let t: any = sessionStorage.getItem('token');
      if (!t) this.router.navigate(['login']);
      else this.router.navigate(['home']);

    } else {
      console.error('sessionStorage is not available in this environment (probably server-side rendering).');
    }

  }

  closeSession() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['login']);
  }

  registroUsuario(model: any) {
    return this.http.post(this.env.apingRok + 'login/guardarUsuario', model);
  }

  login(model: any) {
    return this.http.post(this.env.apingRok + 'Login/login', model);
  }

  logingoogle(email: string) {
    return this.http.get(this.env.apingRok + 'Usuario/obtenerUsuarioEmail/' + email);
  }

}
