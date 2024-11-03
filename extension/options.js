document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get("optionEnabled", (data) => {
    document.getElementById("optionCheckbox").checked = data.optionEnabled || false;
  });
});

document.getElementById("saveButton").addEventListener("click", () => {
  const optionEnabled = document.getElementById("optionCheckbox").checked;
  chrome.storage.sync.set({ optionEnabled }, () => {
    alert("Settings saved!");
  });
});

