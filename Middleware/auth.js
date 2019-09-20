const jwt = require('jsonwebtoken');


module.exports = (req,res,next)=>{
    try{

        const decoded = jwt.verify(req.body.token,'secretkey');
        next();

    }catch(err){
        console.log('err',err);
        return res.status(401).send('Auth Failed');
    }
    
}