import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../shared/login/services/login.service';
import { NetworkService } from '../../shared/network/network-service.service';
import { DashboardService } from './services/dashboard.service';
import { EncryptService } from '../../shared/services/encrypt.service';
import Swal from 'sweetalert2'
import { FormControl, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  @Output() folderEmit: EventEmitter<any> = new EventEmitter<any>();

  dataEmitFolder: any;
  filelistEmit: any;
  folder_choice: string = '';
  _folder_open: boolean = false;
  _file_upload_open: boolean = false;
  _notes_open: boolean = false;
  _show_spinner: boolean = false;
  _show_app_local: boolean = false;
  _folder_show: boolean = false;
  _show_app_online: boolean = true;
  isConnected: boolean = true;
  showFolders: boolean = true;
  showNotes: boolean = true;
  showPromptCall: boolean = false;
  copy_codec: string = '';
  _show_help: boolean = true;
  folderList: any = null;
  promptData: any = '<RPN command history>';
  idUser: any;
  listaCarpetas: any = [];
  listaNotas: any = [];
  folderWithNotes: any = [];
  notesListInFolder: any = null;
  res: any = [];
  modelFolder: any = [];
  arrTOKEN: any;

  public folderForm = new FormGroup({
    searchItem: new FormControl('')
  });

  constructor(private router: Router,
    private log: LoginService,
    private networkService: NetworkService,
    private dash: DashboardService, private ncrypt: EncryptService) { }

  ngOnInit(): void {
    this.arrTOKEN = this.ncrypt.decodeJwtToken();
    this.log.validacion();
    this.networkService.getOnlineStatus().subscribe((status: boolean) => {
      this.isConnected = status;
      console.log('Conectado a Internet:', status);
    });

    // Detectar la combinación Ctrl + I
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    this.obtenerCarpetas();

  }

  xfilter: string = '';
  sendFilter() {
    this.xfilter = this.folderForm.controls['searchItem'].value || '';
  }

  /** TOKEN NO TOCAR [EXPIRACION SESION] */
  startSessionTimer(exp: number): void {
    const currentTime = Math.floor(Date.now() / 1000); // Obtener el tiempo actual en segundos
    const timeUntilExpiration = exp - currentTime;
    const twoMinutesInSeconds = 2 * 60;

    if (timeUntilExpiration > 0) {
      if (timeUntilExpiration > twoMinutesInSeconds) {
        setTimeout(() => {
          const minutesLeft = Math.floor((exp - Math.floor(Date.now() / 1000)) / 60);
          Swal.fire({
            title: "Sesión por expirar.",
            text: `Por motivos de seguridad su sesión está por expirar en ${minutesLeft} minutos`,
            footer: 'Puedes volver a iniciar sesión para generar un token de sesión nuevo.',
            icon: "warning"
          });
          setTimeout(() => {
            this.closeSession();
          }, twoMinutesInSeconds * 1000); // Esperar los dos minutos restantes
        }, (timeUntilExpiration - twoMinutesInSeconds) * 1000); // Esperar hasta que queden dos minutos
      } else {
        setTimeout(() => {
          this.closeSession();
        }, timeUntilExpiration * 1000); // Convertir a milisegundos
      }
    } else {
      this.closeSession(); // Expiró el token, cerrar la sesión inmediatamente
    }
  }

  closeSession() {
    sessionStorage.removeItem('token');
    this.router.navigate(['login']);
  }


  ngOnDestroy(): void {
    // Remover el listener para evitar fugas de memoria
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }


  onDragOver(event: DragEvent, carpeta: any) {
    event.preventDefault();
    event.stopPropagation();
    let xdiv = <HTMLDivElement>document.getElementById('folder-' + carpeta.id);
    // console.warn(xdiv);
    xdiv.style.transition = 'ease all 1s';
    xdiv.style.background = 'rgba(0, 123, 255, 0.1)';
    xdiv.style.borderRadius = '10px';
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent, carpeta: any) {
    event.preventDefault();
    event.stopPropagation();
    let xdiv = <HTMLDivElement>document.getElementById('folder-' + carpeta.id);
    xdiv.style.transition = 'ease all 1s';
    xdiv.style.background = 'transparent';
    xdiv.style.borderRadius = '0px';
  }


  onDrop(event: DragEvent, carpeta: any) {

    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      console.warn(file);
      // Llamar al servicio para cargar el archivo
      this.dash.uploadFileDriveServer(this.arrTOKEN.iduser, carpeta.id, file).subscribe({
        next: (response) => {
          console.log('Archivo cargado exitosamente:', response);
        },
        error: (error) => {
          console.error('Error al cargar el archivo:', error);
        }, complete: () => {
          let xdiv = <HTMLDivElement>document.getElementById('folder-' + carpeta.id);
          this.guardarArchivoDB(file.name, carpeta.id);
          xdiv.style.transition = 'ease all 1s';
          xdiv.style.background = 'transparent';
          xdiv.style.borderRadius = '0px';
        }
      });

      event.dataTransfer.clearData();

    }
  }

  limpiar() {
    // Tu lógica de limpieza aquíw
  }

  openContextMenu(event: MouseEvent, carpeta: any) {
    event.preventDefault(); // Prevenir el menú contextual del navegador
  }


  dataFolderSend: any = [];
  interfazUpload(data: any) {
    this._file_upload_open = true;
    this.dataFolderSend = data;
    console.warn(this.dataFolderSend);
  }

  getFileUpdate(event: any) {
    console.warn(event);
  }

  getFileEmit(event: any) {
    console.warn(event)
    this._file_upload_open = event;
  }

  notasId: any;
  crearNota(folderId: number) {
    console.log('Crear nota en la carpeta:', folderId);
    // this.folderEmit.emit(folderId);
    this.notasId = folderId;
    this._notes_open = true;
  }

  eliminarCarpeta(folderId: number) {
    console.log('Eliminar carpeta:', folderId);
  }


  modelFileServerDb: any = [];
  guardarArchivoDB(nameFile: any, carpetaList: any) {

    if (nameFile != undefined || nameFile != null) {

      this._show_spinner = true;
      this.modelFileServerDb = {
        "position": 1,
        "nameFile": nameFile,
        "tagdescription": "",
        "estado": 1,
        "permisos": 1,
        "password": "",
        "type": "",
        "idFolder": carpetaList
      }

      console.log(this.modelFileServerDb);

      this.dash.guardarArchivos(this.modelFileServerDb).subscribe({
        next: (x) => {
          Swal.fire({
            title: "File has been added.",
            text: "File has been successfully added to your folder",
            icon: "success"
          });
        }, error: (e) => {
          this._show_spinner = false;
          Swal.fire({
            title: "Oops!",
            text: "Something went wrong on our servers!",
            icon: "error"
          });
          console.error(e);
        }, complete: () => {
          this._show_spinner = false;
        }
      })

    }

  }


  obtenerCarpetas() {
    this._show_spinner = true;
    this.dash.obtenerFolders(this.arrTOKEN.iduser, 'folder', 0).subscribe({
      next: (x) => {
        this.listaCarpetas = x;
        console.table(this.listaCarpetas);
      },
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },
      complete: () => {
        // this.unirCarpetasNotas();
        this._show_spinner = false;
      }
    });
  }

  obtenerArchivosServerDB(folder: any) {
    this._show_spinner = true;
    this.dataEmitFolder = folder;
    this._folder_show = true;
    this.folder_choice = folder.nameFolder;
    this.dash.obtenerArchivos(this.arrTOKEN.iduser, folder.id).subscribe({
      next: (x) => {
        this.filelistEmit = x;
        console.warn('ARCHIVOS');
        console.warn(this.filelistEmit);
      }, error: (e) => {
        console.error(e);
        this._folder_show = false;
      }, complete: () => {
        this._show_spinner = false

      }
    })
  }

  deleteFolder(folder: any) {
    if (folder != null || folder != undefined) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.dash.deleteFolderServer(this.arrTOKEN.iduser, folder.id).subscribe({
            next: (x) => {

              this.dash.deleteFolderDB(folder.id).subscribe({
                next: () => {
                  Swal.fire({
                    title: "Deleted!",
                    text: "Your folder has been deleted.",
                    icon: "success"
                  });
                }, error: (e) => {
                  console.error(e);
                  Swal.fire({
                    title: "Oops!",
                    text: `Something went wrong on our data base!`,
                    icon: "error"
                  });
                }
              })
            }, error: (e) => {
              console.error(e);
              Swal.fire({
                title: "Oops!",
                text: "Something went wrong on our servers!",
                icon: "error"
              });
            }, complete: () => {

            }
          })

        }
      });
    }
  }

  toggleActive(carpeta: any) {
    this.folderWithNotes.forEach((f: any) => f.active = false); // Desactiva todas las carpetas
    carpeta.active = true; // Activa la carpeta seleccionada
  }

  // Manejar la combinación Ctrl + I
  handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'i') {
      event.preventDefault();  // Prevenir el comportamiento por defecto del navegador
      this.togglePromptCall(); // Alternar la visibilidad del div
    }
  }

  listFolderActuallyDesktop: any = [];
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && event.key === 'F') {
      this.listFolderActuallyDesktop = this.listaCarpetas;
      console.warn(this.listFolderActuallyDesktop)
      this.createFolder();
    }
  }

  createFolder() {
    this._folder_open = true
  }

  getFolderOutput(event: any) {
    this.listaCarpetas.push(event);
    this._folder_open = false;
  }



  togglePromptCall() {

    const promptCallElement = document.querySelector('.prompt-call');
    if (this.showPromptCall) {
      promptCallElement?.classList.remove('fade-in');
      promptCallElement?.classList.add('fade-out');
      setTimeout(() => {
        this.showPromptCall = false;
      }, 500);
    } else {
      this.showPromptCall = true;
      setTimeout(() => {
        promptCallElement?.classList.remove('fade-out');
        promptCallElement?.classList.add('fade-in');
      }, 500);
    }

  }



}

