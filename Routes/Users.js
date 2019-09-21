const express = require('express');
const router = express.Router();
const auth = require('../Middleware/auth.js');
const {userHash} = require('../server.js');

//Display the login page
router.get('/login',(req,res)=>{
    let errors = [];
    res.render('login',{
        errors
    });
  })

  //Verify the login and generate a JWT token on successful login
  //Send the unique user id and token info to the client side.
  router.post('/login',async(req,res)=>{
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
    

    //Display the registration page
  router.get('/register',(req,res)=>{
    let errors = [];
    res.render('register',{errors});
  })
  
  //Register users after some basic validations are met.
  //On successful registration, redirect to the login page.
  router.post('/register',async(req,res)=>{
  
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
  

  //Log the LIKE event and then send Socket IO based notification to the user who has been LIKED
  router.post('/like',auth,async(req,res)=>{
      let resp = await user.Like({id:req.body.id,likeId:req.body.likeId});
      io.to(userHash[req.body.likeId]).emit('like',{data:'A user has liked your image'});
  })
  
  //Log the SUPER LIKE event and then send Socket IO based notification to the user who has been SUPER LIKED and also send the user details on SUPER LIKED

  router.post('/slike',auth,async(req,res)=>{
  
    let resp = await user.SLike({id:req.body.id,slikedId:req.body.slikedId});
    let userD = await user.GetUser({id:req.body.id,flag:true});
    io.to(userHash[req.body.slikedId]).emit('slike',{data:'A user has liked your image',user:userD});
    //io.to(req.body.id).emit('slike',{title:'Super Like',body:'A user has liked your image'});
    
  })
  
  router.post('/block',auth,async(req,res)=>{
    let resp = await user.BlockUser({id:req.body.id,blockId:req.body.blockId});
    return res.status(200).send(resp);
  });
  
  router.get('/:id',async(req,res)=>{
    console.log(req.params.id);
    let resp = await user.GetUser({id:req.params.id});
    return res.status(200).send(resp);
  });
  
  router.get('/display/:id',async(req,res)=>{
    let resp = await user.GetUser({id:req.params.id});
    let blockIds =resp[0].blockedList.map(doc=>{
      return doc.blockId
    });
  
    let users = await user.DisplayUsers({id:req.params.id,blockedList:blockIds})
    console.log(users)
  
  
    return res.send(users);
  })
  
  
module.exports = router;
  

//SX90SqkP09KrHRnh