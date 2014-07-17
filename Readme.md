# Meteor Parties Stresstest

This is an example load testing application that may be run against the [Meteor Parties example](https://www.meteor.com/examples/parties). It actually simulates clients and their behavior rather than just the messages exchanged between client and server.

Remember:
**DO NOT RUN THIS AGAINST ANY SERVERS THAT ARE NOT YOURS! ESPECIALLY NOT AGAINST METEOR.COM!**

## Prerequisites

This example expects one running Meteor server. Also there should be at least one `drone` (machine to run the client simulation).

### The application under test

Create the meteor parties example and run it on the server you would like to test:

    $ meteor create --example parties
    
*Hint*: This test will not differentiate between MongoDB and Meteor.

### Required Software

The machines used for testing (client drones) must be [accessible via key](http://sshkeychain.sourceforge.net/mirrors/SSH-with-Keys-HOWTO/SSH-with-Keys-HOWTO-4.html) and not ask for a password when you try to connect via ssh.
Furthermore you must install both [PhantomJS]:http://phantomjs.org/download.html and [CasperJS]:http://docs.casperjs.org/en/latest/installation.html on the drones.

## Usage

1. Clone this repository
2. Set up SSH keys to connect to your drones
3. Add the IP/address of your drones to the `drones` file
4. Add the e-mail addresses to be used for the test in the `accounts file`
5. Run the parties example and make sure the drones can access the URL
6. Start the drones using `$./start.sh -u http://mytesturl:3000 -d /home/meteor -p password`
7. Open your URL and watch the Party Frenzy begin!
8. Use `stop.sh` when the parents are home again.

## Files

This is in the package:

### parties-stress.js

This is the actual user simulation. It tries to register an account with the app. If that fails, it tries to log in instead. If that fails as well, it gives up.
Once authenticated it creates a party somewhere and then RSVPs for a random other party.

You can call this script directly using 

    $ casperjs parties-stress.js --url=http://mytesturl:3000 --email=casper@example.com --password=password

If you do not provide any arguments, default values will be used (most importantly it will run against http://127.0.0.1).    

### drones

Inside the drones file enter the URL or IP for each of your client machines used during testing. Make sure to hit return after each entry!

### accounts

List all the email addresses you wish to use as accounts for your drones. They will use them randomly. Watch out - there is no guarantee that one account is only logged in once at a time!
Also you need to add a newline after the last entry.

In case you want to keep the password private it is not stored inside the accounts file. You will have to provide it on the command line instead.

### The Bash scripts

These help you scale the testing. `start.sh` copies all files to the drones, `immortalCasper.sh` calls the `parties-stress.js` infinitely, and `stop.sh` will kill it from all drones.

#### start.sh 

`start.sh` is used like that:

    $ ./start.sh -u http://mytesturl:3000 -p password -d /home/meteor

Once executed the testing begins and your URL will get hammered with never-ending requests.

#### stop.sh

It doesn't take any arguments, just call it to stop the immortalCasper instances.

#### immortalCasper.sh

This script initiates the casper process. Once finished, it will call it again. And again. And again. And...

    ./immortalCasper.sh -u http://mytesturl:3000 -p password


## Monitoring the Results

Because these scripts will only generate load or stress on your server, you should contemplate how to monitor your servers behavior. One suggestion is to add [Kadira](https://kadira.io/) to your application. Alternatively, if you are running on your own infrastructure, you should use dedicated monitoring software such as [Munin](http://munin-monitoring.org/) to observe your applications behavior.

## Known Issues

* Sometimes a selector for a party throws an error - no idea why.
* Between runs users are not logged out.
* There is no easy way to retrieve the number of currently running clients, you need to keep track manually.
* Running multiple times on the same drone is quirky. Try using a different account for a second instance.

## Meta
Created by [Stephan Hochhaus](mailto:stephan@yauh.de), July 2014.