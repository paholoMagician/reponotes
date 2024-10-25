import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-window-function',
  templateUrl: './window-function.component.html',
  styleUrl: './window-function.component.scss'
})
export class WindowFunctionComponent implements OnInit {

  @Output() folerEmit: EventEmitter<any> = new EventEmitter<any>();
  modelFolder: any = [];
  _show_spinner: boolean = false;

  public folderForm = new FormGroup({
    folderName: new FormControl('')
  })

  constructor(private notesServices: DashboardService) { }

  ngOnInit(): void {

  }

  onSubmit() { 

    this.guardarFolder();

  }

  res: any = [];
  guardarFolder() {
    
    let xfolder: any = this.folderForm.controls['folderName'].value?.trim() || '';
    let xuser: any = sessionStorage.getItem('id');
    this._show_spinner = true;
    this.modelFolder = {
      nombretipo: xfolder,
      iduser: xuser,
      estado: 100,
      permiso: 1,
      presupuesto: 0
    }

    this.notesServices.guardarTipoLista(this.modelFolder).subscribe({
      next: (x) => {
        console.warn(x);
        this.res = x;
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


