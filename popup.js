document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleAutomation");

  // Function to update button text and color
  const updateButton = (enabled) => {
    toggleButton.textContent = enabled ? "Disable " : "Smash It!";
    toggleButton.style.backgroundColor = enabled ? "red" : "green";
  };

  // Check the current automation state from storage and set the button text and color
  chrome.storage.sync.get("automationEnabled", (result) => {
    updateButton(result.automationEnabled);
  });

  // Toggle automation on button click
  toggleButton.addEventListener("click", () => {
    chrome.storage.sync.get("automationEnabled", (result) => {
      const newState = !result.automationEnabled;
      chrome.storage.sync.set({ automationEnabled: newState }, () => {
        updateButton(newState);
        chrome.runtime.sendMessage({
          action: newState ? "enableAutomation" : "disableAutomation",
        });
      });
    });
  });
});
