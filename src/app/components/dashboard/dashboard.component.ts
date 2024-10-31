import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../shared/login/services/login.service';
import { NetworkService } from '../../shared/network/network-service.service';
import { DashboardService } from './services/dashboard.service';
import { EncryptService } from '../../shared/services/encrypt.service';
import Swal from 'sweetalert2'
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  @Output() folderEmit: EventEmitter<any> = new EventEmitter<any>();

  _folder_open: boolean = false;
  _notes_open: boolean = false;
  _show_spinner: boolean = false;
  _show_app_local: boolean = false;
  _show_app_online: boolean = true;
  isConnected: boolean = true;
  showFolders: boolean = true;
  showNotes: boolean = true;
  showPromptCall: boolean = false;
  copy_codec: string = '';
  _show_help: boolean = true;
  folderList: any = null;
  promptData: any = '<RPN command history>';
  idUser: any;
  listaCarpetas: any = [];
  listaNotas: any = [];
  folderWithNotes: any = [];
  notesListInFolder: any = null;


  constructor(private router: Router,
    private log: LoginService,
    private networkService: NetworkService,
    private dash: DashboardService, private ncrypt: EncryptService) { }

  arrTOKEN: any;
  ngOnInit(): void {
    this.arrTOKEN = this.ncrypt.decodeJwtToken();
    this.log.validacion();
    this.networkService.getOnlineStatus().subscribe((status: boolean) => {
      this.isConnected = status;
      console.log('Conectado a Internet:', status);
    });


    // Detectar la combinación Ctrl + I
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    this.obtenerCarpetas();

  }

  /** TOKEN NO TOCAR [EXPIRACION SESION] */
  startSessionTimer(exp: number): void {
    const currentTime = Math.floor(Date.now() / 1000); // Obtener el tiempo actual en segundos
    const timeUntilExpiration = exp - currentTime;
    const twoMinutesInSeconds = 2 * 60;

    if (timeUntilExpiration > 0) {
      if (timeUntilExpiration > twoMinutesInSeconds) {
        setTimeout(() => {
          const minutesLeft = Math.floor((exp - Math.floor(Date.now() / 1000)) / 60);
          Swal.fire({
            title: "Sesión por expirar.",
            text: `Por motivos de seguridad su sesión está por expirar en ${minutesLeft} minutos`,
            footer: 'Puedes volver a iniciar sesión para generar un token de sesión nuevo.',
            icon: "warning"
          });
          setTimeout(() => {
            this.closeSession();
          }, twoMinutesInSeconds * 1000); // Esperar los dos minutos restantes
        }, (timeUntilExpiration - twoMinutesInSeconds) * 1000); // Esperar hasta que queden dos minutos
      } else {
        setTimeout(() => {
          this.closeSession();
        }, timeUntilExpiration * 1000); // Convertir a milisegundos
      }
    } else {
      this.closeSession(); // Expiró el token, cerrar la sesión inmediatamente
    }
  }

  closeSession() {
    sessionStorage.removeItem('token');
    let xtoken: any = sessionStorage.getItem('token');
    if (xtoken == undefined || xtoken == null || xtoken == '') {
      this.router.navigate(['login']);
    }
  }


  ngOnDestroy(): void {
    // Remover el listener para evitar fugas de memoria
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  res: any = [];
  modelFolder: any = [];
  // actualizarFolder(id: number) {

  //   let inputElement = <HTMLInputElement>document.getElementById('folder-' + id.toString());
  //   console.warn(inputElement.value);

  //   let xuser: any = sessionStorage.getItem('id');
  //   this._show_spinner = true;
  //   this.modelFolder = {
  //     id: id,
  //     nombretipo: inputElement.value,
  //     iduser: xuser,
  //     fecrea: new Date(),
  //     estado: 100,
  //     permiso: 1,
  //     presupuesto: 0
  //   }

  //   this.dash.actualizarTipoLista(id, this.modelFolder).subscribe({
  //     next: (x) => {
  //       console.warn(x);
  //       this.res = x;
  //     },
  //     error: (e) => {
  //       console.error(e);
  //       this._show_spinner = false;
  //     },
  //     complete: () => {
  //       this._show_spinner = false;
  //       this.limpiar();
  //     }
  //   });
  // }

  limpiar() {
    // Tu lógica de limpieza aquíw
  }

  openContextMenu(event: MouseEvent, carpeta: any) {
    event.preventDefault(); // Prevenir el menú contextual del navegador
  }

  notasId: any;
  crearNota(folderId: number) {
    console.log('Crear nota en la carpeta:', folderId);
    // this.folderEmit.emit(folderId);
    this.notasId = folderId;
    this._notes_open = true;
  }

  eliminarCarpeta(folderId: number) {
    console.log('Eliminar carpeta:', folderId);
  }


  obtenerCarpetas() {
    this._show_spinner = true;
    this.dash.obtenerFolders(this.arrTOKEN.iduser, 'folder', 0).subscribe({
      next: (x) => {
        this.listaCarpetas = x;
        console.table(this.listaCarpetas);
      },
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },
      complete: () => {
        // this.unirCarpetasNotas();
        this._show_spinner = false;
      }
    });
  }


  toggleActive(carpeta: any) {
    this.folderWithNotes.forEach((f: any) => f.active = false); // Desactiva todas las carpetas
    carpeta.active = true; // Activa la carpeta seleccionada
  }


  // Manejar la combinación Ctrl + I
  handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'i') {
      event.preventDefault();  // Prevenir el comportamiento por defecto del navegador
      this.togglePromptCall(); // Alternar la visibilidad del div
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && event.key === 'F') {
      this.createFolder();
    }
  }

  createFolder() {
    this._folder_open = true
  }

  getFolderOutput(event: any) {
    this.listaCarpetas.push(event);
    this._folder_open = false;
  }

  togglePromptCall() {

    const promptCallElement = document.querySelector('.prompt-call');
    if (this.showPromptCall) {
      promptCallElement?.classList.remove('fade-in');
      promptCallElement?.classList.add('fade-out');
      setTimeout(() => {
        this.showPromptCall = false;
      }, 500);
    } else {
      this.showPromptCall = true;
      setTimeout(() => {
        promptCallElement?.classList.remove('fade-out');
        promptCallElement?.classList.add('fade-in');
      }, 500);
    }

  }



}

