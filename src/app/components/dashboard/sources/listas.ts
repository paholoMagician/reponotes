import { FolderLists } from "./tipolistas";

export class Lista {
  modelNotes: any[] = [];

  // Crear y almacenar una nueva nota
  createNotesStorage(name: string, uniquecode: string, idtipolista: any, estado: number, permisos: any, iduser: number) {
    let arr: any = {
      cantidad: 0,
      nombreproducto: name,
      valor: 0,
      iduser: iduser,
      idlistatipo: idtipolista,
      estado: estado,
      urlimagen: '',
      fecrea: new Date(),
      permiso: permisos,
      uniquecode: uniquecode,
      icon: 'docs'
    };
    this.modelNotes.unshift(arr);
  }

  // Guardar datos de notas en el almacenamiento local
  guardarDataNotesStorage(folderService: FolderLists) {
    this.modelNotes.forEach(note => {
      // Añadir nota a la carpeta correspondiente
      folderService.addNoteToFolder(note, note.idlistatipo);
    });
    // Limpiar el array modelNotes después de guardarlo
    this.modelNotes = [];
  }

  // Cargar datos de notas desde el almacenamiento local
  cargarDataNotesStorage() {
    let x: any = localStorage.getItem('data_notes');
    this.modelNotes = x ? JSON.parse(x) : [];
  }

  // Leer notas de una carpeta específica
  getNotesFromFolder(folderCode: string): any[] {
    let x: any = localStorage.getItem('data_tipo_lista');
    let data: any[] = x ? JSON.parse(x) : [];
    let folder = data.find(item => item.uniquecode === folderCode);
    return folder ? folder.notas : [];
  }

}
