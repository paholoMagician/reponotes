import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FolderLists } from '../dashboard/sources/tipolistas';

@Component({
  selector: 'app-input-prompt',
  templateUrl: './input-prompt.component.html',
  styleUrls: ['./input-prompt.component.scss']
})
export class InputPromptComponent implements OnInit {
  listCommand: any = {
    command: 'rpn c f n=',
    description: 'Crea una nueva carpeta en el almacenamiento local'
  };
  promptForm = new FormGroup({
    prompt: new FormControl()
  });

  folderService: FolderLists;

  constructor() {
    this.folderService = new FolderLists();
  }

  xidUser: any = 0;
  ngOnInit(): void {
    if (typeof sessionStorage !== 'undefined') {
      this.xidUser = sessionStorage.getItem('id');
    }
  }

  onSubmit() {
    this.createFolder();
  }

  createFolder() {
    let xcommand: any = this.promptForm.controls['prompt'].value;
    if (xcommand.startsWith(this.listCommand.command)) {
      let folderName = xcommand.slice(this.listCommand.command.length).trim();
      if (folderName) {
        this.folderService.createFolderTypeNotesStorage(folderName, 'unique-code', 1, 'all', this.xidUser);
        this.folderService.guardarDataFolderStorage();
        console.log(`Carpeta '${folderName}' creada y guardada en el almacenamiento local.`);
      } else {
        console.error('No se proporcionó un nombre para la carpeta.');
      }
    } else {
      console.error('Comando no reconocido.');
    }
  }
}
