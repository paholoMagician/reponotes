export class FolderLists {
  modelFolderNotes: any[] = [];

  createFolderTypeNotesStorage(name: string, uniquecode: string, estado: number, permisos: any, iduser: number) {
    let arr: any = {
      nombretipo: name,
      iduser: iduser,
      estado: estado,
      permisos: permisos,
      presupuesto: 0,
      uniquecode: uniquecode,
      icon: 'folder',
      notas: [] // Agregar el array de notas aquí
    };
    this.modelFolderNotes.unshift(arr);
  }

  guardarDataFolderStorage() {
    let x: any = localStorage.getItem('data_tipo_lista');
    let data: any[] = x ? JSON.parse(x) : [];
    this.modelFolderNotes.forEach(folder => {
      // Verificar si existe una carpeta con el mismo nombre
      let existingFolder = data.find(item => item.nombretipo === folder.nombretipo);
      while (existingFolder) {
        folder.nombretipo += '_copy';
        existingFolder = data.find(item => item.nombretipo === folder.nombretipo);
      }
      data.push(folder);
    });
    localStorage.setItem('data_tipo_lista', JSON.stringify(data));
    // Limpia el array modelFolderNotes después de guardarlo
    this.modelFolderNotes = [];
  }

  // Método para cargar datos desde el almacenamiento local
  cargarDataFolderStorage() {
    let x: any = localStorage.getItem('data_tipo_lista');
    this.modelFolderNotes = x ? JSON.parse(x) : [];
  }

  // Método para añadir notas a una carpeta específica
  addNoteToFolder(note: any, idtipolista: string) {
    let x: any = localStorage.getItem('data_tipo_lista');
    let data: any[] = x ? JSON.parse(x) : [];
    let folder = data.find(item => item.uniquecode === idtipolista);
    if (folder) {
      folder.notas.push(note);
      localStorage.setItem('data_tipo_lista', JSON.stringify(data));
    }
  }
}
