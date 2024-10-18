import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../shared/login/services/login.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  showFolders: boolean = true;
  showNotes:   boolean = true;
  copy_codec: string = '';
  constructor(private router: Router, private log: LoginService) { }

  ngOnInit(): void {
    this.log.validacion();
  }

  folderList: any = null;
  obtenerFoldersList(event: any) {
    if( event ) this.folderList = event, this.showFolders = true, this.showNotes = false;
    console.table(this.folderList);
  }

  notesListInFolder: any = null;
  obtenerNotesList( event: any ) {
    if( event ) this.notesListInFolder = event, this.showFolders = false, this.showNotes = true;
    console.table(this.notesListInFolder);
  }

  copyToClipboard(codec: string) {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codec).then(() => {
        this.copy_codec = codec;
        // alert('Código copiado al portapapeles: ' + codec);
      }).catch(err => {
        console.error('Error al copiar el código:', err);
      });
    } else {
      console.warn('La API de portapapeles no está disponible en este navegador.');
      this.copy_codec = codec;
      // Método alternativo de copia (menos confiable)
      this.fallbackCopyTextToClipboard(codec);
    }
  }
  
  // Método alternativo en caso de que la API de portapapeles no esté disponible
  fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value
  }  



}
