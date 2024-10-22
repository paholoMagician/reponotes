import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DashboardService } from '../../components/dashboard/services/dashboard.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-navside',
  templateUrl: './navside.component.html',
  styleUrl: './navside.component.scss'
})
export class NavsideComponent implements OnInit, OnChanges {

  @Input() dataShowPrompt: any = '';
  modelTipoLista: any = [];
  @Output() dataHistoryToPromptRPN: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dash: DashboardService) { }

  ngOnInit(): void {

  }

  listHistoryPrompts: any = []
  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      //console.warn('@Input(): ' + this.dataShowPrompt)
      this.listHistoryPrompts.unshift(this.dataShowPrompt);
    }
  }

  onSubmit() { }

  emitDataHistoryPrompt(data: any) {
    //console.warn(data)
    this.dataHistoryToPromptRPN.emit(data)
  }

  // guardarTipoLista() {

  //   this.dash.guardarTipoLista(this.modelTipoLista).subscribe({
  //     next: (x) => {

  //     }
  //   })

  // }

}
