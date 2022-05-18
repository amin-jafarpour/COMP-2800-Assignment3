const express = require('express');
const { read } = require('fs');
const fs = require('fs');
const https = require('https');
const bodyparser = require("body-parser");
const mongoose = require('mongoose');
const app = express()
app.set('view engine', 'ejs');
// app.use(express.static('./public'));
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(bodyparser.json());
const cors = require('cors');
const { findSourceMap } = require('module');
app.use(cors());
//***********************************************************************************************************************/

mongoose.connect("mongodb://localhost:27017/log",
  { useNewUrlParser: true, useUnifiedTopology: true });
const logSchema = new mongoose.Schema({
  id: Number,
  likes: Number,
  dislikes: Number
});

const pokSchema = new mongoose.Schema({
  "id": Number,
  "name": String,
  "weight": Number,
  "height": Number,
  "species": String,
  "type": Array
});

const UserSchema = new mongoose.Schema({
  "username": String,
  "firstname": String,
  "lastname": String,
  "password": String,
  "shoppingcard": Array
});

const poklogsModel = mongoose.model("poklogs", logSchema);
const poksModel = mongoose.model("poks", pokSchema);
const userModel = mongoose.model("user", UserSchema);
//************************************************************************************************************* */


function addUserDB(user){
  userModel.count({ "username": user.username }, function (err, count) {
    if (err) {
      console.log("Error " + err);
    } else if (count == 0) {
      userModel.create({
        "username": user.username,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "password": user.password,
        "shoppingcard": []
      });
    }
    else{
        throw "user already exists";
    }
  });}


  function findUserDB(credentials, next){
   userModel.find({"username": credentials.username, "password": credentials.password}, function(err, data){
     //res.send(JSON.stringify(data))
     next(JSON.stringify(data));
   });
  }


//helper
function addPokemonDB(pokemon){
  poksModel.count({ "id": pokemon.id }, function (err, count) {
    if (err) {
      console.log("Error " + err);
    } else if (count == 0) {
      poksModel.create({
        "id": pokemon.id,
        "name": pokemon.name,
        "weight": pokemon.weight,
        "height": pokemon.height,
        "species": pokemon.species,
        "type": pokemon.type
      });
    }});
}

//helper
function addPokemonLogDB(pokemon){
  poklogsModel.count({ "id": pokemon.id}, function (err, count) {
    if (err) {
      console.log("Error " + err);
    } else if (count == 0) {
      poklogsModel.create({
        "id": pokemon.id,
        likes: 0,
        dislikes: 0
      });
    }});
}



/*********************************************************************************************************** */

// app.get('/signuppage', function(req, res){
//   //res.sendFile('signup-page.html',{ root: __dirname });
//   res.sendFile('./signuppage.html');
// });

// app.get('/loginpage', function(req, res){
//   //res.sendFile('login-page.html',{ root: __dirname });
//   res.sendFile('./loginpage.html');
// });

app.post('/signup', function(req, res){
  const user = {"username": req.body.username, "firstname": req.body.username, "lastname": req.body.username,"password": req.body.username};
  addUserDB(user);

  res.redirect('./loginpage.html');
});

app.post('/login', function(req, res){
  findUserDB({"username": req.body.username, "password": req.body.password}, (data)=>res.send(data));
});












app.get('/log/poklogs', function (req, res) {
  poklogsModel.find({}, { _id: 0, id: 1, likes: 1, dislikes: 1 }, function (err, logs) {
    if (err) {
      console.log("Error " + err);
    } else {
      res.json(logs);
    }

  });
})

app.get('/log/poklogs/:id', function (req, res) {
  poklogsModel.find({ "id": req.params.id }, { _id: 0, id: 1, likes: 1, dislikes: 1 }, function (err, logs) {
    if (err) {
      console.log("Error " + err);
    } else {
      res.json(logs);
    }

  });
})


app.put('/log/insert', function (req, res) {
  poklogsModel.create({
    "id": req.query.id,
    "likes": req.query.likes,
    "dislikes": req.query.dislikes

  }, function (err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      res.send(`inserted ${req.query.id}, ${req.query.likes}, ${req.query.dislikes}`);
    }

  });
})


app.get('/log/like/:id', function (req, res) {
  poklogsModel.updateOne({
    "id": req.params.id
  }, {
    $inc: { "likes": 1 }
  }, function (err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      poklogsModel.find({ 'id': req.params.id }, { _id: 0, id: 1, likes: 1 }, function (err, logs) {
        if (err) {
          console.log("Error " + err);
        } else {
          res.send(logs);
        }

      });
    }
  });
})


app.get('/log/dislike/:id', function (req, res) {
  poklogsModel.updateOne({
    "id": req.params.id
  }, {
    $inc: { "dislikes": 1 }
  }, function (err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      poklogsModel.find({ 'id': req.params.id }, { _id: 0, id: 1, dislikes: 1 }, function (err, logs) {
        if (err) {
          console.log("Error " + err);
        } else {
          res.send(logs);
        }

      });
    }
  });
})


app.get('/log/remove/:id', function (req, res) {
  poklogsModel.remove({
    "id": req.params.id
  }, function (err, data) {
    if (err) {
      console.log("Error " + err);
    } else {

      res.send(`Remove id= ${req.params.id} log record`);
    }

  });
})





app.get('/pok/:id', function (req, res) {
  poksModel.find({ id: req.params.id }, { _id: 0, id: 1, name: 1, weight: 1, height: 1, species: 1, type: 1 }, function (err, poks) {
    if (err) {
      console.log("Error " + err);
    } else {
      res.json(poks[0]);
    }
  });
})


app.get('/profile/:id', function (req, res) {

  poksModel.find({ "id": req.params.id }, { _id: 0, id: 1, name: 1, weight: 1, height: 1, species: 1 }, function (err, properties) {
    if (err) {
      console.log("Error " + err);
    } else {
      res.render("profile.ejs", {
        "id": properties[0].id,
        "name": properties[0].name,
        "weight": properties[0].weight,
        "height": properties[0].height,
        "species": properties[0].species
      });
    }
  });
});






function populateDB(){
  const pokemonText = fs.readFileSync('./pokemon-details.json', 'utf8');
  pokemonObjs = JSON.parse(pokemonText).pokes;
  for(let i = 1; i <= 800; ++i){
    addPokemonDB(pokemonObjs.filter(pok => pok.id == i));
    addPokemonLogDB(pokemonObjs.filter(pok => pok.id == i));
  }
}


app.listen(5000, function (err) {
  if (err)
    console.log(err);
    populateDB();
});





