import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-window-function',
  templateUrl: './window-function.component.html',
  styleUrl: './window-function.component.scss'
})
export class WindowFunctionComponent implements OnInit {

  public folderForm = new FormGroup({
    folderName: new FormControl('')
  })

  constructor(private notesServices: DashboardService) { }

  ngOnInit(): void {

  }

  onSubmit() { }


  modelFolder: any = [];
  guardarFolder() {
    let xfolder: any = this.folderForm.controls['folderName'].value?.trim() || '';
    console.log(xfolder);
    let xuser: any = sessionStorage.getItem('id');
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
      }, error: (e) => {
        console.error(e);
      }, complete: () => {

      }
    })

  }


}


