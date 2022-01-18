var express = require('express');
var router = express.Router();

//get user page in success login
router.get('/', function(req, res, next) {

    //check session again before access userPage
    if(req.session.allowed){
        res.render('userPage',{message: 'hello ' + req.session.userName ,error: ''});
    }
});

//handle error
router.post('/',(reg, res) => {res.write('connection method wrong try check if post or get')});

module.exports = router;
