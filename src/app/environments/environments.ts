import { Injectable } from '@angular/core';
import { EncryptService } from '../shared/services/encrypt.service';

@Injectable({
  providedIn: 'root',
})
export class Environments {
  /** ======================================================= */
  // CONTROL DE ERRORES
  E_404: any = 'Error al ingresar';
  E_0: any = 'Hay inconvenientes al establecer conexión con el servidor';
  E_500: any = 'Problemas en consulta de datos';
  /** ======================================================= */

  constructor(private encrypt: EncryptService) { }

  apingRok: any = 'https://localhost:7213/api/';

  version: string = 'V.1.0.1';
  es: number = 5;
  hash: number = 10;
  encode: number = 99;


  TokenJWT(): string {
    let xtoken: any = sessionStorage.getItem('token');
    let x: any = this.encrypt.decryptWithAsciiSeed(xtoken, this.es, this.hash);
    return x;
  }

}

