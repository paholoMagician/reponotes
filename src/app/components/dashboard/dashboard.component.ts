import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../shared/login/services/login.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  copy_codec: string = '';
  constructor(private router: Router, private log: LoginService) { }

  ngOnInit(): void {
    this.log.validacion();
  }

  folderList: any = null;
  obtenerFoldersList(event: any) {
    this.folderList = event;
  }

  copyToClipboard(codec: string) {
    navigator.clipboard.writeText(codec).then(() => {
      this.copy_codec = codec;
    }).catch(err => {
      console.error('Error al copiar el código:', err);
    });
  }



}
