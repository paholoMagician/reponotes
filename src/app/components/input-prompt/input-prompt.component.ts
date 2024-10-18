import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FolderLists } from '../dashboard/sources/tipolistas';
import { Lista } from '../dashboard/sources/listas';

@Component({
  selector: 'app-input-prompt',
  templateUrl: './input-prompt.component.html',
  styleUrls: ['./input-prompt.component.scss']
})
export class InputPromptComponent implements OnInit {
  @Output() listasFolderEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() notesInFolderEmit: EventEmitter<any> = new EventEmitter<any>();
  _show_msjprompt: boolean = false;

  listCommand: any = {
    command: 'rpn c f n=',
    description: 'Crea una nueva carpeta en el almacenamiento local'
  };

  noteCommand: any = {
    command: 'rpn c l f=',
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

  folderService: FolderLists;
  noteService: Lista;
  listaLocalFolders: any[] = [];
  notesInFolderList: any[] = [];
  xidUser: any = 0;

  msjprompt: string = '>';
  colorprompt: string = '#1f2534dc';

  constructor() {
    this.folderService = new FolderLists();
    this.noteService = new Lista();
  }

  ngOnInit(): void {
    if (typeof sessionStorage !== 'undefined') {
      this.xidUser = sessionStorage.getItem('id');
    }
  }

  onSubmit() {
    this.executeCommand();
  }

  executeCommand() {
    let xcommand: any = this.promptForm.controls['prompt'].value.trim();
    if (xcommand.startsWith(this.listCommand.command)) {
      this.createFolder(xcommand);
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
    } else if (xcommand.startsWith('rpn read f -g')) {
      this.listFolders();
    } else if (xcommand.startsWith(this.readNotesCommand.command)) {
      this.readNotesFromFolder(xcommand);
    } else if (xcommand.startsWith(this.noteCommand.command)) {
      this.createNoteInFolder(xcommand);
    } else if (xcommand.startsWith(this.deleteFolderCommand.command)) {
      this.deleteFolder(xcommand);  // Llamamos al método para eliminar un folder
    } else {
      this.handleUnknownCommand();
    }
  }

  deleteFolder(xcommand: string) {
    const folderPart = xcommand.match(/f=([^ ]+)/);
    if (folderPart) {
      const folderCode = folderPart[1].trim();
      const deleted = this.folderService.deleteFolderByCodec(folderCode); // Llamamos al método deleteFolderByCodec
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
    
    let folderName = xcommand.slice(this.listCommand.command.length).trim();
    if (folderName) {
      folderName = folderName.replace(/\s+/g, '_');
      const now = new Date();
      const codec = `${folderName}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}`;
      this.folderService.createFolderTypeNotesStorage(folderName, codec, 1, 1, this.xidUser);
      this.folderService.guardarDataFolderStorage();
      this.displayMessage('Carpeta creada y guardada en el almacenamiento local', 'yellowgreen');
    } else {
      this.displayMessage('No se proporcionó un nombre para la carpeta.', 'orangered');
    }
    
    this.limpiarPrompt();

  }

  createNoteInFolder(xcommand: string) {
    let folderPart = xcommand.match(/f=([^ ]+)/);
    let notePart = xcommand.match(/n=(.*)/);
    if (folderPart && notePart) {
      let folderCode = folderPart[1].trim();
      let noteName = notePart[1].trim().replace(/\s+/g, '_');
      if (noteName && folderCode) {
        const now = new Date();
        const uniquecode = `${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}_${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;
        this.noteService.createNotesStorage(noteName, uniquecode, folderCode, 1, 1, this.xidUser);
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

  readNotesFromFolder(xcommand: string) {
    let folderPart = xcommand.match(/f=([^ ]+)/);
    if (folderPart) {
      let folderCode = folderPart[1].trim();
      this.notesInFolderList = this.noteService.getNotesFromFolder(folderCode);
      this.notesInFolderEmit.emit(this.notesInFolderList);
      this.displayMessage('Notas cargadas desde la carpeta.', 'yellowgreen');
    } else {
      this.displayMessage('Formato de comando incorrecto. Debe ser "rpn read nt f=codigo_carpeta"', 'orangered');
    }
    this.limpiarPrompt();
  }

  listFolders() {
    let x: any = localStorage.getItem('data_tipo_lista');
    this.listaLocalFolders = x ? JSON.parse(x) : [];
    this.displayMessage('Lista de carpetas cargada.', 'yellowgreen');
    this.listasFolderEmit.emit(this.listaLocalFolders);
    this.limpiarPrompt();
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
    }, 2000);
  }

  limpiarPrompt() {
    this.promptForm.controls['prompt'].setValue('');
  }

}
