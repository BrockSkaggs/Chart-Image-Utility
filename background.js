//References:
//https://medium.com/@ryanfarney/creating-a-chrome-extension-that-will-open-in-a-new-tab-bc06b7eb54aa

chrome.browserAction.onClicked.addListener(function(){
    chrome.tabs.create({'url':"chartHome.html"});
});



