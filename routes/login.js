var express = require('express');
const db = require('../models'); //contains the Contact model. (if there is index file. dont need to write it)
var router = express.Router();
//var keys = ['keyboard cat']

//---------------------------------------------------------------------------------------
/* GET login page. */
router.get('/', function(req, res, next) {
    res.render('login', {message: "please log-in", error:""});
});

//---------------------------------------------------------------------------------------
/* GET user page after login check. */
router.post('/check', function(req, res, next) {

    //get login data
    let email = req.body.email;
    let password = req.body.password;

    //check in DB if user exist
    db.Contact.findOne({where:{Email: email}})

        .then( response => {

            //if log-in success, continue to userPage page and add user data to session
            if(response != null && response.dataValues.Password == password ){
                //add user data to session
                req.session.userID = email;
                req.session.userName = response.dataValues.firstName;
                req.session.allowed = true;
                res.redirect('/userPage');
            }

            //if login failed, redirect back to login
            else {
                res.render('login', { message: 'please log-in', error: "login failed, please try again"} );
            }

        //catch error if DB connection failed
        }).catch( err => {
        console.log('There was an error querying contacts', JSON.stringify(err));
        err.message = 'There was an error querying contacts';
        return res.send(err);
    })
});
//----------------------------------------------------------------------------------------
//handle errors
router.post('/',(reg, res) => {res.write('connection method wrong try check if post or get')});
router.get('/check',(reg, res) => {res.write('connection method wrong try check if post or get')});

//----------------------------------------------------------------------------------------
module.exports = router;
