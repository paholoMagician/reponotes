import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { EncryptService } from '../../../shared/services/encrypt.service';
import { DashboardService } from '../services/dashboard.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit, OnChanges {

  @Input() carpetaList: any;
  @Output() fileEmit: EventEmitter<any> = new EventEmitter<any>();

  _show_spinner: boolean = false;
  arrTOKEN: any;
  selectedFile: File | null = null;

  public folderForm = new FormGroup({
    folderName: new FormControl('')
  });

  constructor(private dash: DashboardService, private ncrypt: EncryptService) { }

  ngOnInit(): void {
    this.folderForm.controls['folderName'].disable();
    this.arrTOKEN = this.ncrypt.decodeJwtToken();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      if (this.carpetaList != null || this.carpetaList != undefined) {
        this.folderForm.controls['folderName'].setValue(this.carpetaList.nameFolder);
      }
    }
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
    }
  }

  onSubmit() {
    if (this.selectedFile) {
      this.guardarArchivo();
    } else {
      console.error('No file selected');
    }
  }

  guardarArchivo() {
    if (!this.selectedFile) return;

    this._show_spinner = true;
    this.dash.uploadFileDriveServer(this.arrTOKEN.iduser, this.carpetaList.id, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Archivo cargado exitosamente:', response);
        this._show_spinner = false;
      },
      error: (error) => {
        console.error('Error al cargar el archivo:', error);
        this._show_spinner = false;
      }, complete: () => {

      }
    });
  }

  modelFileServerDb: any = [];
  guardarArchivoDB() {

    // this.dash.guardarArchivos(  )

  }

}
