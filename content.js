let observer = null;

function observeFeedbackForm() {
  if (observer) {
    observer.disconnect();
  }

  const targetNode = document.body;

  observer = new MutationObserver((mutationsList, observer) => {
    const feedbackForm = document.getElementById("feedbackForm");

    if (feedbackForm) {
      selectOptions(["Average", "Yes", "Just Right"]);
      fillTextAreas();
      waitForFeedbackFormToDisappear();
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

function selectOptions(labelsToSelect) {
  const labels = document.querySelectorAll("label");

  labels.forEach((label) => {
    const labelText = label.innerText.trim();

    if (labelsToSelect.includes(labelText)) {
      const radioButton = label.querySelector('input[type="radio"]');
      if (radioButton) {
        radioButton.checked = true;
      }
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
