import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.env.TokenJWT()}`,
      'Content-Type': 'application/json'
    },);
  }

  constructor(private http: HttpClient, private env: Environments) { }


  obtenerFolders(idUser: number, tipoFolder: string, idFolder: number) {
    return this.http.get(this.env.apingRok + 'Folder/getFolder/' + idUser + '/' + tipoFolder + '/' + idFolder, { headers: this.headers });
  }

  saveFolder(model: any) {
    return this.http.post(this.env.apingRok + 'Folder/FolderCreate', model, { headers: this.headers });
  }



}
