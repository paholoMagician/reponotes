import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  // private urlApi: string = 'https://rpsoftdev.store:444/api/';
  private urlApi: string = 'https://localhost:7213/api/';
  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  validacion() {
  
    if (isPlatformBrowser(this.platformId)) {
  
      let x: any = sessionStorage.getItem('id');
      let j: any = sessionStorage.getItem('email');
      let h: any = sessionStorage.getItem('usuario');

      if ( !x || !j || !h ) this.router.navigate( ['login'] );
      else this.router.navigate( ['home'] );

    } else {
      console.error('sessionStorage is not available in this environment (probably server-side rendering).');
    }
  
  }

  closeSession() {
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['login']);
  }

  registroUsuario(model: any) {
    return this.http.post( this.urlApi + 'login/guardarUsuario', model);
  }

  login(model: any) {
    return this.http.post( this.urlApi + 'Login/login', model);
  }

  logingoogle( email:string ) {
    return this.http.get( this.urlApi + 'Usuario/obtenerUsuarioEmail/' + email );
  }

}
