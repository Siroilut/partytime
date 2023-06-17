const router = require('express').Router();
const bcrypt = require('bcrypt');

const user = require('../models/user');

//middlewares
const verifiedToken = require("../helpers/check-tokens");

//helpers

const getUserbyToken = require("../helpers/get-user-by-token");

// get an user
router.get('/:id', verifiedToken, async(req, res) =>{
    
    const id= req.params.id;

    //verify user
   try{
    const user = await User.findOne({_id: id}, {password: 0});
    
   }catch(err){
        return res.status(400).json({ error: "usuario nao existe" });
   }


});

//uptade an user

router.put("/",verifiedToken, async (req, res) => {

const token = req.header('auth-token');
const user = await getUserbyToken(token);
const userReqId = req.body.id;
const password = req.body.password;
const confirmpassword = req.body.confirmpassword;

const userId = user._id.toString();

//check if user is equal token user id
if(userId!= userReqId){
res.status(401).json({error:"acesso negado!"});
}

// creating user object
const updateData = {
    name: req.body.name,
    email: req.body.email
  };
  // check if password match
  if(password != confirmPassword) {

    res.status(401).json({ error: "As senhas não conferem." });
  
  // change password
  } else if(password == confirmPassword && password != null) {

    // creating password
    const salt = await bcrypt.genSalt(12);
    const reqPassword = req.body.password;

    const passwordHash = await bcrypt.hash(reqPassword, salt);

    req.body.password = passwordHash;

    // updating data
    updateData.password = passwordHash;

  }


});



module.exports = router;