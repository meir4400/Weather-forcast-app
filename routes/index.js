var express = require('express');
var router = express.Router();

/* GET register page or send to weather site if registered. */
router.get('/', function(req, res, next) {

    //if user logged in, send userPage
    if( req.session.allowed == true ){
        res.render('userPage',{message: 'hello ' + req.session.userName ,error: ''});
    }

    //if not logged in, continue to register page
    res.redirect('/register');

});

//handle errors
router.post('/',(reg, res) => {res.write('connection method wrong try check if post or get')});

module.exports = router;