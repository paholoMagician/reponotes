import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private onlineStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    // Escuchar cambios en la conectividad (cuando se pierde o se recupera)
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }

  // Método para actualizar el estado
  private updateOnlineStatus(isOnline: boolean) {
    this.onlineStatus.next(isOnline);
  }

  // Método que devuelve el estado como un observable
  getOnlineStatus(): Observable<boolean> {
    return this.onlineStatus.asObservable();
  }

  // Método que devuelve el estado actual de conexión (true = conectado, false = desconectado)
  isOnline(): boolean {
    return this.onlineStatus.value;
  }
}
