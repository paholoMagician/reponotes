import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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


  constructor(private dash: DashboardService) { }

  ngOnInit(): void {

  }

  listHistoryPrompts: any = []
  ngOnChanges(changes: SimpleChanges): void {
      if(changes) {
        this.listHistoryPrompts.push(this.dataShowPrompt)
      }
  }

  onSubmit() {}



  // guardarTipoLista() {

  //   this.dash.guardarTipoLista(this.modelTipoLista).subscribe({
  //     next: (x) => {
        
  //     }
  //   })

  // }

}
