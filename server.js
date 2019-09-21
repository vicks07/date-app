var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const jwt = require('jsonwebtoken');
const path = require('path');


const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');


const {MongoClient,ObjectId} = require('mongodb');


var bodyParser = require('body-parser')
const flash = require('connect-flash');


const user = require('./Mongo/user.js');  //Queries related to the Database
const auth = require('./Middleware/auth.js') //JWT Verification

app.use(expressLayouts);
app.set('view engine','ejs');

//app.use(express.static(__dirname+'/views/assets'));
//console.log(path.join(__dirname, "./public"));
app.use(express.static(path.join(__dirname, "views/assets")));


//Body parser

app.use(express.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true//,
  //cookie: { secure: true }
}));

app.get('/', function(req, res){
  res.render('welcome')  
  //res.sendFile(__dirname + '/index.html');
  });
  
let userHash = {} //An object to maintain the socket connection with respect to the Object ID.

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
    console.log(`${socket.id} a user connected`);
    socket.on('userId',function(userId){
        //console.log('Emitted Data',data);
        userHash[userId] = socket.id;
    })

    socket.on('disconnect',function(data){
      console.log('HERE');
    }) 
  });


app.use(flash());

//app.use('/users',require('./Routes/Users.js'));
//app.use('/users',require('./Routes/Users.js'));


//Global vars

app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');

    next();
})
  

app.get('/users/login',(req,res)=>{
  let errors = [];
  res.render('login',{
      errors
  });
})
app.post('/users/login',async(req,res)=>{
    const userD = await user.Login({email:req.body.email,password:req.body.password})
    if(userD._id ==undefined){
      
      //return res.status(401).send('Incorrect entry');
    }
    else{
     // const displayD = await user.DisplayUsers(userD._id);
      const token = jwt.sign({
        email:userD.email,
        userId:userD._id
      },'secretkey',{
        expiresIn:"1h"
      });
      userD.token = token;
      req.flash('success_msg','Successful Login');
      return res.render('dashboard',{
        name: userD.name, //Logged in user name
        token:token, //Jwt Token
        id:userD._id, //Logged in user unique id
      });
      //return res.status(200).send(userD);
    }
  })
  
app.get('/users/register',(req,res)=>{
  let errors = [];
  res.render('register',{errors});
})

app.post('/users/register',async(req,res)=>{

const {name,email,password,password2} = req.body;
    let errors = [];

    //Check required fields
    if(!name || !email || !password || !password2){
        errors.push({msg:'Please fill all fields'});
    }

    if(password !== password2){
        errors.push({msg:'Passwords do not match'});
    }

    //Check pass length
    if(password.length <6){
        errors.push({msg:'Passwords should be at least 6 characters'});
    }

    if(errors.length > 0){
        return res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        })
    }
    else{
      let userD = await user.CheckExists({email:email});
      // console.log('userD',userD);
      if(userD == null){
        let resp = await user.Register({name:name,email:email, password:password});
        req.flash('success_msg','You are now registered');
        return res.redirect('/users/login');
        //return res.status(200).send(resp);
       }
       else{
        errors.push({msg:'User Exists'});
        return res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        })
       }
      //return res.status(200).send('User Exists');
    }
})

app.post('/like',auth,async(req,res)=>{
    let resp = await user.Like({id:req.body.id,likeId:req.body.likeId});
    io.to(userHash[req.body.likeId]).emit('like',{data:'A user has liked your image'});
})

app.post('/slike',auth,async(req,res)=>{

  let resp = await user.SLike({id:req.body.id,slikedId:req.body.slikedId});
  let userD = await user.GetUser({id:req.body.id,flag:true});
  io.to(userHash[req.body.slikedId]).emit('slike',{data:'A user has liked your image',user:userD});
  //io.to(req.body.id).emit('slike',{title:'Super Like',body:'A user has liked your image'});
  
})

app.post('/block',auth,async(req,res)=>{
  let resp = await user.BlockUser({id:req.body.id,blockId:req.body.blockId});
  return res.status(200).send(resp);
});

app.get('/user/:id',async(req,res)=>{
  console.log(req.params.id);
  let resp = await user.GetUser({id:req.params.id});
  return res.status(200).send(resp);
});

app.get('/user/display/:id',async(req,res)=>{
  let resp = await user.GetUser({id:req.params.id});
  let blockIds =resp[0].blockedList.map(doc=>{
    return doc.blockId
  });

  let users = await user.DisplayUsers({id:req.params.id,blockedList:blockIds})
  console.log(users)


  return res.send(users);
})


// module.exports ={
//   userHash
// }
