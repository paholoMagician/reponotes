import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-notas',
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.scss']
})
export class NotasComponent implements OnInit, OnChanges {

  listaNota: any = [];
  modelSendNotes: any = [];

  @Input() folderId: any;
  @Output() notetEmit: EventEmitter<any> = new EventEmitter<any>();

  toolbarOptions = [
    [{ 'header': [1, 2, 3, false] }, { 'aria-label': 'Header' }],
    [{ 'font': [] }, { 'aria-label': 'Font' }],
    [{ 'align': [] }, { 'aria-label': 'Align' }],
    ['bold', 'italic', 'underline', 'strike'],  // Botones de formato
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image', 'video'],  // Botones de media
    ['clean']  // Eliminar formato
  ];

  notaForm!: FormGroup; // Añadimos '!' para indicar que se inicializará en ngOnInit
  _show_spinner: boolean = false;
  constructor(private notesServices: DashboardService) { }

  xidUser: any = null;
  ngOnInit() {
    this.xidUser = sessionStorage.getItem('id');
    this.notaForm = new FormGroup({
      notaContent: new FormControl('') // Aquí se inicializa el contenido del editor
    });
  }

  idFolder: any = 0;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      if (this.folderId != null && this.folderId !== undefined) {
        // console.warn(this.folderId)
        this.idFolder = this.folderId
      }
    }
  }

  onSubmit() {
    const notaContentValue = this.notaForm.get('notaContent')?.value;
    // this.guardarNota(this.idFolder, notaContentValue);
  }

  // guardarNota(idfolder: any, nota: any) {

  //   this.modelSendNotes = {
  //     cantidad: 0,
  //     nombreproducto: nota,
  //     valor: 0,
  //     fecrea: new Date(),
  //     iduser: this.xidUser,
  //     idlistatipo: idfolder,
  //     estado: 100,
  //     urlimagen: '',
  //     permiso: 1,
  //   }

  //   this.notesServices.guardarLista(this.modelSendNotes).subscribe({
  //     next: (x) => {
  //       this.listaNota = x;
  //       this._show_spinner = false;
  //     }, error: (e) => {
  //       console.error(e);
  //       this._show_spinner = false;
  //     }, complete: () => {
  //       this.notetEmit.emit(this.listaNota);
  //     }
  //   })
  // }

}
