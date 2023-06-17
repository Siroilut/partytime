const jwt = require('jsonwebtoken')


//middleware to validate token

const checkToken = (req, res, next) =>{

    const token = req.header("auth-token");
    if(!token){
        return res.status(401).json({error:"acesso negado!"});
    
    }

    try{
        const verified = jwt.verify(token,"nossosecret");
        req.user = verified
        next(); //continua
    

    }catch(err){
        res.status(400).json({error:"o token é invalido"});

    }
}

module.exports = checkToken;
