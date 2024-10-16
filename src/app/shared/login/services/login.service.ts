import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor( private http: HttpClient, ) { }

  registroUsuario( model:any ) {
    return this.http.post( 'https://rpsoftdev.store:444/api/login/guardarUsuario', model );
  }

  login( model:any ) {
    return this.http.post( 'https://rpsoftdev.store:444/api/login/guardarUsuario', model );
  }

}
