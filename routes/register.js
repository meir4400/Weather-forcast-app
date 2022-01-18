var express = require('express');
var Cookies = require('cookies')
const db = require('../models'); //contains the Contact model. (if there is index file. dint need to write it)
var router = express.Router();
var keys = ['keyboard cat']

//-------------------------------------------------------------------------------------------
/* GET README page. */
router.get('/readme', function(req, res) {
    res.render('README.ejs');
});

//-------------------------------------------------------------------------------------------
/* GET register page. */
router.get('/', function(req, res) {
    res.render('register.ejs', {message: "hello, please register to site", error: ""});
});

//-------------------------------------------------------------------------------------------
/* GET password page after register page. */
router.post('/password', function(req, res) {

  var cookies = new Cookies(req, res, { keys: keys })//make the cookie

  //Set cookie with 60 seconds expiration to complete registering in this time
  cookies.set('lastVisit', Date.now(),
      { signed: true, maxAge: 60*1000 });

  //check in dataBase if user exist
  db.Contact.findAll({where:{Email: req.body.email}})

      .then( contact => {

          //if contact empty, user not exist so continue to password page (will save user data in session)
          if(contact.length == 0){
            req.session.data = req.body;
            res.render('password', {message: "please enter password to complete register", error: ""});
          }

          //if user exist redirect back to register page
          else{
            res.render('register.ejs', {message: "hello, please register to site", error: "user exist, please log-in."});
          }
          
    }).catch((err) => {

      console.log('error in checking if contact exist', JSON.stringify(err));
      err.message = 'error querying contact. ' + JSON.stringify(err);
      return res.send(err)
    });

});
//-------------------------------------------------------------------------------------------
/* register contact in DB */
router.post('/addContact', function(req, res) {

    //build and get cookie from request
    var cookies = new Cookies(req, res, { keys: keys })
    var lastVisit = cookies.get('lastVisit', { signed: true })

    //if there is no cookie, it means a minute passed, so redirect to register page with error
    if (!lastVisit) {
        res.render('register.ejs', { message: "hello, please register to site.", error: "time out, complete register in a minute."});
    }

    //if not passed a minute, insert contact to data base and continue to login page
    else {

        //get saved data from session
        let firstName = req.session.data.first_name;
        let lastName = req.session.data.last_name;
        let Email = req.session.data.email;
        let pass1 = req.body.pass1;
        let pass2 = req.body.pass2;

        //make sure again passwords are match. if not, redirect back to password page
        if(pass1 != pass2){
            res.render('password', {message: "please enter password to complete register",
                error: "passwords not match, please try again"});
        }
        let Password = pass1;

        //get contact from db and check again if user exist
        db.Contact.findAll({where:{Email: Email}})

        .then((contact)=> {

            //create new contact if not exist
            if (contact.length == 0) {
                db.Contact.create({firstName, lastName, Email, Password});
                res.render('login', {message: "you are registered !! please log-in", error:""});
            }

            //if user exist, send error
            else {
                console.log('user exist already');
                return res.send("contact exist already");
            }

        }).catch( err => {
            console.log('There was an error adding contacts', JSON.stringify(err))
            err.message = 'error in register contact';
            return res.send(err)
        });
    }
});

//----------------------------------------------------------------------------------------
//handle errors
router.post('/readme',(reg, res) => {res.write('connection method wrong try check if post or get')});
router.post('/',(reg, res) => {res.write('connection method wrong try check if post or get')});
router.get('/password',(reg, res) => {res.write('connection method wrong try check if post or get')});
router.get('/addContact',(reg, res) => {res.write('connection method wrong try check if post or get')});

//-------------------------------------------------------------------------------------------
module.exports = router;
