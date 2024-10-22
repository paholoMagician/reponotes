import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FolderLists } from '../dashboard/sources/tipolistas';
import { Lista } from '../dashboard/sources/listas';
import { LoginService } from '../../shared/login/services/login.service';
import { DashboardService } from '../dashboard/services/dashboard.service';

@Component({
  selector: 'app-input-prompt',
  templateUrl: './input-prompt.component.html',
  styleUrls: ['./input-prompt.component.scss']
})
export class InputPromptComponent implements OnInit, OnChanges {
  @ViewChild('prompt') promptInput!: ElementRef
  _show_spinner: boolean = false;

  @Input() getPrompt: any;
  @Input() getCopyCodec: any;

  @Output() promptEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() listasFolderEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() notesInFolderEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() helpListEmit: EventEmitter<any> = new EventEmitter<any>();



  _show_msjprompt: boolean = false;

  ngAfterViewInit() {
    this.setFocus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      if (this.getPrompt) {
        this.promptForm.controls['prompt'].setValue( this.getPrompt + this.promptForm.controls['prompt'].value );
      }
    }
  }

  setFocus() {
    this.promptInput.nativeElement.focus();
  }

  listCommand: any = {
    command: 'rpn c f n=',
    description: 'Crea una nueva carpeta en el almacenamiento local'
  };


  noteCommand: any = {
    command: 'rpn c nt f=',
    description: 'Crea una nueva nota en la carpeta especificada'
  };

  readNotesCommand: any = {
    command: 'rpn read nt f=',
    description: 'Leer notas de una carpeta especificada'
  };

  // Nuevo comando para eliminar un folder
  deleteFolderCommand: any = {
    command: 'rpn del f=',
    description: 'Eliminar una carpeta especificada'
  };

  promptForm = new FormGroup({
    prompt: new FormControl()
  });

  promptFormRange = new FormGroup({
    promptHeight: new FormControl(2)
  });

  folderService: FolderLists;
  noteService: Lista;
  listaLocalFolders: any[] = [];
  notesInFolderList: any[] = [];
  xidUser: any = 0;

  msjprompt: string = '>';
  colorprompt: string = '#1f2534dc';

  constructor(private log: LoginService, private notesServices: DashboardService) {
    this.folderService = new FolderLists();
    this.noteService = new Lista();
  }

  ngOnInit(): void {
    if (typeof sessionStorage !== 'undefined') {
      this.xidUser = sessionStorage.getItem('id');
    }

    let y: any = localStorage.getItem('valueHeightPrompt');
    this.promptFormRange.controls['promptHeight'].setValue(Number(y));

  }

  updateNoteCommand: any = {
    command: 'rpn update nt= n=',
    description: 'Actualizar el nombre de una nota especificada'
  };

  dataPersist() {
    let x: any = this.promptFormRange.controls['promptHeight'].value;
    localStorage.setItem('valueHeightPrompt', x.toString());
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'ArrowRight') {
      this.incrementHeight();
    }
    if (event.ctrlKey && event.key === 'ArrowLeft') {
      this.decrementHeight();
    }
  }

  incrementHeight() {
    let currentValue: any = this.promptFormRange.controls['promptHeight'].value;
    if (currentValue < 41) {
      this.promptFormRange.controls['promptHeight'].setValue(currentValue + 1);
    }
  }

  decrementHeight() {
    let currentValue: any = this.promptFormRange.controls['promptHeight'].value;
    if (currentValue > 2) {
      this.promptFormRange.controls['promptHeight'].setValue(currentValue - 1);
    }
  }

  onSubmit() {
    this.executeCommand();
  }

  toggleHelpShow: boolean = true;
  modelPushFolders: any = [];
  executeCommand() {
    let xcommand: any = this.promptForm.controls['prompt'].value.trim();
    // //console.warn(xcommand)
    this.promptEmit.emit(xcommand);
    if (xcommand.startsWith(this.listCommand.command)) {
      this.createFolder(xcommand);
      this.helpListEmit.emit(false);
    } else if (xcommand.startsWith('rpn update f=')) {
      const match = /rpn update f=([^ ]+) n=([^']+)/.exec(xcommand);
      if (match) {
        const uniqueCode = match[1]; // Código único de la carpeta
        const newName = match[2]; // Nuevo nombre
        // Llamar a la función para actualizar el nombre de la carpeta
        this.folderService.updateFolderName(uniqueCode, newName);
        // Emitir evento o mostrar mensaje de éxito si es necesario
        this.displayMessage(`Nombre de carpeta con código ${uniqueCode} actualizado a ${newName}`, 'yellowgreen');
      } else {
        this.displayMessage('Comando inválido. Use: rpn update f=<codigo> n=<nuevo nombre>', 'orangered');
      }
      this.helpListEmit.emit(false);
    }
    else if (xcommand.startsWith('rpn update nt=')) {
      // // //console.warn('reconocio')
      let notePart = xcommand.match(/nt=([^ ]+)/);
      // // //console.warn(notePart)
      let newNamePart = xcommand.match(/n=(.+)/); // Cambiado (.*) a (.+) para que coincida con el resto del comando
      if (notePart && newNamePart) {
        let noteCode = notePart[1].trim();
        let newName = newNamePart[1].trim().replace(/\s+/g, '_');
        if (noteCode && newName) {
          let updated = this.noteService.updateNoteName(noteCode, newName);
          if (updated) {
            this.displayMessage('Nota actualizada correctamente.', 'yellowgreen');
          } else {
            this.displayMessage('No se encontró la nota con el código proporcionado.', 'orangered');
          }
        }

      }
      this.helpListEmit.emit(false);
    }
    else if (xcommand.startsWith('rpn del nt=')) {
      this.deleteNote(xcommand);
      this.helpListEmit.emit(false);
    }
    else if (xcommand.startsWith('rpn push server f -c')) {
      this._show_spinner = true;
      let x: any = localStorage.getItem('data_tipo_lista');
      let xuser: any = sessionStorage.getItem('id');
      this.listaLocalFolders = x ? JSON.parse(x) : [];
      // console.table(this.listaLocalFolders);
      this.listaLocalFolders.filter( (m:any) => {
        let arr: any = {
          nombretipo: m.nombretipo,
          iduser: xuser,
          estado: 100,
          permiso: 1,
          presupuesto: 0
        }
        this.modelPushFolders.push(arr);
      })

      console.table(this.modelPushFolders);
      this.modelPushFolders.filter((f:any) => {
        console.log(f);
        this.notesServices.guardarTipoLista( f ).subscribe({
          next: (x) => {
            console.warn(x);
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            this.displayMessage('Hay repositorios existenetes en nuestros servidores.', 'orange');
          }, complete: () => {
            this._show_spinner = false;
            this.displayMessage('Carpetas han sido guardadas en la nube.', 'yellowgreen');
            this.limpiarPrompt();
          }
        })
      })
    
    }
    else if (xcommand.startsWith('rpn help')) {
      if (this.toggleHelpShow) {
        this.toggleHelpShow = false;
        this.helpListEmit.emit(this.toggleHelpShow);
      } else {
        this.toggleHelpShow = true;
        this.helpListEmit.emit(this.toggleHelpShow);
      }
      this.limpiarPrompt();
    }
    else if (xcommand.startsWith('rpn read f -g')) {
      this.listFolders();
      this.helpListEmit.emit(false);
    }
    else if (xcommand.startsWith('rpn close session')) {
      this._show_spinner = true;
      setTimeout(() => {
        this.log.closeSession();
        this._show_spinner = false;
      }, 1000);
      this.helpListEmit.emit(false);
    } else if (xcommand.startsWith(this.readNotesCommand.command)) {
      this.readNotesFromFolder(xcommand);
      this.helpListEmit.emit(false);
    }
    else if (xcommand.startsWith(this.noteCommand.command)) {
      this.createNoteInFolder(xcommand);
      this.helpListEmit.emit(false);
    } else if (xcommand.startsWith(this.deleteFolderCommand.command)) {
      this.deleteFolder(xcommand);
      this.helpListEmit.emit(false);
    } else {
      this.handleUnknownCommand();
    }

  }

  deleteNote(xcommand: string) {
    let notePart = xcommand.match(/nt=([^ ]+)/);
    if (notePart) {
      let noteCode = notePart[1].trim();
      if (noteCode) {
        let deleted = this.noteService.deleteNoteByCode(noteCode);
        if (deleted) {
          this.limpiarPrompt();
          this.displayMessage('Nota eliminada correctamente.', 'yellowgreen');
        } else {
          this.displayMessage('No se encontró la nota con el código proporcionado.', 'orangered');
        }
      }
    }
  }

  deleteFolder(xcommand: string) {
    const folderPart = xcommand.match(/f=([^ ]+)/);
    if (folderPart) {
      const folderCode = folderPart[1].trim();
      const deleted = this.folderService.deleteFolderByCodec(folderCode);
      if (deleted) {
        this.displayMessage('Carpeta eliminada correctamente.', 'yellowgreen');
      } else {
        this.displayMessage('No se encontró ninguna carpeta con el código especificado.', 'orangered');
      }
    } else {
      this.displayMessage('Formato de comando incorrecto. Debe ser "rpn del f=codigo_carpeta"', 'orangered');
    }
    this.limpiarPrompt();
  }


  createFolder(xcommand: string) {
    let xemail: any = sessionStorage.getItem('email');
    let folderName = xcommand.slice(this.listCommand.command.length).trim();
    if (folderName) {
      folderName = folderName.replace(/\s+/g, '_');
      const now = new Date();
      const codec = `${folderName.slice(0, 10)}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}`;
      this.folderService.createFolderTypeNotesStorage(folderName, xemail, codec, 1, 1, this.xidUser);
      this.folderService.guardarDataFolderStorage();
      this.displayMessage('Carpeta creada y guardada en el almacenamiento local', 'yellowgreen');
    } else {
      this.displayMessage('No se proporcionó un nombre para la carpeta.', 'orangered');
    }

    this.limpiarPrompt();

  }

  createNoteInFolder(xcommand: string) {
    let folderPart = xcommand.match(/f=([^ ]+)/);
    let notePart = xcommand.match(/n=(.*)/s); // Añadido "s" para que coincida con todas las líneas

    if (folderPart && notePart) {
      let folderCode = folderPart[1].trim();
      let noteName = notePart[1].trim().replace(/\n/g, '<br>').replace(/\s+/g, '_'); // Reemplazar saltos de línea con <br>

      if (noteName && folderCode) {
        const now = new Date();
        const uniquecode = `${noteName.slice(0, 10)}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}`;

        this.noteService.createNotesStorage(notePart[1].trim().replace(/\n/g, '<br>'), uniquecode, folderCode, 1, 1, this.xidUser); // Almacenar los <br>
        this.noteService.guardarDataNotesStorage(this.folderService);

        this.displayMessage('Nota creada y guardada en la carpeta local', 'yellowgreen');
      } else {
        this.displayMessage('No se proporcionó un nombre para la nota o el código de la carpeta.', 'orangered');
      }
    } else {
      this.displayMessage('Formato de comando incorrecto. Debe ser "rpn c l f=codigo_carpeta n=nombre_nota"', 'orangered');
    }

    this.limpiarPrompt();
  }

  cantNotesInFolder: number = 0;
  readNotesFromFolder(xcommand: string) {
    let folderPart = xcommand.match(/f=([^ ]+)/);
    if (folderPart) {
      let folderCode = folderPart[1].trim();
      this.notesInFolderList = this.noteService.getNotesFromFolder(folderCode);
      this.cantNotesInFolder = this.notesInFolderList.length;
      this.notesInFolderEmit.emit(this.notesInFolderList);
      this.displayMessage('Notas cargadas desde la carpeta.', 'yellowgreen');
    } else {
      this.displayMessage('Formato de comando incorrecto. Debe ser "rpn read nt f=codigo_carpeta"', 'orangered');
    }
    this.limpiarPrompt();
  }

  cantidadCarpetas: number = 0;
  listFolders() {
    if (typeof localStorage !== 'undefined') {
      let x: any = localStorage.getItem('data_tipo_lista');
      this.listaLocalFolders = x ? JSON.parse(x) : [];
      this.displayMessage('Lista de carpetas cargada.', 'yellowgreen');
      this.cantidadCarpetas = this.listaLocalFolders.length;
      this.listasFolderEmit.emit(this.listaLocalFolders);
      this.limpiarPrompt();
    }
  }

  handleUnknownCommand() {
    console.error('Comando no reconocido.');
    this.displayMessage('Comando no reconocido.', 'orangered');
  }

  displayMessage(message: string, color: string) {
    this.msjprompt = message;
    this.colorprompt = color;
    this._show_msjprompt = true;
    setTimeout(() => {
      this._show_msjprompt = false;
      this.colorprompt = '#1f2534dc';
    }, 3000);
  }

  limpiarPrompt() {
    this.promptForm.controls['prompt'].setValue('');
  }

}
