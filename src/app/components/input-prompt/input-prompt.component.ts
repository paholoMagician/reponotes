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
  _show_msjprompt: boolean = false;
  listCommand: any = {
    command: 'rpn c f n=',
    description: 'Crea una nueva carpeta en el almacenamiento local'
  };
  noteCommand: any = {
    command: 'rpn c l f=',
    description: 'Crea una nueva nota en la carpeta especificada'
  };
  promptForm = new FormGroup({
    prompt: new FormControl()
  });
  folderService: FolderLists;
  noteService: Lista;
  listaLocalFolders: any[] = [];
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
    let xcommand: any = this.promptForm.controls['prompt'].value.trim();
    if (xcommand.startsWith(this.listCommand.command)) {
      this.createFolder();
    } else if (xcommand.startsWith('rpn read f -g')) {
      this.listFolders();
    } else if (xcommand.startsWith(this.noteCommand.command)) {
      this.createNoteInFolder();
    } else {
      console.error('Comando no reconocido.');
      this.msjprompt = 'Comando no reconocido.';
      this.colorprompt = 'orangered';
      this.limpiarPrompt();
      this._show_msjprompt = true;
      setTimeout(() => {
        this._show_msjprompt = false;
        this.colorprompt = '#1f2534dc';
      }, 2000);
    }
  }

  createFolder() {
    let xcommand: any = this.promptForm.controls['prompt'].value;
    let folderName = xcommand.slice(this.listCommand.command.length).trim();
    if (folderName) {
      folderName = folderName.replace(/\s+/g, '_');
      const now = new Date();
      const codec = `${folderName}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}`;
      this.folderService.createFolderTypeNotesStorage(folderName, codec, 1, 1, this.xidUser);
      this.folderService.guardarDataFolderStorage();
      this.msjprompt = 'Carpeta creada y guardada en el almacenamiento local';
      this.colorprompt = 'yellowgreen';
      this._show_msjprompt = true;
      setTimeout(() => {
        this._show_msjprompt = false;
      }, 2000);
      this.limpiarPrompt();
    } else {
      console.error('No se proporcionó un nombre para la carpeta.');
      this.msjprompt = 'Esta carpeta no se ha podido crear, debido a un error al escribir el comando';
      this.colorprompt = 'orangered';
      this._show_msjprompt = true;
      setTimeout(() => {
        this._show_msjprompt = false;
      }, 2000);
    }
  }

  createNoteInFolder() {
    let xcommand: any = this.promptForm.controls['prompt'].value.trim();
    console.log('Comando ingresado:', xcommand);

    let folderPart = xcommand.match(/f=([^ ]+)/);
    let notePart = xcommand.match(/n=(.*)/);

    console.log('Parte de la carpeta:', folderPart);
    console.log('Parte de la nota:', notePart);

    if (folderPart && notePart) {
      let folderCode = folderPart[1].trim();
      let noteName = notePart[1].trim().replace(/\s+/g, '_');

      console.log('Código de la carpeta:', folderCode);
      console.log('Nombre de la nota:', noteName);

      if (noteName && folderCode) {
        const now = new Date();
        const uniquecode = `${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}_${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;
        this.noteService.createNotesStorage(noteName, uniquecode, folderCode, 1, 1, this.xidUser);
        this.noteService.guardarDataNotesStorage(this.folderService);
        this.msjprompt = 'Nota creada y guardada en la carpeta local';
        this.colorprompt = 'yellowgreen';
        this._show_msjprompt = true;
        setTimeout(() => {
          this._show_msjprompt = false;
        }, 2000);
        this.limpiarPrompt();
      } else {
        console.error('No se proporcionó un nombre para la nota o el código de la carpeta.');
        this.msjprompt = 'Esta nota no se ha podido crear, debido a un error al escribir el comando';
        this.colorprompt = 'orangered';
        this._show_msjprompt = true;
        setTimeout(() => {
          this._show_msjprompt = false;
        }, 2000);
      }
    } else {
      console.error('Formato de comando incorrecto.');
      this.msjprompt = 'Formato de comando incorrecto. Debe ser "rpn c l f=codigo_carpeta n=nombre_nota"';
      this.colorprompt = 'orangered';
      this._show_msjprompt = true;
      setTimeout(() => {
        this._show_msjprompt = false;
      }, 2000);
    }
  }


  listFolders() {
    let x: any = localStorage.getItem('data_tipo_lista');
    this.listaLocalFolders = x ? JSON.parse(x) : [];
    this.msjprompt = 'Lista de carpetas cargada.';
    this.colorprompt = 'yellowgreen';
    this.listasFolderEmit.emit(this.listaLocalFolders);
    this.limpiarPrompt();
    this._show_msjprompt = true;
    setTimeout(() => {
      this._show_msjprompt = false;
    }, 2000);
  }

  limpiarPrompt() {
    this.promptForm.controls['prompt'].setValue('');
  }
}
