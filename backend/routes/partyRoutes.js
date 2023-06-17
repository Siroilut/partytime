const router = require('express').Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');

const Party = require('../models/party');
const User = require('../models/user');

//definir file storage
const diskStorage = require('../helpers/file-storage');
const upload = multer ({storage: diskStorage});

//middlewares

const  verifyToken = require('../helpers/check-tokens');
const getUserByToken = require('../helpers/get-user-by-token');

//helpers

getUserbyToken = require ('../helpers/get-user-by-token');

//create new paty
router.post('/', verifyToken, upload.fields([{name:'photos'}]), async (req, res) =>{
   
//req data
const title = req.body.title;
const description = req.body.description
const partyDate = req.body.party_date;

let files = [];

if (req.files){
    files = req.files.photos;
}


//validations
if(title == 'null' || description == 'null' || partyDate == 'null'){
    return res.status(400).json({error: 'preencha pelo menos nome, descrição e data.'})
}
//verify user
const token = req.header('auth-token');

const userByToken = await getUserByToken(token);

const userId = userByToken._id.toString();


try{
    const user = await User.findOne({_id: userId});

//create photos array with parth
let photos = [];
if(files && files.length > 0){
    files.forEach((photo, i) =>{
        photos[i] = photo.path;
    })
}

const party = new Party({
    title: title,
    description: description,   
    partyDate: partyDate,
    photos: photos,
    privacy: req.body.privacy,
    userId: user._id.toString()
});

try{
    const newParty = await party.save();
    res.json({error: null, msg: 'evento criado com sucesso', data: newParty});  

}catch(err){
    return res.status(400).json({error});
}

 }catch(err){
    return res.status(400).json({error: 'acesso negado.'});


}

});

//get all public parties 

router.get('/all', async (req, res) =>{
    try{
        const parties = await Party.find({privacy: false}).sort([['_id', -1]]);
        res.json({error: null, parties: parties });

    }catch(err){
        return res.status(400).json({error});
    }

});

//get all user parties

router.get('/userparties', verifyToken, async (req, res) =>{
    
    try{
        
        const token = req.header('auth-token');
        
        const user = await getUserByToken(token);
        
        const userId = user._id.toString();

        const parties = await Party.find({userId: userId});
        res.json({error: null, parties: parties });

    }catch(error){
        return res.status(400).json({error});
    }
})

//get user party

router.get('/userparty/:id', verifyToken, async (req, res) => {
    
    try{

        const token =   req.header('auth-token');

        const user = await getUserByToken(token);

        const userId = user._id.toString();
        const partyid = req.params.id; 

        const party = await Party.find({_id: partyId, userId: userId}); 

        res.json({error: null, party});

    }catch(error){
        return res.status(400).json({error});
    
    }

});

//get party (public or private)

router.get('/:id', async (req, res) =>{

    // find party
    const id = req.params.id;
  
    const party = await Party.findOne({ _id: id });
  
    if(party === null) {
      res.json({ error: null, msg: "Este evento não existe!" });
    }
  
    // public party
    if(party.privacy === false) {
  
      res.json({ error: null, party: party });
  
    // private party
    } else {
  
      const token = req.header("auth-token");
  
      const user = await getUserByToken(token);
      
      const userId = user._id.toString();
      const partyUserId = party.userId.toString();
  
      // check if user can access event
      if(userId == partyUserId) {
        res.json({ error: null, party: party });
      } else {
        res.status(401).json({ error: "Acesso negado!" });
      }
  
    }  
  
  });



module.exports = router;