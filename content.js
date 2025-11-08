let observer = null;

function weightedRandomSelection(weights) {
  const ratings = ["Poor", "Average", "Good", "Excellent"];
  const totalWeight = weights.Poor + weights.Average + weights.Good + weights.Excellent;
  
  console.log("Weights:", weights);
  console.log("Total Weight:", totalWeight);
  
  if (totalWeight === 0) {
    console.log("All weights are 0, defaulting to Average");
    return "Average";
  }

  const random = Math.random() * totalWeight;
  let cumulativeWeight = 0;

  for (const rating of ratings) {
    cumulativeWeight += weights[rating];
    if (random < cumulativeWeight) {
      console.log("Selected rating:", rating);
      return rating;
    }
  }

  console.log("Fallback to Average");
  return "Average";
}

function observeFeedbackForm() {
  if (observer) {
    observer.disconnect();
  }

  const targetNode = document.body;

  observer = new MutationObserver((mutationsList, observer) => {
    const feedbackForm = document.getElementById("feedbackForm");

    if (feedbackForm) {
      chrome.storage.sync.get(
        ["fillMode", "fixedRating", "weights"],
        (result) => {
          const fillMode = result.fillMode || "random";
          const fixedRating = result.fixedRating || "Average";
          const weights = result.weights || {
            Poor: 5,
            Average: 30,
            Good: 40,
            Excellent: 25
          };

          console.log("Fill Mode:", fillMode);
          console.log("Fixed Rating:", fixedRating);

          if (fillMode === "fixed") {
            console.log("Using fixed rating:", fixedRating);
            selectOptions(fixedRating, weights, fillMode);
          } else {
            console.log("Using weighted random selection");
            selectOptions(null, weights, fillMode);
          }

          fillTextAreas();
          waitForFeedbackFormToDisappear();
        }
      );
    }
  });

  observer.observe(targetNode, { childList: true, subtree: true });
}

function waitForFeedbackFormToDisappear() {
  const feedbackForm = document.getElementById("feedbackForm");

  if (feedbackForm) {
    const disappearanceObserver = new MutationObserver(
      (mutationsList, disappearanceObserver) => {
        if (!document.getElementById("feedbackForm")) {
          disappearanceObserver.disconnect();
          observeFeedbackForm();
        }
      }
    );

    disappearanceObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

function selectOptions(fixedRating, weights, fillMode) {
  const labels = document.querySelectorAll("label");
  const ratingOptions = ["Poor", "Average", "Good", "Excellent"];
  const processedGroups = new Set();

  labels.forEach((label) => {
    const labelText = label.innerText.trim();
    const radioButton = label.querySelector('input[type="radio"]');

    if (!radioButton) return;

    const radioName = radioButton.name;

    // For rating options, apply weighted random or fixed selection
    if (ratingOptions.includes(labelText)) {
      // Check if we've already processed this radio group
      if (!processedGroups.has(radioName)) {
        processedGroups.add(radioName);

        let selectedRating;
        if (fillMode === "fixed") {
          selectedRating = fixedRating;
        } else {
          // Generate a new random selection for each question
          selectedRating = weightedRandomSelection(weights);
        }

        console.log(`Radio group '${radioName}': Selected '${selectedRating}'`);

        // Find and check the selected rating in this group
        const groupLabels = document.querySelectorAll(`label`);
        groupLabels.forEach((groupLabel) => {
          const groupRadio = groupLabel.querySelector('input[type="radio"]');
          if (groupRadio && groupRadio.name === radioName && groupLabel.innerText.trim() === selectedRating) {
            groupRadio.checked = true;
          }
        });
      }
    } 
    // For other options like "Yes", "Just Right", select them directly
    else if (["Yes", "Just Right"].includes(labelText)) {
      radioButton.checked = true;
      console.log(`Selected '${labelText}' for radio group '${radioName}'`);
    }
  });
}

function fillTextAreas() {
  const textAreas = document.querySelectorAll("textarea");

  textAreas.forEach((textArea) => {
    textArea.value = "NA";
  });
}

chrome.storage.sync.get(["automationEnabled"], function (result) {
  if (result.automationEnabled) {
    observeFeedbackForm();
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "enableAutomation") {
    observeFeedbackForm();
  } else if (request.action === "disableAutomation") {
    if (observer) {
      observer.disconnect();
    }
  }
});
