
//validate register form. returns true if ok and false else
function validateRegister() {

    var form = document.getElementById("form");
    var first_name = document.getElementById("first_name").value;
    var last_name = document.getElementById("last_name").value;
    var email = document.getElementById("email").value;

    form.classList.remove("needs-validation");
    form.classList.add("was-validated");

    if (/[a-zA-Z]+/.test(first_name) &&
        /[a-zA-Z]+/.test(last_name) &&
        /[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,4}/.test(email)){

        return true;
    }

    return false;
}

//=====================================================================
//validate password form. returns true if ok and false else
function validatePassword() {

    var form = document.getElementById("form");
    var pass1 = document.getElementById("pass1").value;
    var pass2 = document.getElementById("pass2").value;

    form.classList.remove("needs-validation");
    form.classList.add("was-validated");

    if (!/.{8}/.test(pass1) || !/.{8}/.test(pass2) || pass1 !== pass2){

        return false;
    }

    return true;
}
//=====================================================================
//validate login form. returns true if ok and false else
function validateLogin() {

    var form = document.getElementById("form");
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    form.classList.remove("needs-validation");
    form.classList.add("was-validated");

    if (!/.+/.test(email) || !/.+/.test(password)){

        return false;
    }

    return true;
}
//=====================================================================
