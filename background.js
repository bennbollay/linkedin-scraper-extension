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

chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);

  if (command === "capture-csv") {
    msg("harvest", "");
  } else if (command === "paste-cached-message") {
    msg("cached-message", '');
    msg("paste", '');
  }
});
