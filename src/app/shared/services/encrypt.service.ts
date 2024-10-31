import { Injectable, Injector } from '@angular/core';
import { Environments } from '../../environments/environments';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class EncryptService {
  rol: any;
  email: any;
  nombre: any;
  dataUser: any = [];
  iduserclaim: number = 0;
  tiempoExpiracionSesion: any;
  modelTokenInitSession: any = [];
  private envService!: Environments;

  constructor(private injector: Injector) { }

  private get env(): Environments {
    if (!this.envService) {
      this.envService = this.injector.get(Environments);
    }
    return this.envService;
  }

  encryptWithAsciiSeed(value: string, seed: number, hash: number): string {
    let encryptedValue = '';
    for (let i = 0; i < hash; i++) {
      const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
      value += randomChar;
    }
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      const encryptedCharCode = charCode + seed;
      encryptedValue += String.fromCharCode(encryptedCharCode);
    }
    return encryptedValue;
  }

  decryptWithAsciiSeed(encryptedValue: string, seed: number, hash: number): string {
    const originalLength = encryptedValue.length - hash;
    encryptedValue = encryptedValue.substring(0, originalLength);
    let decryptedValue = '';
    for (let i = 0; i < encryptedValue.length; i++) {
      const charCode = encryptedValue.charCodeAt(i);
      const decryptedCharCode = charCode - seed;
      decryptedValue += String.fromCharCode(decryptedCharCode);
    }
    return decryptedValue;
  }

  decodeJwtToken() {
    let xtoken: any = sessionStorage.getItem('token');
    let xtokenDecript: any;
    if (xtoken) {
      try {
        xtokenDecript = this.decryptWithAsciiSeed(xtoken, this.env.es, this.env.hash);
        if (xtokenDecript !== null && xtokenDecript !== undefined) {
          var decoded: any = jwtDecode(xtokenDecript);
          this.rol = decoded['role'];
          this.iduserclaim = decoded['nameid'];
          this.dataUser = decoded['unique_name'];
          this.email = this.dataUser[0];
          this.nombre = this.dataUser[1];
          this.tiempoExpiracionSesion = this.convertTimestampToReadableDate(decoded['exp']);
          this.modelTokenInitSession = {
            rol: this.rol,
            iduser: this.iduserclaim,
            email: this.email,
            nombre: this.nombre,
            tiempoExp: this.tiempoExpiracionSesion
          };
          return this.modelTokenInitSession;
        }
      } catch (error) {
        console.error('Error decoding JWT token:', error);
      }
    }
    return null;
  }

  convertTimestampToReadableDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const readableDate = date.toLocaleString();
    return readableDate;
  }
}
