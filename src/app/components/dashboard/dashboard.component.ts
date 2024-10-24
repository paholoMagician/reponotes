import { Component, HostListener, Input, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../shared/login/services/login.service';
import { NetworkService } from '../../shared/network/network-service.service';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

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

  constructor(private router: Router, private log: LoginService, private networkService: NetworkService, private dash: DashboardService) { }
  idUser: any;
  ngOnInit(): void {
    this.log.validacion();
    this.networkService.getOnlineStatus().subscribe((status: boolean) => {
      this.isConnected = status;
      this.idUser = sessionStorage.getItem('id')
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

  // Manejar la combinación Ctrl + I
  handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'i') {
      event.preventDefault(); // Prevenir el comportamiento por defecto del navegador
      this.togglePromptCall(); // Alternar la visibilidad del div
    }
  }

  listaCarpetas: any = [];
  obtenerCarpetas() {
    this.dash.obtenerTipoLista(this.idUser).subscribe({
      next: (x) => {
        this.listaCarpetas = x;
        console.table(this.listaCarpetas);
      }, error: (e) => {
        console.error(e);
      }, complete: () => {

      }
    })
  }  

  listaNotas: any = [];
  obtenerLista( idTipoLista: number ) {
    this.dash.obtenerListas( idTipoLista ).subscribe({
      next: (x) => {
        this.listaNotas = x;
        console.warn(this.listaNotas);
      }, error: (e) => {
        console.error(e);
      }, complete: () => {

      } 
    })
  } 

  togglePromptCall() {
    const promptCallElement = document.querySelector('.prompt-call');

    if (this.showPromptCall) {
      // Aplicar la animación de salida
      promptCallElement?.classList.remove('fade-in');
      promptCallElement?.classList.add('fade-out');

      // Después de la animación, ocultar el div
      setTimeout(() => {
        this.showPromptCall = false;
      }, 500); // Duración de la animación (0.5s)
    } else {
      // Mostrar el div y aplicar la animación de entrada
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


  obteneremitShowApp(event:any) {
    this._show_app_local = event; 
  }

  notesListInFolder: any = null;
  obtenerNotesList(event: any) {
    if (event) this.notesListInFolder = event, this.showFolders = false, this.showNotes = true;
    //console.table(this.notesListInFolder);
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

