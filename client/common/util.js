export default {
    getRandomInt: function(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min; 
    },
    postBlob: async function(blob, path, field) {
        return new Promise((resolve, reject) => {
            let formData = new FormData();
            blob.name = field;
            formData.append(field, blob, field);
            let xhr = new XMLHttpRequest();
            xhr.open('post',path, true);
            xhr.upload.onprogress = (e) => {
                console.log("Uploading..");
            }
            xhr.onerror = (err) => { 
                reject(err);
            };
            xhr.onload = (e) => {
                if (e.target.status != 200) {
                    try {
                        let err = JSON.parse(e.target.responseText);
                        reject(err);
                    }
                    catch {
                        reject({message: e.target.statusText});
                    }
                } else {
                    resolve(JSON.parse(e.target.responseText));
                }
            };
            xhr.send(formData);
        });
    }
}
