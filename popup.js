// Convienence function to convert a setTimeout to a delay.
function later(delay) {
  return new Promise(function(resolve) {
    setTimeout(resolve, delay);
  });
}

// Convienence function to send a message to a remote tab.
msg = function(text, payload, callback=console.log, tab_id=null) {
  if (tab_id) {
    chrome.tabs.sendMessage(tabid, {text: text, payload: payload}, callback);
  } else {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
      var tab = tabs[0];
      var tabid = tab_id || tab.id;
      chrome.tabs.sendMessage(tabid, {text: text, payload: payload}, callback);
    });
  }
}

populate_messages = function(result) {
  msg("log", "Received cached-message result: " + JSON.stringify(result));
  if (result != null) {
    $("#message").val(result.input);
    $("#output").val(result.output);
    $("#output").focus();
    $("#output").select();
    document.execCommand("copy");
  }
}

$(function() {
  msg("log", "initialized");

  $("#cached-message").click(function() {
    msg("cached-message", $("#message").val(), populate_messages);
  });

  // Collect all of the tabs information, put it in the clipboard
  $("#harvest").click(function() {
    var result = [];

    msg("log", "starting harvest");
    msg("harvest", "", console.log);
    window.close();

    /*
    // Failed attempt to iterate over all of the open tabs and perform
    // the harvest action on each one.
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      msg("log", "total tabs: " + tabs.length);
      for (let i = 0; i < tabs.length; i++) {
        let tab_id = tabs[i].id;
        later(500 * i).then(function() {
          msg("log", "" + i + ": harvesting id: " + tab_id);
          chrome.tabs.update(tab_id, {active: true});
          msg("harvest", "", console.log, tab_id);
        });
      }
    });
    */
  });

  // When content is added to the message box, populate it with details from 
  // facts.
  $("#message").keyup(function() {
    msg("log", $("#message").val());
    msg("log", "post");
    msg("message", $("#message").val(), populate_messages);
  });
})
