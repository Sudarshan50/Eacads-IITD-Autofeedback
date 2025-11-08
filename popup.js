document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleAutomation");
  const fillModeRadios = document.querySelectorAll('input[name="fillMode"]');
  const fixedRatingSection = document.getElementById("fixedRatingSection");
  const weightsSection = document.getElementById("weightsSection");
  const fixedRatingSelect = document.getElementById("fixedRating");
  const weightInputs = {
    Poor: document.getElementById("weightPoor"),
    Average: document.getElementById("weightAverage"),
    Good: document.getElementById("weightGood"),
    Excellent: document.getElementById("weightExcellent")
  };

  // Function to update button text and color
  const updateButton = (enabled) => {
    toggleButton.textContent = enabled ? "Disable " : "Smash It!";
    toggleButton.style.backgroundColor = enabled ? "red" : "green";
  };

  // Load saved settings
  chrome.storage.sync.get(
    ["automationEnabled", "fillMode", "fixedRating", "weights"],
    (result) => {
      updateButton(result.automationEnabled);

      // Set fill mode
      const fillMode = result.fillMode || "random";
      document.querySelector(`input[value="${fillMode}"]`).checked = true;
      updateSectionVisibility(fillMode);

      // Set fixed rating
      if (result.fixedRating) {
        fixedRatingSelect.value = result.fixedRating;
      } else {
        // Save default if not set
        chrome.storage.sync.set({ fixedRating: "Average" });
      }

      // Set weights
      const defaultWeights = {
        Poor: 25,
        Average: 25,
        Good: 25,
        Excellent: 25
      };
      
      const weights = result.weights || defaultWeights;
      Object.keys(weights).forEach((key) => {
        if (weightInputs[key]) {
          weightInputs[key].value = weights[key];
        }
      });
      
      // Save default weights if not set
      if (!result.weights) {
        chrome.storage.sync.set({ weights: defaultWeights });
      }
    }
  );

  // Function to update section visibility based on fill mode
  function updateSectionVisibility(mode) {
    if (mode === "random") {
      weightsSection.style.display = "block";
      fixedRatingSection.style.display = "none";
    } else {
      weightsSection.style.display = "none";
      fixedRatingSection.style.display = "block";
    }
  }

  // Handle fill mode change
  fillModeRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const mode = e.target.value;
      updateSectionVisibility(mode);
      chrome.storage.sync.set({ fillMode: mode });
    });
  });

  // Handle fixed rating change
  fixedRatingSelect.addEventListener("change", (e) => {
    chrome.storage.sync.set({ fixedRating: e.target.value });
  });

  // Handle weight changes
  Object.keys(weightInputs).forEach((key) => {
    weightInputs[key].addEventListener("change", () => {
      const weights = {
        Poor: parseInt(weightInputs.Poor.value) || 0,
        Average: parseInt(weightInputs.Average.value) || 0,
        Good: parseInt(weightInputs.Good.value) || 0,
        Excellent: parseInt(weightInputs.Excellent.value) || 0
      };
      chrome.storage.sync.set({ weights });
    });
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
