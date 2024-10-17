export class FolderLists {

    modelFolderNotes: any[] = [];  
    createFolderTypeNotesStorage( name: string, uniquecode: string, estado: number, permisos: any, iduser: number ) {
      let arr: any = {
        nombretipo: name,
        iduser: iduser,
        estado: estado,
        permisos: permisos,
        presupuesto: 0,
        uniquecode: uniquecode
      };
      this.modelFolderNotes.unshift(arr);
    }
  
    guardarDataFolderStorage() {
      let x: any = localStorage.getItem('data_tipo_lista');
      let data: any[] = x ? JSON.parse(x) : [];
      data.push(this.modelFolderNotes);
      localStorage.setItem('data_tipo_lista', JSON.stringify(data));
    }
  
    // Método para cargar datos desde el almacenamiento local
    cargarDataFolderStorage() {
      let x: any = localStorage.getItem('data_tipo_lista');
      this.modelFolderNotes = x ? JSON.parse(x) : [];
    }

}
  