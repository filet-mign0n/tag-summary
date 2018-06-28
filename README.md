# Tag Summary

### Description 
Web app that summarizes HTML tags of websites, see live version here: http://elasti.city
- Users can enter a URL of a page to fetch
- The web app fetches the HTML of the page and displays the source to the user
- A summary of the document is displayed, listing which tags are present in the HTML and
how many of each tag
- Clicking on the name of each tag in the summary will highlight the tags in the source
code view

### Requirements
- Python 3.5.x and above
- Flask 1.0.2 and above 

### Install & Launch
```sh
$ git clone https://github.com/filet-mign0n/tag-summary && \
  pip3 install flask && \
  cd tag-summary && \
  python3 app.py 
```
open http://127.0.0.1:8080 in your browser
