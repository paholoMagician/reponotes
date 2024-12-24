import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { EncryptService } from '../../../shared/services/encrypt.service';
import Swal from 'sweetalert2'
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  /** DOWNLOAD FUNCIONANDO PERFECTAMENTE */
  downloadFile(file: any) {
    const chunkSize = 1048576; // Tamaño de cada fragmento (1 MB)
    const totalSize = file.size; // El tamaño ya viene en bytes
    let start = 0; // Inicio del rango
    const chunks: Blob[] = []; // Para almacenar los fragmentos descargados

    console.log('Tamaño en BYTES: ' + totalSize);

    const downloadChunk = () => {
      const end = Math.min(start + chunkSize - 1, totalSize); // Ajuste para evitar exceder totalSize
      const rangeHeader = `bytes=${start}-${end}`;

      console.warn('==========================================================');
      console.warn('==========================================================');
      console.warn('END: ' + end);
      console.log('Solicitando fragmento:', rangeHeader);
      console.log('Id User:', this.arrTOKEN.iduser);
      console.log('ID Folder:', file.idFolder);
      console.warn('==========================================================');
      console.warn('==========================================================');

      // Solicitar el fragmento
      this.dash.getFileChunk(this.arrTOKEN.iduser, file.idFolder, file.nameFile, rangeHeader).subscribe({
        next: (chunk) => {
          chunks.push(chunk);
          start += chunkSize; // Avanza al siguiente rango

          console.log(`Descargado: ${start} de ${totalSize} bytes`);

          // Actualizar progreso
          file.downloadProgress = Math.min((start / totalSize) * 100, 100);
          if (start < totalSize) {
            downloadChunk(); // Continuar descargando
          } else {
            // Combinar los fragmentos descargados
            const fileBlob = new Blob(chunks);
            const url = window.URL.createObjectURL(fileBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.nameFile;
            a.click();
            window.URL.revokeObjectURL(url);

            file.isDownloading = false; // Finaliza la descarga
          }
        },
        error: (err) => {
          console.error('Error descargando el fragmento:', err);
          file.isDownloading = false;
          file.downloadProgress = 0; // Reinicia progreso en caso de error
        },
      });
    };

    file.isDownloading = true; // Indicar que la descarga ha comenzado
    downloadChunk(); // Inicia la descarga del primer fragmento
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
