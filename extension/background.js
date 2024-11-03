chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchContextMenu",
    title: "find roadmap for '%s'",
    contexts: ["selection"] 
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchContextMenu" && info.selectionText) {
    chrome.tabs.create({ url: "http://localhost:5174/roadmaps?q=" + info.selectionText });
  }
});


chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: "http://localhost:5174/" });
});

