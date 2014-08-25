// Testing the parties example with an automated ghost
var casper = require('casper').create();

// get variables from command line or use defaults as a fallback
if (casper.cli.has("email")) {
    var email = casper.cli.get("email");
}
else {
    var email = 'casper@example.com';
}
if (casper.cli.has("password")) {
    var password = casper.cli.get("password");
}
else {
    var password = 'password';
}
if (casper.cli.has("url")) {
    var url = casper.cli.get("url");
}
else {
    var url = 'http://localhost:3000/';
}

var partyTitles = [
    "Alive and kicking",
    "Accelerate",
    "Beerfest",
    "Breakfast at Tiffany's",
    "Browncoats unite",
    "Burning down the House",
    "BYOB",
    "City Shag",
    "Cloud city",
    "Das Fest",
    "Dude, where's my car?",
    "Exterminate!",
    "Have you met Ted?",
    "House Party",
    "Kelly's Call",
    "Kwanzaa",
    "La Boum",
    "Lollapalooza",
    "Meet the Feebles",
    "No siesta fiesta",
    "Out all night",
    "Party PEOPLE!!!!",
    "Risky Business",
    "Rock Da House",
    "Rockin' the Night Away",
    "Slayerfest '98",
    "Slurms MacKenzie's Frenzy",
    "Stan's previously owned party",
    "The more the merrier",
    "The Party",
    "TurboDiesel",
    "Woo! Party!"
];

var rsvpChoices = ["rsvp_yes", "rsvp_no", "rsvp_maybe"];
var rsvpChoices_weight = [5, 2, 1];
var rsvpChoices_totalWeight = eval(rsvpChoices_weight.join("+"));
var weighedChoices=new Array() //new array to hold "weighted" fruits
var currentChoice=0

while (currentChoice<rsvpChoices.length){ //step through each fruit[] element
for (i=0; i<rsvpChoices_weight[currentChoice]; i++)
    weighedChoices[weighedChoices.length]=rsvpChoices[currentChoice];
    currentChoice++;
}

// setting the options for our run
casper.options.viewportSize = {width: 1280, height: 768};
casper.options.verbose = true;
//casper.options.logLevel = 'debug'; // debug needs you to be verbose, hence the line above!

casper.start(url, function () {
    this.echo('Connected to "' + this.getTitle() + '"');
});

// LOG OUT IF ALREADY LOGGED IN

casper.then(function () {
    casper.echo('First make sure this instance is not logged in already');
    logOut(this);
});

// LOG IN/SIGN UP A USER
casper.then(function () {
    casper.echo('Now I will sign up as a new user');
    signUp(this);
    casper.waitForSelector('#login-dropdown-list > div.login-form.login-password-form > div.message.error-message',
        function then() {    // if we find the selector we got an error
            if (getErrorMsg(this) === "Email already exists.") {
                this.echo("Let's try if I can log in");
                logIn(this);
            }
            else { // for all other errors, e.g. wrong password, we have to stop here
                this.echo('Sorry, I do not know how to authenticate.');
            }
        },
        function () { // this precents us from
            this.echo('No errors encountered. Time for Party!');
        });
});

// CREATE A PARTY
createParty();

// RSVP TO A PARTY - 2 ACTUALLY
rsvpParty();
rsvpParty();

// WAIT AND TAKE A PICTURE
// ONLY WORKS WELL, IF NOT TOO MANY INSTANCES RUN IN PARALLEL
//casper.then(function () {
//    this.wait(1000, function () {
//        this.capture('captures/done', undefined, {
//            format: 'png'
//        });
//    });
//});

casper.then(function () {
    this.echo("I'm done. I quit");
    this.exit();
});

// RUN THE CASPER
casper.run();

// HELPFUL FUNCTIONS
function getErrorMsg(obj) {
    return obj.getHTML('#login-dropdown-list > div.login-form.login-password-form > div.message.error-message');
}

function signUp(obj) {
    obj.echo("Performing sign up for " + email + " (password: " + password + ") at " + url);
    obj.waitForSelector('#login-sign-in-link', function () {
        obj.click('#login-sign-in-link');
        obj.click('#signup-link');
    });
    obj.waitForSelector('.login-form', function () {
        obj.fillSelectors('.login-form', {
            '#login-email': email,
            '#login-password': password
        }, true);
        obj.click('#login-buttons-password');
    });
}

function logIn(obj) {
    obj.echo('Performing Log in');
    if (obj.exists('#login-dropdown-list > a')) {
        obj.click('#login-dropdown-list > a');
    }
    casper.waitForSelector('#login-sign-in-link', function () {
        this.click('#login-sign-in-link');
        this.click('#signup-link');
    });
    casper.waitForSelector('.login-form', function () {
        this.fillSelectors('.login-form', {
            '#login-email': email,
            '#login-password': password
        }, true);
        if (obj.exists('#back-to-login-link')) {
            obj.click('#back-to-login-link');
        }
        this.click('#login-buttons-password');
    });
    obj.waitForSelector('#login-name-link', function () {
        obj.echo('Logged in as ' + obj.getHTML('#login-name-link'));
    });
}

function logOut(obj) {
    obj.echo('Performing Log out');
    if (obj.exists('#login-name-link')) {
        obj.echo('logging out user ' + obj.getHTML('#login-name-link'));
        obj.click('#login-name-link');
        obj.click('#login-buttons-logout');
    } else {
        obj.echo("Nobody was logged in.");
    }
}

function createParty() {
    casper.then(function () {
        this.echo('Start a new party!');
        this.mouse.doubleclick(randomCoordinates()[0], randomCoordinates()[1]);
    });
    casper.waitForSelector('body > div.modal > div.modal-footer > a.btn.btn-primary.save', function () {
        this.echo('Adding a party');
        this.fillSelectors('.modal', {
            'body > div.modal > div.modal-body > input': returnRandomChoice(partyTitles),
            'body > div.modal > div.modal-body > textarea': "This party was brought to you by the power of automated testing and Mr or Ms " + email
        }, true);
        this.click('body > div.modal > div.modal-footer > a.btn.btn-primary.save');
    });
}

function rsvpParty() {
    casper.then(function () {
        // return a random party ID, but never an empty one
        // TODO: There is still an issue with *some* Caspers but only with certain *IDs (reproducable)
        //this.echo(this.getElementsAttribute('circle', 'id').filter(function(e){return e}));
        var partyIdSelector = 'circle#' + returnRandomChoice(this.getElementsAttribute('circle', 'id').filter(function(e){return e}));
        var rsvpSelector = '.' + returnRandomChoice(weighedChoices);
        this.echo('For ' + partyIdSelector + ' I will ' + rsvpSelector)
        casper.waitForSelector(partyIdSelector, function () {
            this.click(partyIdSelector);
        });
        casper.waitForSelector(rsvpSelector, function () {
            this.click(rsvpSelector);
        });
    });
}

function randomCoordinates() {
    // watch out - these may only work with a viewport of 1280x768
    var x = Math.floor(Math.random() * (650 - 155 + 1) + 155);
    var y = Math.floor(Math.random() * (590 - 90 + 1) + 90);
    return [x, y];
}

function returnRandomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}