import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../shared/login/services/login.service';
import { NetworkService } from '../../shared/network/network-service.service';
import { DashboardService } from './services/dashboard.service';
import { EncryptService } from '../../shared/services/encrypt.service';
import Swal from 'sweetalert2'
import { FormControl, FormGroup } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { take } from 'rxjs';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

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
  capacidadGB: number = 0.0;
  membresiaNombrePaquete: string = '';
  membresiaDescripcion: string = '';

  intervalId: any;
  countdown: string = ''; // Cuenta regresiva
  isExpired: boolean = false; // Indica si el token ha expirado
  activityTimeout: any; // Controla la inactividad del usuario

  chunkProgress: number = 0;
  labelChunkProgress: string = '';
  labelProgress: string = '';
  progress: number = 0;
  totalChunks: number = 0;
  currentChunkIndex: number = 0;

  show_cola_archivos: boolean = false;
  archivosEnCola: { nombre: string; size: any, folder: string, folderId: number, progreso: number }[] = [];

  cantidadArchivosPorSubir: number = 0;
  archivosParaCarpeta: any = [];

  // Objeto para almacenar el progreso de cada archivo
  progressMap: { [key: string]: number } = {};
  chunkProgressLabel: string = '';

  public folderForm = new FormGroup({
    searchItem: new FormControl('')
  });

  constructor(private router: Router,
    private log: LoginService,
    private cdr: ChangeDetectorRef,
    private networkService: NetworkService,
    private dash: DashboardService, private ncrypt: EncryptService) { }

  ngOnInit(): void {
    this.arrTOKEN = this.ncrypt.decodeJwtToken();
    this.log.validacion();
    this.obtenerFileSize(this.arrTOKEN.iduser);
    const expirationTime = new Date(this.arrTOKEN.tiempoExp); // Fecha de expiración
    this.startTokenExpirationCheck(expirationTime);
    this.capacidadGB = this.arrTOKEN.membresiaCapacidad;
    this.membresiaNombrePaquete = this.arrTOKEN.membresiaNombrePaquete;
    this.membresiaDescripcion = this.arrTOKEN.membresiaDescripcion;
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

  closeSession(typeClose: number) {
    sessionStorage.removeItem('token');
    let closeAutoType: boolean;
    /** ================================================ */
    if (typeClose == 1) {
      // Cerro sesion de manera manual
      closeAutoType = true;
    } else if (typeClose == 0) {
      // Expiro su token de sesion
      closeAutoType = false;
    }
    /** ================================================ */

    const dateNow: any = new Date();

    localStorage.setItem('dataCloseSessionEmail', this.arrTOKEN.email);
    localStorage.setItem('dataCloseSessionType', closeAutoType!.toString());
    localStorage.setItem('dataCloseSessionDate', dateNow);
    this.router.navigate(['/login']);

  }

  ngOnDestroy(): void {
    // Remover el listener para evitar fugas de memoria
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
    if (this.intervalId) {
      clearInterval(this.intervalId); // Limpiar el intervalo al destruir el componente
    }
    this.clearActivityTimeout(); // Limpiar el timeout de inactividad
  }

  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  handleUserActivity(): void {
    this.resetInactivityTimer(); // Reiniciar el timer de inactividad al detectar actividad
  }

  startTokenExpirationCheck(expirationTime: Date): void {
    this.intervalId = setInterval(() => {
      const currentTime = new Date(); // Hora actual
      const timeDifference = expirationTime.getTime() - currentTime.getTime(); // Diferencia en milisegundos

      if (timeDifference <= 0 && !this.isExpired) {
        // Si el token ha expirado, iniciar el chequeo de inactividad
        this.isExpired = true;
        this.startInactivityTimer();
      }

      if (!this.isExpired) {
        // Calcular y mostrar la cuenta regresiva
        this.countdown = this.formatTimeDifference(timeDifference);
      }
    }, 1000); // Revisa cada segundo
  }

  startInactivityTimer(): void {
    this.clearActivityTimeout(); // Limpiar cualquier timeout previo
    this.activityTimeout = setTimeout(() => {
      // Si no hay actividad en 1 minuto, cerrar sesión
      this.closeSession(0);
    }, 60000); // 1 minuto de espera para detectar actividad
  }

  resetInactivityTimer(): void {
    if (this.isExpired) {
      this.startInactivityTimer(); // Reiniciar el timer si el token ya expiró
    }
  }

  clearActivityTimeout(): void {
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout); // Limpiar el timeout existente
    }
  }

  formatTimeDifference(timeDifference: number): string {
    const totalSeconds = Math.floor(timeDifference / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getProgressKeys(): string[] {
    return Object.keys(this.progressMap);
  }

  /** =================================================================== */
  /** Esta funcion se dispara despues de eliminar un archivo */
  getFileSize(event: any) {
    this.pesoActual = event;
  }
  /** =================================================================== */

  // Array para almacenar los archivos seleccionados
  archivosSeleccionados: File[] = [];
  onDragOver(event: DragEvent, carpeta: any) {
    event.preventDefault();
    event.stopPropagation();
    let xdiv = <HTMLDivElement>document.getElementById('folder-' + carpeta.id);
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


  onFilesSelected(event: Event, carpeta: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const nuevosArchivos: File[] = Array.from(input.files);

      // Filtrar archivos duplicados en `archivosEnCola`
      this.archivosFiltrados = nuevosArchivos.filter(
        (nuevoArchivo) =>
          !this.archivosEnCola.some(
            (archivoEnCola) =>
              archivoEnCola.nombre === nuevoArchivo.name && archivoEnCola.folderId === carpeta.id
          )
      );

      console.warn('this.archivosFiltrados')
      console.warn(this.archivosFiltrados)
      // Añadir archivos filtrados a la cola
      this.archivosCola(this.archivosFiltrados, carpeta.nameFolder, carpeta.id);

      // Iniciar subida
      this.subirArchivos(this.archivosFiltrados, carpeta);
    }
  }

  archivosFiltrados: any = [];
  onDrop(event: DragEvent, carpeta: any) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const nuevosArchivos: File[] = Array.from(event.dataTransfer.files);

      // Filtrar archivos duplicados en `archivosEnCola`
      this.archivosFiltrados = nuevosArchivos.filter(
        (nuevoArchivo) =>
          !this.archivosEnCola.some(
            (archivoEnCola) =>
              archivoEnCola.nombre === nuevoArchivo.name && archivoEnCola.folderId === carpeta.id
          )
      );
      console.warn('this.archivosFiltrados')
      console.warn(this.archivosFiltrados)
      // Añadir archivos filtrados a la cola
      this.archivosCola(this.archivosFiltrados, carpeta.nameFolder, carpeta.id);

      // Iniciar subida
      this.subirArchivos(this.archivosFiltrados, carpeta);
    }
  }

  archivosCola(files: File[], carpeta: string, idFolder: number) {
    files.forEach((file: File) => {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2); // Convertir tamaño a MB
      this.archivosEnCola.push({
        nombre: file.name,
        size: `${sizeInMB} MB`,
        folder: carpeta,
        folderId: idFolder,
        progreso: 0 // Inicializamos progreso en 0
      });
    });
    this.cantidadArchivosPorSubir = this.archivosEnCola.length;
  }


  async subirArchivos(archivos: File[], carpeta: any) {

    // Agrupar archivos por carpeta.id
    const archivosPorCarpeta = new Map<number, File[]>();

    archivos.forEach((file) => {
      const carpetaId = carpeta.id;
      if (!archivosPorCarpeta.has(carpetaId)) {
        archivosPorCarpeta.set(carpetaId, []);
      }
      archivosPorCarpeta.get(carpetaId)!.push(file);
    });

    // Subir archivos carpeta por carpeta
    for (const [carpetaId, archivosDeCarpeta] of archivosPorCarpeta.entries()) {
      const carpetaActual: any = { id: carpetaId, nameFolder: carpeta.nameFolder }; // Ajustar para obtener el nombre de carpeta si es necesario

      console.log(`Iniciando subida de archivos para carpeta: ${carpetaActual.nameFolder} (ID: ${carpetaId})`);

      for (const file of archivosDeCarpeta) {
        console.log(`Subiendo archivo: ${file.name} en carpeta ${carpetaActual.nameFolder}`);

        const chunkSize = 5 * 1024 * 1024; // Tamaño del chunk: 5 MB
        const chunks = this.splitFile(file, chunkSize);
        const totalChunks = chunks.length;

        for (let currentChunkIndex = 0; currentChunkIndex < totalChunks; currentChunkIndex++) {
          const chunk = chunks[currentChunkIndex];
          const progresoArchivo = Math.round((100 * (currentChunkIndex + 1)) / totalChunks);

          // Encuentra el archivo actual en archivosEnCola y actualiza su progreso
          const archivoEnCola = this.archivosEnCola.find(
            (archivo) => archivo.nombre === file.name && archivo.folderId === carpetaActual.id
          );
          if (archivoEnCola) {
            archivoEnCola.progreso = progresoArchivo;
          }
          let success = false;
          let attempts = 0;
          const maxAttempts = 3; // Intentar un máximo de 3 veces

          while (!success && attempts < maxAttempts) {
            attempts++;
            try {
              // Subir chunk usando .subscribe()
              await new Promise<void>((resolve, reject) => {
                this.dash.uploadFileDriveServer(
                  chunk,
                  file.name,
                  this.arrTOKEN.iduser,
                  carpetaActual.id,
                  currentChunkIndex,
                  totalChunks
                ).subscribe({
                  next: (event) => {
                    switch (event.type) {
                      case HttpEventType.UploadProgress:
                        if (event.total) {
                          const chunkProgress = Math.round((100 * event.loaded) / event.total);
                          console.log(`Progreso del chunk ${currentChunkIndex + 1}/${totalChunks} de archivo ${file.name}: ${chunkProgress}%`);
                        }
                        break;
                      case HttpEventType.Response:
                        success = true;
                        console.log(`Chunk ${currentChunkIndex + 1}/${totalChunks} de archivo ${file.name} subido exitosamente.`);
                        resolve(); // Indica que el chunk se subió exitosamente
                        break;
                      default:
                        break;
                    }
                  },
                  error: (err) => {
                    console.error(`Error subiendo chunk ${currentChunkIndex + 1} para archivo ${file.name} en carpeta ${carpetaActual.nameFolder}:`, err);
                    if (attempts === maxAttempts) {
                      console.error(`Falló el chunk ${currentChunkIndex + 1} después de ${maxAttempts} intentos.`);
                      reject(err); // Marca el chunk como fallido
                    }
                  },
                });
              });
            } catch (err) {
              console.error(`Error subiendo chunk ${currentChunkIndex + 1} para archivo ${file.name} en carpeta ${carpetaActual.nameFolder}:`, err);
            }

            if (!success) {
              await this.sleep(1000); // Delay entre intentos
            }
          }

          if (!success) {
            console.error(`Fallo definitivo subiendo el archivo ${file.name} en carpeta ${carpetaActual.nameFolder}.`);
            break; // Rompe el bucle de chunks si falla definitivamente
          }
        }

        console.log(`Archivo ${file.name} cargado completamente en carpeta ${carpetaActual.nameFolder}.`);
        this.guardarArchivoDB(file.name, carpetaActual.id, file.size);

        this.archivosEnCola = this.archivosEnCola.filter(
          (archivo) => archivo.nombre !== file.name || archivo.folderId !== carpetaActual.id
        );

        this.cantidadArchivosPorSubir--;

      }

      // Actualiza el estilo de la carpeta específica
      const xdiv = document.getElementById('folder-' + carpetaId) as HTMLDivElement;
      if (xdiv) {
        xdiv.style.transition = 'ease all 1s';
        xdiv.style.background = 'transparent';
        xdiv.style.borderRadius = '0px';
      }

      console.log(`Subida completa para carpeta: ${carpetaActual.nameFolder}`);

    }
  }


  private splitFile(file: File, chunkSize: number): Blob[] {
    const chunks: Blob[] = [];

    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }
    return chunks;
  }



  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  pesoActual: number = 0.0;
  obtenerFileSize(iduser: number) {
    this.dash.obtenerPesoArchivos(iduser).subscribe({
      next: (x: any) => {
        this.pesoActual = x.totalSize;
      }
    })
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
  guardarArchivoDB(nameFile: any, carpetaList: any, size: number) {

    this._show_spinner = true;

    if (nameFile != undefined || nameFile != null) {

      this.modelFileServerDb = {
        "position": 1,
        "nameFile": nameFile,
        "tagdescription": "",
        "estado": 1,
        "permisos": 1,
        "password": "",
        "type": "",
        "idFolder": carpetaList,
        "size": size
      }

      this.dash.guardarArchivos(this.modelFileServerDb).subscribe({
        next: (x) => {
          Toast.fire({
            icon: "success",
            title: "File " + nameFile + " has been added."
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
          this.obtenerFileSize(this.arrTOKEN.iduser);
          this.listaCarpetas.filter((x: any) => {
            if (x.id == carpetaList) {
              x.cantFile = x.cantFile + 1;
            }
          })
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
        this._show_spinner = false
      }, complete: () => {
        this._show_spinner = false

      }
    })
  }

  onRightClick(event: MouseEvent, carpeta: any): void {
    event.preventDefault(); // Prevenir el menú contextual predeterminado
    this.toggleActive(carpeta); // Ejecutar toggleActive con clic derecho

    // Abrir el menú manualmente
    const matMenuTrigger = event.target as HTMLElement;
    matMenuTrigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  onLeftClick(event: MouseEvent): void {
    if (event.button === 0) { // Detecta clic izquierdo (button 0)
      event.preventDefault(); // Prevenir cualquier acción asociada al clic izquierdo
    }
  }


  deleteFolderEmpty(folder: any, index: number) {

    this.listaCarpetas.filter((x: any) => {

      if (x.id == folder.id) {
        if (x.cantFile == 0) {
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
            }, complete: () => {
              this.listaCarpetas.splice(index, 1);
              this.obtenerFileSize(this.arrTOKEN.iduser);
            }
          })
        } else {
          this.deleteFolder(folder, index);
        }
      }

    })



  }

  deleteFolder(folder: any, index: number) {
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
              this.listaCarpetas.splice(index, 1);
              this.obtenerFileSize(this.arrTOKEN.iduser);
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

    this.listaCarpetas.filter((x: any) => {
      if (x.id == event.id) x.cantFile = 0;
    })

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

