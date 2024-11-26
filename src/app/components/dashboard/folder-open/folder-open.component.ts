import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { EncryptService } from '../../../shared/services/encrypt.service';
import Swal from 'sweetalert2'
import { HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-folder-open',
  templateUrl: './folder-open.component.html',
  styleUrl: './folder-open.component.scss'
})
export class FolderOpenComponent implements OnInit, OnChanges {

  _show_spinner: boolean = false;

  @Input() folderData: any;
  @Input() fileList: any;
  @Input() fileFilter: any;

  @Output() NewFileSize: EventEmitter<any> = new EventEmitter<any>();

  arrTOKEN: any;

  constructor(private dash: DashboardService, private ncrypt: EncryptService) { }

  file: any = [];
  fileGhost: any = [];
  ngOnInit(): void {
    this.arrTOKEN = this.ncrypt.decodeJwtToken();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.file = this.fileList;
      this.fileGhost = this.fileList;
      if (this.fileList != undefined || this.fileList != null) {
        this.file = this.fileGhost.filter((item: any) =>
          item.nameFile.toLowerCase().includes(this.fileFilter.toLowerCase())
        );
      }
    }
  }

  // downLoadFileServer(fileDB: any) {

  //   this._show_spinner = true;

  //   this.dash.downloadFileServer(this.arrTOKEN.iduser, this.folderData.id, fileDB.nameFile).subscribe({
  //     next: (blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = fileDB.nameFile;
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //       console.log('Archivo descargado');
  //       this._show_spinner = false;
  //     },
  //     error: (e) => {
  //       this._show_spinner = false;
  //       console.error('Error en la descarga del archivo:', e);
  //     }
  //   });
  // }

  downLoadFileServer(fileDB: any) {
    this._show_spinner = true;

    // Inicializar propiedades
    fileDB.isDownloading = fileDB.isDownloading ?? true;
    fileDB.downloadProgress = fileDB.downloadProgress ?? 0;

    const totalSize = fileDB.size * 1024 * 1024 * 1024; // Convertir tamaño a bytes
    const chunkSize = 1024 * 1024; // Tamaño del chunk: 1 MB
    let downloadedSize = 0;
    const chunks: BlobPart[] = [];
    const maxRetries = 3;

    const downloadChunk = (start: number, retries = 0) => {
        if (start >= totalSize) {
            console.error("Rango de descarga fuera de los límites del archivo.");
            return;
        }

        const end = Math.min(start + chunkSize - 1, totalSize - 1);
        const headers = new HttpHeaders({ 'Range': `bytes=${start}-${end}` });

        this.dash.downloadFileServer(this.arrTOKEN.iduser, this.folderData.id, fileDB.nameFile, headers)
            .subscribe({
                next: (data: Blob) => {
                    chunks.push(data);
                    downloadedSize += data.size;
                    fileDB.downloadProgress = (downloadedSize / totalSize) * 100;

                    if (downloadedSize < totalSize) {
                        downloadChunk(start + chunkSize);
                    } else {
                        const blob = new Blob(chunks, { type: data.type });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileDB.nameFile;
                        a.click();
                        window.URL.revokeObjectURL(url);
                        fileDB.isDownloading = false;
                        this._show_spinner = false;
                        console.log('Archivo descargado');
                    }
                },
                error: (err) => {
                    if (retries < maxRetries) {
                        console.warn(`Error en el rango ${start}-${end}, reintentando... (${retries + 1}/${maxRetries})`);
                        downloadChunk(start, retries + 1);
                    } else {
                        fileDB.isDownloading = false;
                        this._show_spinner = false;
                        console.error('Error en la descarga del archivo:', err);
                    }
                }
            });
    };

    downloadChunk(0);
}


  
  deleteFile(file: any, index: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.dash.deletFileServer(this.arrTOKEN.iduser, file.idFolder, file.nameFile).subscribe({
          next: (x) => {
            this.dash.deleteFileDB(file.id).subscribe({
              next: () => {
                Swal.fire({
                  title: "Deleted!",
                  text: "Your file has been deleted.",
                  icon: "success"
                });
              }, error: (e) => {
                console.error(e);
                Swal.fire({
                  title: "Oops!",
                  text: `Something went wrong on our data base!`,
                  icon: "error"
                });
              }
            })
          }, error: (e) => {
            console.error(e);
            Swal.fire({
              title: "Oops!",
              text: "Something went wrong on our servers!",
              icon: "error"
            });
          }, complete: () => {
            this.file.splice(index, 1);
            this.obtenerFileSize(this.arrTOKEN.iduser);
          }
        })

      }
    });

  }

  // Agrega esta función en tu archivo TypeScript 
  truncateFileName(fileName: string, maxLength: number): string {
    if (fileName.length <= maxLength) { return fileName; }
    const extension = fileName.slice(fileName.lastIndexOf('.'));
    const nameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.')); const truncatedName = nameWithoutExtension.slice(0, maxLength - extension.length - 3) + '...';
    return truncatedName + extension;
  }

  obtenerFileSize(iduser: number) {
    this.dash.obtenerPesoArchivos(iduser).subscribe({
      next: (x: any) => {
        this.NewFileSize.emit(x.totalSize);
      }
    })
  }


}
