var express = require('express');

const db = require('../../models'); //contains the Contact model. (if there is index file. dint need to write it)
var router = express.Router();

//----------------------------------------------------------------------------
/* GET user data from db and send to client (for building page). */
router.get('/buildPage', function(req, res, next) {

    //get the user's locations list from db
    db.Cities.findAll({where: {email: req.session.userID}})

    //send the list to client
    .then( list => { res.send(list); })

    .catch( err => {
        console.log(__filename + '... error in get locations in build page', JSON.stringify(err))
        err.message = 'error in get locations';
        return res.send(err)
    });
});
//----------------------------------------------------------------------------
/* add new location to DB. */
router.post('/addLocation', function(req, res, next) {

    //redirect to login if session expired
    if( req.session.allowed != true ){
        res.status(400);
        return res.redirect('/login');
    }

    //get the new location data from request
    const email = req.session.userID;
    const name = req.body.name;
    const longitude = req.body.longitude;
    const latitude = req.body.latitude;

    //add new location to cities data base
    db.Cities.create({email, name, longitude, latitude})

    //in success only send message and don't redirect
    .then( response => {
        console.log('created location');
        res.send('location added');

    }).catch(err => {
        console.log(__filename + '... error in adding location to DB', JSON.stringify(err))
        err.message = 'error in adding location';
        return res.send(err)
    });
});
//----------------------------------------------------------------------------
/* delete location from DB. */
router.post('/delLocation', function(req, res, next) {

    //redirect to login if session expired
    if( req.session.allowed != true ){
        res.status(400);
        return res.redirect('/login');
    }

    //remove received location from data base
    db.Cities.destroy({where: {email: req.session.userID, name: req.body.location}})

    //in success only send message and don't redirect
    .then( response => {
        console.log('location deleted');
        res.send('location deleted');

    }).catch(err => {
        console.log(__filename + '... error in deleting location from DB', JSON.stringify(err))
        err.message = 'error in deleting location';
        return res.send(err)
    });
});
//----------------------------------------------------------------------------
router.get('/logout',function(req, res, next) {
    //handle user logout
    req.session.allowed = false;
    res.redirect('/login');

})
//----------------------------------------------------------------------------
router.get('/reset',function(req, res, next) {

    //redirect to login if session expired
    if( req.session.allowed != true ){
        res.status(400);
        return res.redirect('/login');
    }

    //destroy all user's locations
    db.Cities.destroy( {where: {email: req.session.userID}} )

    //in success only send message and don't redirect
    .then( response => {
        console.log('all locations deleted');
        res.send('all locations removed');

    }).catch( err => {
        console.log(__filename + '... error in deleting all locations from DB', JSON.stringify(err))
        err.message = 'error in deleting all locations';
        return res.send(err)

    })
});
//----------------------------------------------------------------------------
//errors handling
router.post('/buildPage', (reg, res) => {res.write('connection method wrong try check if post or get')});
router.get('/addLocation', (reg, res) => {res.write('connection method wrong try check if post or get')});
router.get('/delLocation',  (reg, res) => {res.write('connection method wrong try check if post or get')});
router.post('/logout', (reg, res) => {res.write('connection method wrong try check if post or get')});
router.post('/reset', (reg, res) => {res.write('connection method wrong try check if post or get')});

//----------------------------------------------------------------------------
module.exports = router;