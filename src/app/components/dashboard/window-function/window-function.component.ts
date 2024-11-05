import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DashboardService } from '../services/dashboard.service';
import { EncryptService } from '../../../shared/services/encrypt.service';

@Component({
  selector: 'app-window-function',
  templateUrl: './window-function.component.html',
  styleUrl: './window-function.component.scss'
})
export class WindowFunctionComponent implements OnInit, OnChanges {

  @Output() folerEmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() folderLists: any;


  modelFolder: any = [];
  _show_spinner: boolean = false;
  arrTOKEN: any;
  public folderForm = new FormGroup({
    folderName: new FormControl('')
  })

  constructor(private notesServices: DashboardService, private ncrypt: EncryptService) { }

  ngOnInit(): void {
    this.arrTOKEN = this.ncrypt.decodeJwtToken();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      console.warn(this.folderLists)
    }
  }

  onSubmit() {

    this.guardarFolder(null, 1);

  }

  res: any = [];
  guardarFolder(idfolder: any, positionFolder: any) {

    let xfolder: any = this.folderForm.controls['folderName'].value?.trim() || '';
    this.folderLists.filter((x: any) => {
      if (x.nameFolder == xfolder) {
        xfolder = xfolder + '_copy';
      }
    })

    this._show_spinner = true;
    this.modelFolder = {
      nameFolder: xfolder,
      descripcion: '',
      positionFolder: positionFolder,
      iduser: this.arrTOKEN.iduser,
      estado: 1,
      permisos: 1,
      password: '',
      idfolder: idfolder,
      colorFolder: ''
    }

    this.notesServices.saveFolder(this.modelFolder).subscribe({
      next: (x) => {
        this.res = x;
        console.log('Carpeta guardada')
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }, complete: () => {
        this.folerEmit.emit(this.res);
        this._show_spinner = false;
        this.limpiar();
      }
    })

  }

  limpiar() {
    this.folderForm.controls['folderName'].setValue('');
  }


}


