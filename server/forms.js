import formidable from 'formidable'
import fs from 'fs'

export function getFile(req,field) {
    return new Promise((resolve, reject) => {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, (err, fields, files) => {
           let file = files[field]
           if (!file) {
               reject(new Error("Missing file field"))
           }
           console.log("Resolving file: ", file.path)
           resolve(file.path);
        })
    })
}
