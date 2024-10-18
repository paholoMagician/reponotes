import { FolderLists } from "./tipolistas";

export class Lista {
    modelNotes: any[] = [];

    createNotesStorage(name: string, uniquecode: string, idtipolista: any, estado: number, permisos: any, iduser: number) {
        let arr: any = {
            cantidad: 0,
            nombreproducto: name,
            valor: 0,
            iduser: iduser,
            idlistatipo: idtipolista,
            estado: estado,
            urlimagen: '',
            permiso: 1,
            uniquecode: uniquecode,
            icon: 'docs'
        };
        this.modelNotes.unshift(arr);
    }

    guardarDataNotesStorage(folderService: FolderLists) {
        this.modelNotes.forEach(note => {
            // Añadir nota a la carpeta correspondiente
            folderService.addNoteToFolder(note, note.idlistatipo);
        });
        // Limpia el array modelNotes después de guardarlo
        this.modelNotes = [];
    }

    // Método para cargar datos desde el almacenamiento local
    cargarDataNotesStorage() {
        let x: any = localStorage.getItem('data_notes');
        this.modelNotes = x ? JSON.parse(x) : [];
    }
}
