import { commands, window, workspace, env, ConfigurationTarget, Uri } from "vscode";
import { agent } from "./agent";

function showInformationWhenInitializing() {
  window.showInformationMessage("safecoder is initializing.", "Settings").then((selection) => {
    switch (selection) {
      case "Settings":
        commands.executeCommand("safecoder.openSettings");
        break;
    }
  });
}

function showInformationWhenAutomaticTrigger() {
  window
    .showInformationMessage(
      "safecoder automatic code completion is enabled. Switch to manual trigger mode?",
      "Manual Mode",
      "Settings",
    )
    .then((selection) => {
      switch (selection) {
        case "Manual Mode":
          commands.executeCommand("safecoder.toggleInlineCompletionTriggerMode", "manual");
          break;
        case "Settings":
          commands.executeCommand("safecoder.openSettings");
          break;
      }
    });
}

function showInformationWhenManualTrigger() {
  window
    .showInformationMessage(
      "safecoder is standing by. Trigger code completion manually?",
      "Trigger",
      "Automatic Mode",
      "Settings",
    )
    .then((selection) => {
      switch (selection) {
        case "Trigger":
          commands.executeCommand("editor.action.inlineSuggest.trigger");
          break;
        case "Automatic Mode":
          commands.executeCommand("safecoder.toggleInlineCompletionTriggerMode", "automatic");
          break;
        case "Settings":
          commands.executeCommand("safecoder.openSettings");
          break;
      }
    });
}

function showInformationWhenManualTriggerLoading() {
  window.showInformationMessage("safecoder is generating code completions.", "Settings").then((selection) => {
    switch (selection) {
      case "Settings":
        commands.executeCommand("safecoder.openSettings");
        break;
    }
  });
}

function showInformationWhenInlineSuggestDisabled() {
  window
    .showWarningMessage(
      "safecoder's suggestion is not showing because inline suggestion is disabled. Please enable it first.",
      "Enable",
      "Settings",
    )
    .then((selection) => {
      switch (selection) {
        case "Enable":
          const configuration = workspace.getConfiguration("editor");
          console.debug(`Set editor.inlineSuggest.enabled: true.`);
          configuration.update("inlineSuggest.enabled", true, ConfigurationTarget.Global, false);
          break;
        case "Settings":
          commands.executeCommand("workbench.action.openSettings", "@id:editor.inlineSuggest.enabled");
          break;
      }
    });
}

function showInformationWhenDisconnected() {
  window
    .showInformationMessage("Cannot connect to safecoder Server. Please check settings.", "Settings")
    .then((selection) => {
      switch (selection) {
        case "Settings":
          commands.executeCommand("safecoder.openSettings");
          break;
      }
    });
}

function showInformationStartAuth(callbacks?: { onAuthStart?: () => void; onAuthEnd?: () => void }) {
  window
    .showWarningMessage(
      "safecoder Server requires authorization. Continue to open authorization page in your browser.",
      "Continue",
      "Settings",
    )
    .then((selection) => {
      switch (selection) {
        case "Continue":
          commands.executeCommand("safecoder.openAuthPage", callbacks);
          break;
        case "Settings":
          commands.executeCommand("safecoder.openSettings");
      }
    });
}

function showInformationAuthSuccess() {
  window.showInformationMessage("Congrats, you're authorized, start to use safecoder now.");
}

function showInformationWhenStartAuthButAlreadyAuthorized() {
  window.showInformationMessage("You are already authorized now.");
}

function showInformationWhenAuthFailed() {
  window.showWarningMessage("Cannot connect to server. Please check settings.", "Settings").then((selection) => {
    switch (selection) {
      case "Settings":
        commands.executeCommand("safecoder.openSettings");
        break;
    }
  });
}

function getHelpMessageForCompletionResponseTimeIssue() {
  let helpMessageForRunningLargeModelOnCPU = "";
  const serverHealthState = agent().getServerHealthState();
  if (serverHealthState?.device === "cpu" && serverHealthState?.model?.match(/[0-9\.]+B$/)) {
    helpMessageForRunningLargeModelOnCPU +=
      `Your safecoder server is running model ${serverHealthState?.model} on CPU. ` +
      "This model is too large to run on CPU, please try a smaller model or switch to GPU. " +
      "You can find supported model list in online documents. \n";
  }
  let message = "";
  if (helpMessageForRunningLargeModelOnCPU.length > 0) {
    message += helpMessageForRunningLargeModelOnCPU + "\n";
    message += "Other possible causes of this issue are: \n";
  } else {
    message += "Possible causes of this issue are: \n";
  }
  message += " - A poor network connection. Please check your network and proxy settings.\n";
  message += " - Server overload. Please contact your safecoder server administrator for assistance.\n";
  if (helpMessageForRunningLargeModelOnCPU.length == 0) {
    message += ` - The running model ${serverHealthState?.model ?? ""} is too large to run on your safecoder server. `;
    message += "Please try a smaller model. You can find supported model list in online documents.\n";
  }
  return message;
}

function showInformationWhenSlowCompletionResponseTime(modal: boolean = false) {
  if (modal) {
    const stats = agent()
      .getIssues()
      .find((issue) => issue.name === "slowCompletionResponseTime")?.completionResponseStats;
    let statsMessage = "";
    if (stats && stats["responses"] && stats["averageResponseTime"]) {
      statsMessage = `The average response time of recent ${stats["responses"]} completion requests is ${Number(
        stats["averageResponseTime"],
      ).toFixed(0)}ms.\n\n`;
    }
    window
      .showWarningMessage(
        "Completion requests appear to take too much time.",
        {
          modal: true,
          detail: statsMessage + getHelpMessageForCompletionResponseTimeIssue(),
        },
        "Supported Models",
      )
      .then((selection) => {
        switch (selection) {
          case "Supported Models":
            env.openExternal(Uri.parse("https://tabby.tabbyml.com/docs/models/"));
            break;
        }
      });
  } else {
    window
      .showWarningMessage("Completion requests appear to take too much time.", "Detail", "Settings")
      .then((selection) => {
        switch (selection) {
          case "Detail":
            showInformationWhenSlowCompletionResponseTime(true);
            break;
          case "Settings":
            commands.executeCommand("safecoder.openSettings");
            break;
        }
      });
  }
}

function showInformationWhenHighCompletionTimeoutRate(modal: boolean = false) {
  if (modal) {
    const stats = agent()
      .getIssues()
      .find((issue) => issue.name === "highCompletionTimeoutRate")?.completionResponseStats;
    let statsMessage = "";
    if (stats && stats["total"] && stats["timeouts"]) {
      statsMessage = `${stats["timeouts"]} of ${stats["total"]} completion requests timed out.\n\n`;
    }
    window
      .showWarningMessage(
        "Most completion requests timed out.",
        {
          modal: true,
          detail: statsMessage + getHelpMessageForCompletionResponseTimeIssue(),
        },
        "Supported Models",
      )
      .then((selection) => {
        switch (selection) {
          case "Supported Models":
            env.openExternal(Uri.parse("https://tabby.tabbyml.com/docs/models/"));
            break;
        }
      });
  } else {
    window.showWarningMessage("Most completion requests timed out.", "Detail", "Settings").then((selection) => {
      switch (selection) {
        case "Detail":
          showInformationWhenHighCompletionTimeoutRate(true);
          break;
        case "Settings":
          commands.executeCommand("safecoder.openSettings");
          break;
      }
    });
  }
}

export const notifications = {
  showInformationWhenInitializing,
  showInformationWhenAutomaticTrigger,
  showInformationWhenManualTrigger,
  showInformationWhenManualTriggerLoading,
  showInformationWhenInlineSuggestDisabled,
  showInformationWhenDisconnected,
  showInformationStartAuth,
  showInformationAuthSuccess,
  showInformationWhenStartAuthButAlreadyAuthorized,
  showInformationWhenAuthFailed,
  showInformationWhenSlowCompletionResponseTime,
  showInformationWhenHighCompletionTimeoutRate,
};
