import { FolderLists } from "./tipolistas";

export class Lista {
  modelNotes: any[] = [];
  notesStorage: any[] = [];

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
      icon: 'description'
    };
    this.modelNotes.unshift(arr);
  }

  // Actualizar el nombre de una nota específica
  updateNoteName(noteCode: string, newName: string) {
    let x: any = localStorage.getItem('data_tipo_lista');
    let data: any[] = x ? JSON.parse(x) : [];
    let updated = false;

    data.forEach(folder => {
      let note = folder.notas.find((n: any) => n.uniquecode === noteCode);
      if (note) {
        note.nombreproducto = newName;
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('data_tipo_lista', JSON.stringify(data));
    }
    return updated;
  }

  // Método en el servicio de notas para eliminar la nota por su código único
  deleteNoteByCode(noteCode: string) {
    let x: any = localStorage.getItem('data_tipo_lista');
    let data: any[] = x ? JSON.parse(x) : [];
    let updated = false;
    data.forEach(folder => {
      let noteIndex = folder.notas.findIndex((n: any) => n.uniquecode === noteCode);
      if (noteIndex !== -1) {
        folder.notas.splice(noteIndex, 1);
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem('data_tipo_lista', JSON.stringify(data));
    }
    return updated;
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
