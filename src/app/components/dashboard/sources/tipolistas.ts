export class folderLists {

    modelFolderNotes: any = []

    createFolderTypeNotesStorage(name: string, uniquecode: string, estado: number, permisos: any, iduser: number) {

        let arr: any = {
            nombretipo: name,
            iduser: iduser,
            estado: estado,
            permisos: permisos,
            presupuesto: 0,
            uniquecode: uniquecode
        }

        this.modelFolderNotes.unshift(arr);

    }

    guardarDataFolderStorage(model: any) {

        let x: any = localStorage.getItem('data_tipo_lista')
        if (x != null || x != undefined || x != '') {
            x.push(model);
        }
        else localStorage.setItem('data_tipo_lista', model)

    }

}


