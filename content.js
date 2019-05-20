console.log("Content.js load");

// Convienence function to convert "" strings to `` strings.
String.prototype.interpolate = function(params) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
}

// Convienence function to convert a setTimeout to a delay.
function later(delay) {
  return new Promise(function(resolve) {
    setTimeout(resolve, delay);
  });
}

setClipboard = function (mime, content) {
  // Delay long enough for the popup to close before attempting to read
  // the clipboard.
  later(300).then(async () => {
    var copy = function (e) {
      e.preventDefault();
      e.clipboardData.setData(mime, content);
    }
    window.addEventListener("copy", copy);
    document.execCommand("copy");
    window.removeEventListener("copy", copy);
  });
}


// Append the specified content to the clipboard.
appendToClipboard = function (mime, content) {
  // Delay long enough for the popup to close before attempting to read
  // the clipboard.
  later(300).then(async () => {
    const oldClip = await navigator.clipboard.readText();
    var copy = function (e) {
      e.preventDefault();
      e.clipboardData.setData(mime, oldClip + content + '\n');
    }
    window.addEventListener("copy", copy);
    document.execCommand("copy");
    window.removeEventListener("copy", copy);
  });
}

// Extract a bunch of details from the DOM of this page.
function getFacts(doc) {
  console.log("BaseURI: " + document.baseURI);

  var pageURL = document.baseURI;
  try {
    var personName = document.querySelectorAll(".pv-top-card-section__name")[0].innerText.trim();
  } catch (err) {
    alert('Failed to acquire name: ' + err);
    return null;
  }

  try {
    var firstTitle = document.querySelectorAll(".pv-entity__summary-info--background-section > h3")[0].innerText.trim();
  } catch (err) {
    alert('Failed to acquire title: ' + err);
    return null;
  }

  try {
    var firstCompany = document.querySelectorAll(".pv-entity__summary-info--background-section")[0].querySelector('.pv-entity__secondary-title').innerText.trim();
  } catch (err) {
    console.log('First try failed, trying again; message: ', err);
    try {
      // Variation: https://www.linkedin.com/in/mike-tenzin-85664382/
      var firstCompany = document.querySelectorAll(".pv-entity__position-group-pager")[0].querySelector('.pv-entity__company-summary-info > h3').innerText.split('\n')[1];
    } catch (err) {
      alert('Failed to acquire current company: ' + err);
      return null;
    }
  }

  // Sometimes the title comes out with a prefix of 'Title\n'.
  if (firstTitle.split("\n").length > 1) {
    firstTitle = firstTitle.split("\n")[1];
  }
  var name = personName.split(" ");

  return {
    "first_name": name[0],
    "last_name": name[1],
    "company": firstCompany,
    "title": firstTitle,
    "url": pageURL
  }
}

// Convert the facts into a csv spaced out according to our needs.
createCsv = function (firstName, lastName, company, title, url) {
  return [lastName, firstName, "", "", "", "", "", "", "", company, title, url].join("^");
}

// Force the page to load the current job information.
loadPage = function() {
  console.log("Attempting to load page");

  window.scrollTo(0, 600);
  var waitForLoad = later(200);

  return waitForLoad;
}

handle_message = function(facts, msg, sender, sendResponse) {
  var payload = msg.payload;

  console.log("Parsing message with facts:", payload);
  console.log(facts);

  var newstr = payload.interpolate({facts: facts});

  chrome.storage.local.set({message: payload}, function() {
    console.log('Value is set to ' + payload);
  });

  setClipboard("text/plain", newstr);
  sendResponse({input: payload, output: newstr});
}

// Do what's necessary for each message.
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // It's blisteringly difficult to get any kind of logging
  // messages out of a popup extension.
  if (msg.text === "log") {
    console.log("log: " + msg.payload);
    sendResponse("ok");
    return true;
  }

  // Pretty much everything else needs the page to be loaded.
  loadPage().then(function() {
    console.log("Page loaded");
    window.scrollTo(0, 0);

    var facts = getFacts(document);

    if (facts == null) {
      sendResponse("failed");
      return false;
    }

    if (msg.text === "harvest") {
      var csv = createCsv(facts.first_name, facts.last_name, facts.company, facts.title, facts.url);

      console.log(csv);
      appendToClipboard("text/plain", csv);
      sendResponse("ok");
    }

    if (msg.text === "cached-message") {
      console.log("Checking to see if there's a cached payload");

      chrome.storage.local.get(['message'], function(result) {
        console.log('Value currently is ' + result.message);
        if (typeof result.message !== 'undefined') {
          console.log("Treating this as a 'message' event");
          msg.text = "message";
          msg.payload = result.message;
          handle_message(facts, msg, sender, sendResponse);
        } else {
          console.log("Not set.");
          sendResponse(null);
        }
      });
    }

    if (msg.text === "message") {
      handle_message(facts, msg, sender, sendResponse);
    }
    if (msg.text === "paste") {
      document.execCommand("paste");
      sendResponse(null);
    }
  });

  return true;
});

