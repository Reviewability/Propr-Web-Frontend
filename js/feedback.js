/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */

function gotoUrl(url) {
    window.location.assign(url);
}

function getPullReqInfo(url, callback, errorCallback) {
    var endpoint = 'https://api.github.com/repos/' + url.substring(19).replace("/pull/", "/pulls/");
    var x = new XMLHttpRequest();
    x.open('GET', endpoint);
    x.responseType = 'json';
    x.onload = function() {
        var response = x.response;
        if (!response || response.message == "Not Found") {
            errorCallback('No response from GitHub API!');
            return;
        }
        callback(response);
    };
    x.onerror = function() {
        errorCallback('Network error!');
    };
    x.send();
}

function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable){ return pair[1]; }
    }
    return(false);
}

function renderStatus(statusText) {
    document.getElementById('pr-url').textContent = statusText;
}

function sendToDB(star_count, star_count_nodis, necessity, pr_id, repo_id, pr_num, url, return_url, is_private_repo, instid) {
    var positive_text = document.getElementById('positive-text').value;
    var negative_text = document.getElementById('negative-text').value;
    var review_time = document.getElementById('review-time').value;
    var file_option = !document.getElementById('file-option').checked;
    // Send form DATA as POST request to server
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://dutiap.st.ewi.tudelft.nl:60002/webhook", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        "action": "submit",
        "pr_id": pr_id,
        "pr_num":  pr_num,
        "repo_id": repo_id,
        "full_repo_name": url,
        "positive_comments": positive_text,
        "negative_comments": negative_text,
        "rating": star_count,
        "rating_before_discussion": star_count_nodis,
        "necessity": necessity,
        "review_time": review_time,
        "inst_id": instid,
        "is_private_repo": is_private_repo,
        "code_privacy": file_option
    }));
    setTimeout(function() {window.location = return_url;}, 10);
    // window.location = return_url;
}

function isPositiveInteger(str) {
    var n = Math.floor(Number(str));
    return String(n) === str && n >= 0;
}

function buttonAnimation() {
    document.getElementById("submit-icon").classList.toggle('fa-paper-plane');
    document.getElementById("submit-icon").classList.toggle('fa-check');
    document.getElementById("submit-button").style.background="#4d85d1";
    document.getElementById("submit-button").textContent="Thank you!";
}

document.addEventListener('DOMContentLoaded', function() {
    // This is the shortened URL of the repository
    var url = decodeURIComponent(getQueryVariable("url"));
    // This is the url to redirect the user to when the form is filled
    var return_url = decodeURIComponent(getQueryVariable("returnurl"));
    var pr_id = getQueryVariable("prid");
    var repo_id = getQueryVariable("repoid");
    var pr_num = getQueryVariable("prnum");
    var is_private_repo = getQueryVariable("private");
    var installation_id = getQueryVariable("instid");
    if(is_private_repo == "True") {
        document.getElementById('file-option').style.visibility = "visible";
        document.getElementById('file-option-label').style.visibility = "visible";
        document.getElementById('variable-break').style.lineHeight = "450%";
        is_private_repo = true;
    }
    else {
        is_private_repo = false;
    }

    if (url == null || pr_id == null || repo_id == null || return_url == null || pr_num == null) {
        renderStatus('ERROR: Invalid reference to Github Pull Request!');
    }

    else {
        document.getElementById('pr-url').textContent = url;
        var star_count;
        $('[name*="rating1"]').change(function () {
            var me = $(this);
            star_count = me.attr('value');
        });
        var star_count_nodis;
        $('[name*="rating2"]').change(function () {
            var me = $(this);
            star_count_nodis = me.attr('value');
        });
        var necessity;
        $('[name*="rating2"]').change(function () {
            var me = $(this);
            necessity = me.attr('value');
        });
        document.getElementById('submit-button').addEventListener('click', function () {
            buttonAnimation();
            sendToDB(star_count, star_count_nodis, necessity, pr_id, repo_id, pr_num, url, return_url, is_private_repo, installation_id);
        });
    }
}, {once: true});
