/* global variables */
const openMenuMessage = 'open locations list';

//html elements
let form = null;
let Location = null;
let Latitude = null;
let Longitude = null;
let warning = null;
let locationsMenu = null;
let forecastArea = null;
let weatherPic = null;
let tableArea = null;
let waitGIF = null;

let locationsList = null;   //the current user locations list
let tableLine = ['date', 'weather',	'max temp',	'min temp',	'Wind max'];//the table headers

//--------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", ()=> {

    //assignment global variables
    form = document.getElementById('addLocationForm');
    Location = document.getElementById("location");
    Latitude = document.getElementById("latitude");
    Longitude = document.getElementById("longitude");
    warning = document.getElementById('warning');
    forecastArea = document.getElementById('forecastArea');
    weatherPic = document.getElementById("weatherPic");
    locationsMenu = document.getElementById("locationsMenu");
    tableArea = document.getElementById("tableArea");
    waitGIF = document.getElementById('waitGIF');

    //add listeners
    document.getElementById("addLocationButton").addEventListener("click", addLocation);
    document.getElementById("showWeatherButton").addEventListener("click", showWeather);
    document.getElementById("delButton").addEventListener("click", delLocation);
    document.getElementById('resetButton').addEventListener('click', resetLocations);
    //document.getElementById('logout').addEventListener('click', logout);

    buildPage();
});
//--------------------------------------------------------------------------------------
//fill userPage's locations list
function buildPage() {

    //remove previous data
    resetPage();

    //get user's list from server api
    fetch('./api/buildPage')

    .then(data => {

        //insert in html
        data.json().then(list=>{
            locationsList = list;
            for (let locationsListKey in locationsList) {
                let location = document.createElement('option');
                location.text = locationsList[locationsListKey].name;
                locationsMenu.appendChild(location);
            }
        }).catch(err=>{console.log('error in querying locations', JSON.stringify(err))})

    }).catch((err) => {console.log('error in querying locations', JSON.stringify(err))})
}
//--------------------------------------------------------------------------------------
//add new location to data base when user added
function addLocation() {

    //validate new location fields. add it only if correct
    if( !validate()) {
        return ;
    }

    //send new location to server api
    fetch('./api/addLocation', {
        method: 'post',
        body: JSON.stringify({
            name: Location.value,
            latitude: Latitude.value,
            longitude: Longitude.value,
        }),
        headers: {'Content-type': 'application/json; charset=UTF-8'},

    }).then (response => {

        //redirect if server did it
        if(response.redirected){
            let url = response.url;
            document.location.href = url;
        }
        buildPage();//re-build page after change

    }).catch((err) => {console.log('error in adding location', JSON.stringify(err))});
}
//--------------------------------------------------------------------------------------
//validate the fields are correct and not empty
function validate() {

    //reset previous warnings
    resetWarnings();

    //add warn if location exist in locations list
    for (let locationsListKey in locationsList) {
        if(Location.value === locationsList[locationsListKey].name){
            appendError('location exist');
        }
    }

    //add warn if location field is empty
    if(Location.value === null || Location.value === "") {
        appendError('location field is empty');
    }

    //add warn if latitude field is empty
    if(Latitude.value === null ||  Latitude.value === "" ) {
        appendError('latitude field is empty');
    }

    //add warn if longitude field is empty
    if(Longitude.value === null || Longitude.value === "") {
        appendError('longitude field is empty');
    }

    //add warn if latitude isnt in range of (-90 - 90)
    if(Latitude.value > 90 || Latitude.value < -90){
        appendError('latitude value is out of range (-90  -  90)');
    }

    //add warn if longitude isnt in range of (-180 - 180)
    if(Longitude.value >180 || Longitude.value < -180){
        appendError('longitude value is out of range (-180 - +180)');
    }

    //return false if there is error
    if(warning.hasChildNodes()){
        return false;
    }

    //if came here, the new location is correct
    return true;
}
//--------------------------------------------------------------------------------------
//return selected location index or null if nothing selected
function getSelectedLoc() {

    resetWarnings();

    //set which location selected
    let list = locationsMenu.options;
    let selected = list[list.selectedIndex].value;

    //warn if no location selected
    if (selected === openMenuMessage) {
        appendError('select location');
        return null;
    }

    //return the selected location index
    for (let locationsListKey in locationsList) {
        if (locationsList[locationsListKey].name === selected) {
            return locationsListKey;
        }
    }

    //should no come here
    return null;
}
//--------------------------------------------------------------------------------------
//delete selected location
function delLocation() {

    //do nothing if no location selected
    let selected = getSelectedLoc();
    if(selected === null) {
        return;
    }

    //send to server api the selected location to delete
    fetch('./api/delLocation', {
        method: 'post',
        body: JSON.stringify({location: locationsList[selected].name}),
        headers: {'Content-type': 'application/json; charset=UTF-8'}

    }).then (response => {

        //redirect if server did it
        if(response.redirected){
            let url = response.url;
            document.location.href = url;
        }
        buildPage();//re-build page after change

    }).catch((err) => {console.log('error in deleting location', JSON.stringify(err)) });
}
//--------------------------------------------------------------------------------------
//get the selected location weather from outer api weather site
function showWeather() {

    //do nothing if no location selected
    let selected = getSelectedLoc();
    if(selected === null)
        return;

    const lon = locationsList[selected].longitude;
    const lat = locationsList[selected].latitude;

    //display forecast page area
    forecastArea.style.display = 'block';
    waitGIF.style.display = 'block';

    //get the weather data table from api weather site
    fetch('http://www.7timer.info/bin/api.pl?lon='+lon+'&lat='+lat+'&product=civillight&output=json')

    .then( response =>{

        if(response.status !== 200){console.log('connection error');} //print in error

        //if ok, send data to build table
        response.json().then(data=>{ buildTable(data); }).catch(err => {console.log('error in parsing data');} )

    }).catch(()=>console.log("outer server error in get data"));

    //get the weather data picture from api weather site
    fetch("http://www.7timer.info/bin/astro.php? lon="+lon+"&lat="+lat+"&ac=0&lang=en&unit=metric&output=internal&tzshift=0")

    .then( response =>{

        if(response.status !== 200){console.log('connection error');} //print in error

        //if ok, change the weather picture source to the new one
        response.blob().then(blob=>{
            let url = URL.createObjectURL(blob);
            weatherPic.src = url;

        //leave default picture if error occurred
        }).catch(err => {console.log('error in parsing picture'); weatherPic.src = '/images/default_pic.jpg';} )

    }).catch(err => {console.log('outer server error in get picture'); weatherPic.src = '/images/default_pic.jpg';} )
}
//--------------------------------------------------------------------------------------
//build HTML table from api received data
function buildTable(json){

    //remove previous table from HTML
    tableArea.lastChild.remove();

    //prepare table
    let data = json.dataseries;
    let table = document.createElement("table");
    table.className = "table";
    let thead = document.createElement("thead");
    table.appendChild(thead);
    let tr = document.createElement("tr");
    thead.appendChild(tr);
    for(let i =0; i < tableLine.length; i++) {
        let th = document.createElement("th");
        th.innerHTML = tableLine[i];
        tr.appendChild(th);
    }
    let tbody = document.createElement("tbody");
    table.appendChild(tbody);


    //insert values to table
    for(let i = 0; i<data.length; i++){

        let tr = document.createElement("tr");
        let array = [data[i].date, data[i].weather, data[i].temp2m.max, data[i].temp2m.min, data[i].wind10m_max];

        //design date
        let str = "" + array[0];
        let day = str.slice(6,8);
        let month = str.slice(4,6);
        let year = str.slice(0,4);
        array[0] = day + "/" + month + "/" + year;

        //set null in wind if wind == 1
        if(array[4] === 1)
            array[4] = null;

        for(let j = 0; j<5; j++){
            let td = document.createElement("td");
            td.innerHTML = array[j];
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }

    //insert table to HTML
    tableArea.appendChild(table);

    //hide animation after get response
    waitGIF.style.display = 'none';
}
//--------------------------------------------------------------------------------------
//append error to html page
function appendError(message) {

    let p = document.createElement('p');
    p.innerHTML = message;
    warning.appendChild(p);
    warning.style.display = 'block';
}
//--------------------------------------------------------------------------------------
//reset all warnings
function resetWarnings() {

    warning.innerHTML = '';
    warning.style.display = 'none';
}
//--------------------------------------------------------------------------------------
//reset all page
function resetPage() {

    form.reset();
    resetWarnings();
    locationsMenu.innerHTML = '';

    //add default message after deleting all
    let open = document.createElement('option');
    open.text = openMenuMessage;
    locationsMenu.appendChild(open);
}
//--------------------------------------------------------------------------------------
//delete all user's locations
function resetLocations() {

    //fetch to server to reset
    fetch('./api/reset')

    .then (response => {

        //redirect if server did it
        if(response.redirected){
            let url = response.url;
            document.location.href = url;
        }
        buildPage();//re-build page after change

    }).catch((err) => {console.log('error in deleting location', JSON.stringify(err)) });
}
//--------------------------------------------------------------------------------------
