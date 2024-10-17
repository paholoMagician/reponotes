import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../components/dashboard/services/dashboard.service';

@Component({
  selector: 'app-navside',
  templateUrl: './navside.component.html',
  styleUrl: './navside.component.scss'
})
export class NavsideComponent implements OnInit {

  modelTipoLista: any = [];
  constructor(private dash: DashboardService) { }

  ngOnInit(): void {

  }



  guardarTipoLista() {

    this.dash.guardarTipoLista(this.modelTipoLista).subscribe({
      next: (x) => {

      }
    })

  }

}
