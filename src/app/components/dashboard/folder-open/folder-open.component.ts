import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { EncryptService } from '../../../shared/services/encrypt.service';
import Swal from 'sweetalert2'
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

  deleteFile(file: any, index: number) {

    console.warn(file)

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
          }
        })

      }
    });

  }

}
