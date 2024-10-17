import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  obtenerTipoLista(id: number) {
    return this.http.get('https://rpsoftdev.store:444/api/tipoLista/ObtenerTipoLista/' + id);
  }

  guardarTipoLista(model: any) {
    return this.http.post('https://rpsoftdev.store:444/api/tipoLista/guardarTipoLista', model);
  }

  actualizarTipoLista(model: any, id: number) {
    return this.http.put('https://rpsoftdev.store:444/api/tipoLista/ActualizarTipoLista' + id, model);
  }

  eliminarTipoLista(id: number) {
    return this.http.get('https://rpsoftdev.store:444/api/tipoLista/EliminarTipoLista/' + id);
  }

}
