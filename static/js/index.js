// save previously fetched URL globally to avoid redundant API requests
var prevURL;
// make source HTML global for reuse in tag highlighting
var escapedHTML;

function displayHTML(htmlString) {
  // escape these characters to display correctly inside <pre> tag
  escapedHTML = htmlString.replace(/&/g, "&amp")
                  .replace(/</g, "&lt")
                  .replace(/>/g, "&gt")
                  .trim();

  document.getElementById("src-html").innerHTML = escapedHTML;
}

/**
 * This method leverages the <Element.innerHTML> property, you pass it a DOMString
 * containing the HTML serialization. Setting the value of innerHTML constructs all
 * of the element's descendants into nodes, constructed by parsing the HTML string.
 * The advantage with this is that we can have an accurate parsing of HTML tags on
 * the client side and simply call the <Element.getElementsByTagName> method with
 * the paramater value "*", which returns and Array of all the elements in the
 * constructed document.
 */
function parseHTML(htmlString) {
  var elmt;
  var tagMap;
  var parsedElmts;
  var parsedTagNames;

  elmt = document.createElement("html");
  elmt.innerHTML = htmlString;
  // get all tag elements into an Array
  parsedElmts = elmt.getElementsByTagName("*");
  parsedTagNames = Object.values(parsedElmts)
                    .map(function(i) { return i.tagName; });
  tagMap = countTags(parsedTagNames);

  return tagMap;
}

/**
 * Convert Array of Tag element names into an Object with
 * properties as tag name and values as tag count
 */
function countTags(tags) {
  var tagMap;
  var tagsLength;

  tagMap = {};
  tagsLength = tags.length;

  for (var i=0; i < tagsLength; i++) {
    var tag = tags[i];
    tagMap[tag] = (tagMap[tag] || 0) + 1;
  }

  return tagMap;
}

function displayTagSummary(tagMap) {
  var summaryElmt;
  var sortable = [];

  for (var k in tagMap) {
    if (tagMap.hasOwnProperty(k)) {
      sortable.push([k, tagMap[k]]);
    }
  }
  // sort tags by count descending
  sortable.sort(function(a, b) {
    return b[1] - a[1];
  });
  // remove previous summary if any
  summaryElmt = document.getElementById("tags-ct");
  while (summaryElmt.firstChild) {
    summaryElmt.removeChild(summaryElmt.firstChild);
  }
  // build and add new summary to the DOM
  summaryElmt.appendChild(buildTagListElmt(sortable));
}

function buildTagListElmt(tags) {
  var tagList;
  var tagsLen;

  tagList = document.createElement("div");
  tagsLen = tags.length;

  for (var i=0; i<tagsLen; i++) {
    var tagBtn = document.createElement("button");
    tagBtn.setAttribute("class", "tag-item");
    tagBtn.setAttribute("id", tags[i][0]);
    tagBtn.innerText = tags[i].join(":");
    tagBtn.onclick = highlightTag;
    tagList.appendChild(tagBtn);
  }

  return tagList;
}

function highlightTag(e) {
  var caller;
  var tagStr;
  var highlightedHTML;

  caller = e.target || e.srcElement;
  tagStr = caller.id;

  highlightedHTML = escapedHTML
    .replace(new RegExp("(&lt"+tagStr+")(?=\\s|&gt)", "ig"),   // opening tag
      '&lt<span style="background-color: #f900ff">'+tagStr+'</span>')
    .replace(new RegExp("(&lt\/"+tagStr+")(?=\\s|&gt)", "ig"), // closing tag
      '&lt<span style="background-color: #f900ff">/'+tagStr+'</span>');

  document.getElementById("src-html").innerHTML = highlightedHTML;
}

window.addEventListener("load", function () {
  function sendURL() {
    var url;
    var xhr;
    var form;

    url = document.getElementById("url-field").value;
    if (!url) {
      alert("please enter a URL");
      return;
    }
    // basic URL protocol validation
    url = /^((http|https):\/\/)/.test(url) ? url : "http://" + url;
    if (url === prevURL) return;
    prevURL = url;

    xhr = new XMLHttpRequest();
    xhr.open("POST", "api");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function() {
      if (xhr.status === 200) {
        var resp = JSON.parse(xhr.responseText);
        if (!resp.error) {
          displayHTML(resp.html);
          displayTagSummary(parseHTML(resp.html));
        } else {
          alert("API response contains error: " + resp.error);
        }
      } else if (xhr.status !== 200) {
        alert("XMLHttpRequest failed. Returned status of " + xhr.status);
      }
    };
    xhr.send(JSON.stringify({ url: url }));
  }

  form = document.getElementById("url-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendURL();
  });
});

