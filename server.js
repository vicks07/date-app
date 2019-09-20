var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const jwt = require('jsonwebtoken');
const multer = require('multer');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');


var bodyParser = require('body-parser')
const flash = require('connect-flash');


const user = require('./Mongo/user.js');
const auth = require('./Middleware/auth.js')
const fileUpload = require('./Misc/fileUpload.js');


app.use(expressLayouts);
app.set('view engine','ejs');


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
  
let userHash = {}

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
    console.log(`${socket.id} a user connected`);
    socket.on('userId',function(data){
        console.log('Emitted Data',data);
        userHash[data] = socket.id;
    })

    socket.on('disconnect',function(data){
      console.log('HERE');
    }) 
  });


app.use(flash());

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
      const token = jwt.sign({
        email:userD.email,
        userId:userD._id
      },'secretkey',{
        expiresIn:"1h"
      });
      userD.token = token;
      req.flash('success_msg','Successful Login');
      return res.render('dashboard',{
        name: userD.name
      });
      //return res.status(200).send(userD);
    }
  })
  
app.post('/new',auth,(req,res)=>{
  return res.send('Success Req')
})

app.get('/users/register',(req,res)=>{
  let errors = [];
  res.render('register',{errors});
})

app.post('/users/register',async(req,res)=>{
console.log(req.body);


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
      if(userD._id==undefined){
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

app.post('/like',async(req,res)=>{

})

app.get('/slike',async(req,res)=>{

  io.to(userHash['vikram']).emit('slike',{data:'New Message received'});
  
})

app.get('/user/:id',async(req,res)=>{
  console.log(req.params.id);
  let resp = await user.GetUser({id:req.params.id});
  return res.status(200).send(resp);
});

app.post('/upload/library',multer({ storage:fileUpload.storage('library') }).single('file'),(req,res)=>{
  res.json({file:req.file});
});




