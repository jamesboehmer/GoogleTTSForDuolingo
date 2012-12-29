/*
To Luis, Severin, and the Duolingo team: Thank you so much for all your hard work on Duolingo.  It's truly an amazing
and awesome tool, and I'm excited to see it come so far.  As a user of Duolingo myself, I am extraordinarily pleased
with just about everything, save for just a few small things.  One thing I've had a problem with is the TTS engine, and
I've read the same complaint a number of times.  It's very difficult to understand at times, especially French.  I'm
sure you've heard the same feedback, and I imagine you are under constraints to use the TTS engine you have.  That 
said, I built this little extension just to insert Google's TTS on the fly.  If there's an issue with this extension,
or you want to modify it, please let me know.

-Jim 12/28/2012
*/

var storage = chrome.storage.local;

var googleTTSForDuolingoEnabled=true;

storage.get('googleTTSForDuolingoEnabled', function(result){
	console.log(result);
	if(typeof(result.googleTTSForDuolingoEnabled) != 'undefined'){
		googleTTSForDuolingoEnabled=result.googleTTSForDuolingoEnabled;
	}
	setIcon();
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) { 
  	if(!googleTTSForDuolingoEnabled) {
  		console.log('Allowing Duolingo TTS:',details.url);
  		return {};
  	}
  	var pathSegments = details.url.match(/\/tts\/speak\/(.+)\/(.+)\?type/);
  	var googleTTSURL = 'http://translate.google.com/translate_tts?q=' + decodeURIComponent(pathSegments[2]) + '&tl=' + pathSegments[1];
  	console.log('Redirecting', details.url,'to',googleTTSURL);
  	return { redirectUrl: googleTTSURL }; 
  },
  { 
  	urls: ["*://tts.duolingo.com/tts/speak/*"]
  },
  ["blocking"]
);



chrome.webRequest.onBeforeSendHeaders.addListener(
	//Google doesn't like XSS, so exclude the Referer header
  function(details) { 
  	if(!googleTTSForDuolingoEnabled) return {};
	var headers = details.requestHeaders,
      blockingResponse = {};
      var newHeaders = [];
      for( var i = 0, l = headers.length; i < l; ++i ) {
	      if( headers[i].name != 'Referer' ) {
	      	newHeaders.push({'name' : headers[i].name, 'value' : headers[i].value});
	      }
	  }
	blockingResponse.requestHeaders = newHeaders;
    return blockingResponse;
  },
  { 
  	urls: ["*://translate.google.com/*"]
  },
  ["requestHeaders","blocking"]
);

function setIcon(){
	console.log('googleTTSForDuolingoEnabled:', googleTTSForDuolingoEnabled);
	if(googleTTSForDuolingoEnabled){
		chrome.browserAction.setIcon({path:{ 19 : "images/duo-wings-up-19.png", 38 : "images/duo-wings-up-38.png"}});
	}
	else{
		chrome.browserAction.setIcon({path:{ 19 : "images/duo-wings-down-19.png", 38 : "images/duo-wings-down-38.png"}});
	}
}

function updateIcon() {
	googleTTSForDuolingoEnabled=!googleTTSForDuolingoEnabled;
	storage.set({'googleTTSForDuolingoEnabled' : googleTTSForDuolingoEnabled})
	setIcon();  
}

chrome.browserAction.onClicked.addListener(updateIcon);

