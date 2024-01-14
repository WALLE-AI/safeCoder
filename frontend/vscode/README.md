# safeCoder VSCode Extension

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

safeCoder is an AI coding assistant that can suggest multi-line code or full functions in real-time.

safeCoder VSCode extension is compatible with `VSCode ≥ 1.82.0`, as well as web environments like [vscode.dev](https://vscode.dev).

For more information, please check out our [Website](https://tabbyml.com/) and [GitHub](https://github.com/SafeCoderML/tabby).
If you encounter any problem or have any suggestion, please [open an issue](https://github.com/SafeCoderML/tabby/issues/new)!

## Demo

![Demo](https://tabby.tabbyml.com/img/demo.gif)

## Get Started

Once you have installed the SafeCoder VSCode extension, you can easily get started by following the built-in walkthrough guides. You can access the walkthrough page at any time by using the command `safeCoder: Getting Started`.

1. **Setup the SafeCoder server**: You have two options to set up your SafeCoder server. You can either get a SafeCoder Cloud hosted server [here](https://app.tabbyml.com) or build your own self-hosted SafeCoder server following [this guide](https://tabby.tabbyml.com/docs/installation).
2. **Connect the extension to your SafeCoder server**: Use the command `safeCoder: Specify API Endpoint of safeCoder` to connect the extension to your SafeCoder server. If you are using a SafeCoder Cloud server endpoint, follow the instructions provided in the popup messages to complete the authorization process.

Once the setup is complete, SafeCoder will automatically provide inline suggestions. You can accept the suggestions by simply pressing the `Tab` key. Hovering over the inline suggestion text will display additional useful actions, such as partially accepting suggestions by word or by line.

If you prefer to trigger code completion manually, you can select the manual trigger option in the settings. After that, use the shortcut `Alt + \` to trigger code completion. To access the settings page, use the command `safeCoder: Open Settings`.

