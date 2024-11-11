import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { EncryptService } from '../../../shared/services/encrypt.service';

@Component({
  selector: 'app-folder-open',
  templateUrl: './folder-open.component.html',
  styleUrl: './folder-open.component.scss'
})
export class FolderOpenComponent implements OnInit, OnChanges {

  @Input() folderData: any;
  @Input() fileList: any;
  @Input() fileFilter: any;

  arrTOKEN: any;

  constructor(private dash: DashboardService, private ncrypt: EncryptService) { }

  file: any = [];
  fileGhost: any = [];
  ngOnInit(): void {
    this.arrTOKEN = this.ncrypt.decodeJwtToken();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.file = this.fileList
      this.fileGhost = this.fileList
      this.file = this.fileGhost.filter((item: any) =>
        item.nameFile.toLowerCase().includes(this.fileFilter.toLowerCase())
      );
    }
  }

  downLoadFileServer(fileDB: any) {
    this.dash.downloadFileServer(this.arrTOKEN.iduser, this.folderData.id, fileDB.nameFile).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileDB.nameFile;
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('Archivo descargado');
      },
      error: (e) => {
        console.error('Error en la descarga del archivo:', e);
      }
    });
  }


}
