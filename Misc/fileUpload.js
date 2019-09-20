
const GridFsStorage = require('multer-gridfs-storage');
const {MongoClient} = require('mongodb');

const connection = '"mongodb://localhost:27017/"';

const promise = MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true})
                    .then(client => {
                        client.db(config.development.uploadDbName)
                    });

const storage = (bucketName)=>{

    return new GridFsStorage({
        db: promise,
        file: (req, file) => {        
          return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
              if (err) {
                return reject(err);
              }
              const filename = buf.toString('hex') + path.extname(file.originalname);
              const fileInfo = {
                filename: filename,
                bucketName: bucketName//'tutorial'
              };
              resolve(fileInfo);
            });
          });
        }
      });
  }

  module.exports = {
      storage
  }