import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../shared/login/services/login.service';
import { NetworkService } from '../../shared/network/network-service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isConnected: boolean = true;
  showFolders: boolean = true;
  showNotes: boolean = true;
  showPromptCall: boolean = false; // Para controlar la visibilidad del prompt-call
  copy_codec: string = '';
  _show_help: boolean = true;

  constructor(private router: Router, private log: LoginService, private networkService: NetworkService) { }

  ngOnInit(): void {
    this.log.validacion();
    this.networkService.getOnlineStatus().subscribe((status: boolean) => {
      this.isConnected = status;
      console.log('Conectado a Internet:', status);
    });
    // Detectar la combinación Ctrl + I
    document.addEventListener('keydown', this.handleKeydown.bind(this));
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


  folderList: any = null;
  obtenerFoldersList(event: any) {
    if (event) this.folderList = event, this.showFolders = true, this.showNotes = false;
    console.table(this.folderList);
  }

  gettoggleHelp(event: any) {
    this._show_help = event;
  }

  notesListInFolder: any = null;
  obtenerNotesList(event: any) {
    if (event) this.notesListInFolder = event, this.showFolders = false, this.showNotes = true;
    console.table(this.notesListInFolder);
  }

  copyToClipboard(codec: string) {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codec).then(() => {
        this.copy_codec = codec;
      }).catch(err => {
        console.error('Error al copiar el código:', err);
      });
    } else {
      // console.warn('La API de portapapeles no está disponible en este navegador.');
      this.copy_codec = codec;
      this.fallbackCopyTextToClipboard(codec);
    }
  }

  fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Error al copiar el texto:', err);
    }
    document.body.removeChild(textArea);
  }

}


// import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// import { Router } from '@angular/router';
// import { LoginService } from '../../shared/login/services/login.service';

// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './dashboard.component.html',
//   styleUrl: './dashboard.component.scss'
// })
// export class DashboardComponent implements OnInit {


//   showFolders: boolean = true;
//   showNotes: boolean = true;
//   copy_codec: string = '';
//   constructor(private router: Router, private log: LoginService) { }

//   ngOnInit(): void {
//     this.log.validacion();
//   }


//   folderList: any = null;
//   obtenerFoldersList(event: any) {
//     if (event) this.folderList = event, this.showFolders = true, this.showNotes = false;
//     console.table(this.folderList);
//   }

//   notesListInFolder: any = null;
//   obtenerNotesList(event: any) {
//     if (event) this.notesListInFolder = event, this.showFolders = false, this.showNotes = true;
//     console.table(this.notesListInFolder);
//   }

//   copyToClipboard(codec: string) {
//     if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
//       navigator.clipboard.writeText(codec).then(() => {
//         this.copy_codec = codec;
//         // alert('Código copiado al portapapeles: ' + codec);
//       }).catch(err => {
//         console.error('Error al copiar el código:', err);
//       });
//     } else {
//       // console.warn('La API de portapapeles no está disponible en este navegador.');
//       this.copy_codec = codec;
//       // Método alternativo de copia (menos confiable)
//       this.fallbackCopyTextToClipboard(codec);
//     }
//   }

//   // Método alternativo en caso de que la API de portapapeles no esté disponible
//   fallbackCopyTextToClipboard(text: string) {
//     const textArea = document.createElement('textarea');
//     textArea.value
//   }



// }
