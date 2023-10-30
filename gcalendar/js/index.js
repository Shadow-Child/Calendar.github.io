// Rigister the Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
// Client ID and API key from the Developer Console
var CLIENT_ID = '359352596443-pi2442ns37pmcnl9gctdhbsghblinj0n.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDc3E4dqB-KQo8HlKAhaWWL91wjVR2wxAY';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events";

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    var authorizeButton = document.getElementById('authorize_button');
    var signoutButton = document.getElementById('signout_button');
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    //appendPre(JSON.stringify(error, null, 2));
    console.log(error)
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    var authorizeButton = document.getElementById('authorize_button');
    var signoutButton = document.getElementById('signout_button');
    var addEventForm = document.getElementById('addEventForm');
  if (isSignedIn) {
    authorizeButton.setAttribute('hidden','hiddin');
    signoutButton.removeAttribute('hidden');
    addEventForm.removeAttribute('hidden');
    listCalendar();
  } else {
    document.getElementById('authorize_button').removeAttribute('hidden');
    signoutButton.setAttribute('hidden','hidden');
    addEventForm.setAttribute('hidden','hidden');
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listCalendar(){
    var request = gapi.client.calendar.calendarList.list();
        let localDate = new Date();
        localDate.setHours(localDate.getHours()+1);
        request.execute(function(event) {
          localStorage.listOfItems = JSON.stringify(event.result.items);
          appendPre('Event created: ' + event);
          event.result.items.forEach((element,index) => {
              if((element.accessRole === 'owner') || (element.accessRole === 'writer') ){
                document.getElementById('calendarIndex').innerHTML += `<option value="${index}">${element.summary}</option>`;
              }
          });
        });
        document.getElementById('startDate').value = localDate.toISOString().slice(0,16);
        document.getElementById('endDate').value = localDate.toISOString().slice(0,16);
}
function insertEvent() {
    event.preventDefault();
    let calendarIndex = document.getElementById('calendarIndex').value;
    let summary = document.getElementById('summary').value;
    let startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;
    let okIcon = document.getElementById('ok');
    let listOfItems = JSON.parse(localStorage.listOfItems);
    let calendarId = listOfItems[calendarIndex].id;
    let eventGoogle = {
    'summary': summary,
    //'location': '800 Howard St., San Francisco, CA 94103',
    //'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
    'dateTime': startDate+':01+01:00',
    'timeZone': 'Africa/Tunis'
    },
    'end': {
    'dateTime': endDate+':01+01:00',
    'timeZone': 'Africa/Tunis'
    },
    /*'recurrence': [
        'RRULE:FREQ=DAILY;COUNT=2'
    ],
    'attendees': [
        {'email': 'lpage@example.com'},
        {'email': 'sbrin@example.com'}
    ],*/
    'reminders': {
        'useDefault': false,
        'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10}
        ]
    }
    };

    var request = gapi.client.calendar.events.insert({
    'calendarId': calendarId,
    'resource': eventGoogle
    });

    request.execute(function(event) {
    appendPre('Event created: ' + event);
    okIcon.removeAttribute('hidden');
    setTimeout(()=>{okIcon.setAttribute('hidden','hidden')},2000);
    });
}

