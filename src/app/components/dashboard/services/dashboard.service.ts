import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private urlApi: string = 'https://rpsoftdev.store:444/api/';
  constructor(private http: HttpClient) { }

  obtenerTipoLista(id: number) {
    return this.http.get( this.urlApi+ 'tipoLista/ObtenerTipoLista/' + id );
  }

  guardarTipoLista(model: any) {
    return this.http.post( this.urlApi+ 'tipoLista/guardarTipoLista', model );
  }

  actualizarTipoLista(model: any, id: number) {
    return this.http.put( this.urlApi+ 'tipoLista/ActualizarTipoLista' + id, model );
  }

  eliminarTipoLista(id: number) {
    return this.http.get( this.urlApi+ 'tipoLista/EliminarTipoLista/' + id );
  }

  guardarLista( model: any [] ) {
    return this.http.post( this.urlApi+ 'Lista/guardarLista', model );
  }

  obtenerListas( idTipoLista: number ) {
    return this.http.get( this.urlApi+ 'Lista/ObtenerLista/' + idTipoLista );
  }

}
