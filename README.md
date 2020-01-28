# Installation

Open up `chrome://extensions` and select `Load Unpacked Extension`.  Point it to the directory that you downloaded the plugin to.

Modify `content.js`/`createCsv` to produce the desired CSV format.

# Usage

1. Clear your paste buffer:
  ```
  # MacOS
  $ pbcopy < /dev/null
  ```

2. Open all of the entries you care about in tabs on a browser window.

3. For each tab, click on the L and click on the "Append to Clipboard" button.  Or use the Ctrl-I hotkey to do it by hand.

4. Paste that into the bottom of the contacts list

5. There's a small icon that appears over the pasted area - use that to split rows.

6. Go through the rows and do any small cleanups caused by extra comma's, etc.

7. Create a template text in a text editor.

Example:
```
Hi ${facts.first_name} -

I am examining AI-driven video analysis of human action and operations at the Allen Institute for Artificial Intelligence.  I'd love to learn more about your work - do you have time for a quick call next week?

Cheers,
--B 
```

Available keys:
    * `${facts.first_name}`
    * `${facts.last_name}`
    * `${facts.company}`
    * `${facts.company}`
    * `${facts.title}`
    * `${facts.url}`

## Message sending phase

8. Go to the first tab

9. Make sure it's on the list - sometimes entries get missed due to bugs.

10. Copy the template text.

11. Click on the L

12. Select the first text box

13. Paste the sample code in

14. If everything goes well, the context will switch to the second box with the text highlighted.  This will automatically be added to the clipboard.

15. Open up the InMail or Connect or whatever window to send the messsage in.

16. Paste the text in.

17. Verify the first name, if paranoid.

18. Send, close the tab

19. On the next tab, click the "Load Cached Message", and follow the steps from 14-19 until done.  Or use the hotkey Ctrl-U.
