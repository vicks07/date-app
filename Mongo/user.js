const {MongoClient,ObjectId} = require('mongodb');

const connection = '"mongodb://localhost:27017/"';
const crypto = require('crypto');
const secret = 'quillApp';


const Register = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            user.password = GenerateHash(user.password);
            db.collection('users').insertOne(user).then((res)=>{
                resolve(res.result);
            }).catch(err=>{
                reject('Error');
            });
        })
    })
}

const Login = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,
            {
                useNewUrlParser:true,
                useUnifiedTopology: true},
                (err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            user.password = GenerateHash(user.password);
            //console.log(user);
            db.collection('users').findOne({$and:[{email:user.email},{password:user.password}]}).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject('Error');
            })
        })
    })
}

const GetUser = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            db.collection('users').findOne({_id:ObjectId(user.id)}).project({password:0}).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject('Error');
            })
        })
    })
}

const DisplayUsers = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            db.collection('users').find({_id:{$ne:ObjectId(user.id)}}).project({password:0}).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject('Error');
            })
        })
    })
}


const GenerateHash = (plainText)=>{
    return crypto.createHmac('sha256', secret)
                   .update(plainText)
                   .digest('hex');

    //console.log(hash);
}

const BlockUser = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            db.collection('users').updateOne({_id:ObjectId(user.id)},{$addToSet:{blockedList:user.blockId,date:new Date()}}).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject('Error');
            })
        })
    })
}

const CheckExists = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            db.collection('users').findOne({email:user.email}).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject('Error');
            })
        })
    })
}

const CheckBlocked = (user)=>{
        
}

const Like = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            db.collection('users').updateOne({_id:ObjectId(user.id)},{$addToSet:{likedList:user.likedId,date:new Date()}}).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject('Error');
            })
        })
    })
}


const SLike = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            db.collection('users').updateOne({_id:ObjectId(user.id)},{$addToSet:{slikedList:user.slikedId,date:new Date()}}).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject('Error');
            })
        })
    })
}

// (async function(){
//     //let res = await Register({email:'vikram.january@gmail.com',password:'test'});
//     let res = await Login({email:'vikram.january@gmail.com',password:'test'});
//     console.log('res',res);
// })();

module.exports ={
    Login,
    Register,
    CheckExists,
    CheckBlocked,
    Like,
    SLike,
    GetUser
}