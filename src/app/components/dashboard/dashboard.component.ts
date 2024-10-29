import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../shared/login/services/login.service';
import { NetworkService } from '../../shared/network/network-service.service';
import { DashboardService } from './services/dashboard.service';
import { MatMenuTrigger } from '@angular/material/menu';

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
    private dash: DashboardService) { }


  ngOnInit(): void {

    this.log.validacion();
    this.networkService.getOnlineStatus().subscribe((status: boolean) => {
      this.isConnected = status;
      this.idUser = sessionStorage.getItem('id');
      console.log('Conectado a Internet:', status);
    });

    // Detectar la combinación Ctrl + I
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    this.obtenerCarpetas();

  }

  ngOnDestroy(): void {
    // Remover el listener para evitar fugas de memoria
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  res: any = [];
  modelFolder: any = [];
  actualizarFolder(id: number) {

    let inputElement = <HTMLInputElement>document.getElementById('folder-' + id.toString());
    console.warn(inputElement.value);

    let xuser: any = sessionStorage.getItem('id');
    this._show_spinner = true;
    this.modelFolder = {
      id: id,
      nombretipo: inputElement.value,
      iduser: xuser,
      fecrea: new Date(),
      estado: 100,
      permiso: 1,
      presupuesto: 0
    }

    this.dash.actualizarTipoLista(id, this.modelFolder).subscribe({
      next: (x) => {
        console.warn(x);
        this.res = x;
      },
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },
      complete: () => {
        this._show_spinner = false;
        this.limpiar();
      }
    });
  }

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
    this.dash.obtenerTipoLista(this.idUser).subscribe({
      next: (x) => {
        this.listaCarpetas = x;
        console.table(this.listaCarpetas);
      },
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },
      complete: () => {
        this.unirCarpetasNotas();
        this._show_spinner = false;
      }
    });
  }

  obtenerLista(idTipoLista: number) {
    return this.dash.obtenerListas(idTipoLista).toPromise();
  }

  async unirCarpetasNotas() {
    for (let carpeta of this.listaCarpetas) {
      try {
        const notas = await this.obtenerLista(carpeta.id);
        carpeta.notas = notas;
        carpeta.active = false; // Agrega la propiedad active
      } catch (error) {
        console.error(`Error obteniendo notas para la carpeta ${carpeta.id}:`, error);
      }
    }
    this.folderWithNotes = this.listaCarpetas;
    console.warn(this.folderWithNotes);
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

  obtenerFoldersList(event: any) {
    if (event) this.folderList = event, this.showFolders = true, this.showNotes = false;
    //console.table(this.folderList);
  }

  gettoggleHelp(event: any) {
    // console.warn('dashboard: ' + event)
    this._show_help = event;
  }

  obtenerPrompt(event: any) {
    this.promptData = event;
    //console.warn('dashbaord: ' + this.promptData)
  }

  histCopyPrompt: any = '';
  obtenerPromptCopy(event: any) {
    //console.warn('Dashboard :' + event);
    this.histCopyPrompt = event;
  }


  obteneremitShowApp(event: any) {
    this._show_app_local = event;
  }

  obtenerNotesList(event: any) {
    if (event) this.notesListInFolder = event, this.showFolders = false, this.showNotes = true;
  }

  copyToClipboard(codec: string) {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codec).then(() => {
        this.copy_codec = codec;
        console.log(this.copy_codec)
      }).catch(err => {
        console.error('Error al copiar el código:', err);
      });
    } else {
      // //console.warn('La API de portapapeles no está disponible en este navegador.');
      this.copy_codec = codec;
    }
  }



}

