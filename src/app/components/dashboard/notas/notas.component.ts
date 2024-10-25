import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-notas',
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.scss']
})
export class NotasComponent implements OnInit {
  notaForm!: FormGroup; // Añadimos '!' para indicar que se inicializará en ngOnInit
  _show_spinner: boolean = false;
  constructor( private notesServices: DashboardService ) {}

  ngOnInit() {
    this.notaForm = new FormGroup({
      notaContent: new FormControl('') // Aquí se inicializa el contenido del editor
    });
  }

  onSubmit() {
    const notaContentValue = this.notaForm.get('notaContent')?.value;
    console.log('Contenido de la nota enviado:', notaContentValue);
    // Lógica para guardar el contenido de la nota
  }

  // guardarNota() {
  //   this.notesServices.guardarLista(n).subscribe({
  //     next: (x) => {
  //       console.warn('Nota guardada: ' + n)
  //       this._show_spinner = false;
  //     }, error: (e) => {
  //       console.error(e);
  //       this._show_spinner = false;
  //     }
  //   })
  // }

}
