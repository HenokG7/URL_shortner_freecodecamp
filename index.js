require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser= require("body-parser");
const mongoose=require('mongoose');
const randomize = require("randomatic");
const {URL}=require("url");
const dns =require("dns")
const { doesNotMatch } = require('assert');
// Basic Configuration
async function  urlchecker(url){
  console.log("it working")
  try {
    console.log("it working")
    let localurl=  await new URL(url) 
    if(localurl.pathname!== "/"||localurl.search!==""){
      console.log("here it is")
      return false
    }
    await dns.lookup(localurl.hostname,(err)=>{
      if(!err){ //one checks for if there are any routes other than root and the other checks for querys attached to it
        console.log("correct")
          return true
        
      }
    })
  }
  catch(err){
    console.log("Invalid url")
    console.log(err)
    return false
  }
}
const port = process.env.PORT || 3000;
try {
  console.log("waiting")
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}
catch(e){
  console.log(e)
}
let urlSchemea= mongoose.Schema({
  original_url: {
    type: String,
    required:true
  },
  short_url:{
    type: Number,
    required:true
  }
})
let dbURL= mongoose.model("Shorten_url",urlSchemea);
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.post('/api/shorturl',async (req,res)=>{
  let url=req.body.url
 try{
  let checker = await urlchecker(url)
 console.log(checker)
 if(checker){
  
  let num= randomize('0',5);
  console.log(typeof num)
  let shorturl= new dbURL ({
   original_url:req.body.url,
   short_url:parseInt(num)
  })
  shorturl.save().catch(err=>{
   console.log(err)
  })
  res.json({ original_url:req.body.url,
   short_url:parseInt(num)})
 }
 else{
   res.json({ error: 'invalid url' })
 }}
  catch(e){
    console.log(e)
  }
  })
  app.get('/api/shorturl/:shorten',async(req,res)=>{
    console.log(typeof req.params.shorten)
    let shortedurl={short_url:parseInt(req.params.shorten)}
    dbURL.findOne(shortedurl).then(doc=>{
      console.log(doc.original_url)
      res.redirect(`${doc.original_url}`)
    }).catch(error=>{
      console.log(error)
    })
  }
  )
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
