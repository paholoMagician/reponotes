export class FolderLists {

  // Esta es la lista principal de carpetas
  folders: any[] = [];

  constructor() {
    // Cargar carpetas desde localStorage cuando se inicializa la clase
    const storedData = localStorage.getItem('data_tipo_lista');
    if (storedData) {
      this.folders = JSON.parse(storedData);
    }
  }

  modelFolderNotes: any[] = [];

  // Crear y almacenar un nuevo tipo de carpeta
  createFolderTypeNotesStorage(name: string, email: string, uniquecode: string, estado: number, permisos: any, iduser: number) {
    let arr: any = {
      nombretipo: name,
      iduser: iduser,
      estado: estado,
      permisos: permisos,
      email: email,
      presupuesto: 0,
      fecrea: new Date(),
      uniquecode: uniquecode,
      icon: 'folder',
      notas: [] // Agregar el array de notas aquí
    };
    this.modelFolderNotes.unshift(arr);
  }

  // Método para eliminar un folder por su código único (usando uniquecode para consistencia)
  deleteFolderByCodec(uniquecode: string): boolean {
    const folderIndex = this.folders.findIndex(folder => folder.uniquecode === uniquecode);
    if (folderIndex !== -1) {
      this.folders.splice(folderIndex, 1); // Elimina el folder de la lista
      this.saveFolders(); // Guarda los cambios
      return true; // Retorna true si la eliminación fue exitosa
    }
    return false; // Retorna false si no se encontró el folder
  }

  // Método para guardar la lista actualizada en el almacenamiento local
  private saveFolders() {
    localStorage.setItem('data_tipo_lista', JSON.stringify(this.folders));
  }

  // Guardar datos de carpetas en el almacenamiento local
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
    // Limpiar el array modelFolderNotes después de guardarlo
    this.modelFolderNotes = [];

    // Sincronizar las carpetas
    this.folders = data;
  }

  // Cargar datos de carpetas desde el almacenamiento local
  cargarDataFolderStorage() {
    let x: any = localStorage.getItem('data_tipo_lista');
    this.folders = x ? JSON.parse(x) : [];
    this.modelFolderNotes = this.folders; // Sincronizar las carpetas
  }

  // Añadir una nota a una carpeta específica
  addNoteToFolder(note: any, uniquecode: string) {
    let x: any = localStorage.getItem('data_tipo_lista');
    let data: any[] = x ? JSON.parse(x) : [];
    let folder = data.find(item => item.uniquecode === uniquecode);

    if (folder) {
      folder.notas.push(note);
      localStorage.setItem('data_tipo_lista', JSON.stringify(data));
    }
  }

  // Función para actualizar el nombre de una carpeta específica por su uniquecode
  updateFolderName(uniquecode: string, newName: string) {
    let x: any = localStorage.getItem('data_tipo_lista');
    let data: any[] = x ? JSON.parse(x) : [];

    // Buscar la carpeta con el uniquecode proporcionado
    let folder = data.find(item => item.uniquecode === uniquecode);

    if (folder) {
      // Actualizar el nombre
      folder.nombretipo = newName;
      // Guardar el cambio en localStorage 
      localStorage.setItem('data_tipo_lista', JSON.stringify(data));
    } else {
      // console.log('Carpeta no encontrada.');
    }
  }

}
