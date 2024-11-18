import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from '../../../environments/environments';
import { Observable } from 'rxjs';

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

  // uploadFileDriveServer(email: string, folderName: string, file: File) {

  //   const formData = new FormData();
  //   formData.append('Archivo', file);

  //   // Construir la URL con los parámetros `email` y `folderName`
  //   const url = `${this.env.apingRok}storage/uploadFileDriveServer/${email}/${folderName}`;
  //   return this.http.post(url, formData, { headers: this.headers });

  // }

  // uploadFileDriveServer(file: File, email: string, folderName: string): Observable<HttpEvent<any>> {

  //   console.log('ARCHIVO A SUBIRSE');
  //   console.log(file);

  //   const formData: FormData = new FormData();
  //   formData.append('archivo', file);

  //   const req = new HttpRequest(
  //     'POST',
  //     `${this.env.apingRok}storage/uploadFileDriveServer/${email}/${folderName}`,
  //     formData,
  //     {
  //       headers: this.headers, // Agrega los headers aquí
  //       reportProgress: true,
  //       responseType: 'json'
  //     }
  //   );

  //   return this.http.request(req);
  // }



  // uploadFileDriveServer(email: string, folderName: string, file: File): Observable<any> {
  //   const formData: FormData = new FormData();
  //   formData.append('Archivo', file);
  //   console.warn(this.headers)
  //   return this.http.post(`https://localhost:7213/api/storage/uploadFileDriveServer/${email}/${folderName}`, formData);
  // }

  uploadFileDriveServerUnic(file: File, email: string, folderName: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('Archivo', file);

    return this.http.post(`http://192.168.55.28:5028/api/storage/uploadFileDriveServerOne/${email}/${folderName}`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  uploadFileDriveServer(
    chunk: Blob,
    fileName: string,
    email: string,
    folderName: string,
    currentChunk: number,
    totalChunks: number
  ): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('Archivo', chunk, fileName); // El archivo debe tener un tercer argumento como nombre
    formData.append('fileName', fileName);
    formData.append('currentChunk', currentChunk.toString()); // Convertir a string para evitar errores de tipo
    formData.append('totalChunks', totalChunks.toString());   // Convertir a string para evitar errores de tipo

    return this.http.post(`http://192.168.55.28:5028/api/storage/uploadFileDriveServer/${email}/${folderName}`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }


  downloadFileServer(id: any, folderName: string, fileName: string) {
    return this.http.get('http://192.168.55.28:5028/api/storage/getFile/' + id + '/' + folderName + '/' + fileName, {
      responseType: 'blob'  // Especifica que el tipo de respuesta es un Blob (archivo binario)
    });
  }

  guardarArchivos(model: any[]) {
    return this.http.post(this.env.apingRok + 'filesDB/FileCreate', model, { headers: this.headers });
  }

  obtenerArchivos(idUser: any, idFolder: any) {
    return this.http.get(this.env.apingRok + 'filesDB/GetFileServerDB/' + idUser + '/' + idFolder, { headers: this.headers });
  }

  deleteFolderServer(userId: number, folderId: number) {
    return this.http.delete(this.env.apingRok + 'storage/DeleteFolder/' + userId + '/' + folderId)
  }

  deleteFolderDB(folderId: number) {
    return this.http.delete(this.env.apingRok + 'storage/DeleteFolderDB/' + folderId);
  }

  deletFileServer(userId: number, folderId: number, fileName: string) {
    return this.http.delete(this.env.apingRok + 'storage/DeleteFile/' + userId + '/' + folderId + '/' + fileName);
  }

  deleteFileDB(idfile: number) {
    return this.http.delete(this.env.apingRok + 'storage/DeleteFileDB/' + idfile);
  }

  obtenerPesoArchivos(iduser: number) {
    return this.http.get(this.env.apingRok + 'storage/GetTotalFileSize/' + iduser);
  }

}
