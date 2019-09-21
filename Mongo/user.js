const {MongoClient,ObjectId} = require('mongodb');

const connection = process.env.MONGODB_URI || "mongodb://localhost:27017/";
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

//Get User information whose unique id is being passed.
const GetUser = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            let projection = {
                    
            }
            if(user.flag!==undefined){
                projection['password'] = 0;
                projection['blockedList'] = 0;
                projection['likedList'] = 0;
                projection['sLikedList'] = 0;
            }
            else{
                projection['password'] = 0;
            }
            db.collection('users').find({_id:ObjectId(user.id)}).project(projection).toArray().then(result=>{
                resolve(result);
            }).catch(err=>{
                reject('Error');
            })
        })
    })
}

//Displays the users to be displayted to the logged in user
const DisplayUsers = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            db.collection('users').find({$and:[{_id:{$ne:ObjectId(user.id)}},{_id:{$nin:user.blockedList}}]}).project({password:0}).toArray().then(result=>{
                resolve(result);
            }).catch(err=>{
                reject('Error');
            })
        })
    })
}

//Generate Hash value to encrpty plain text password
const GenerateHash = (plainText)=>{
    return crypto.createHmac('sha256', secret)
                   .update(plainText)
                   .digest('hex');

    //console.log(hash);
}

//Method to log blocked users.
const BlockUser = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            db.collection('users').updateOne({_id:ObjectId(user.id)},{$addToSet:{blockedList:{blockId:ObjectId(user.blockId),date:new Date()}}}).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject('Error');
            })
        })
    })
}

//To check if a users is already registered
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

//Method to log Like users.

const Like = (user)=>{
    console.log(user);
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            db.collection('users').updateOne({_id:ObjectId(user.id)},{$addToSet:{likedList:{likeId:ObjectId(user.likedId),date:new Date()}}}).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject('Error');
            })
        })
    })
}

//Method to log Super Liked users.

const SLike = (user)=>{
    return new Promise((resolve,reject)=>{
        MongoClient.connect(connection,{useNewUrlParser:true,useUnifiedTopology: true},(err,client)=>{
            if(err){
                reject('Error');
            }
            let db = client.db('quill');
            db.collection('users').updateOne({_id:ObjectId(user.id)},{$addToSet:{slikedList:{slikeId:ObjectId(user.slikedId),date:new Date()}}}).then(result=>{
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
    BlockUser,
    Like,
    SLike,
    GetUser,
    DisplayUsers
}