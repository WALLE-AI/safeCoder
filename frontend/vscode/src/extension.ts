// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages,workspace,StatusBarItem,commands,window,TextEditor} from "vscode";
import { createAgentInstance } from "./agent";
import { tabbyCommands } from "./commands";
import { TabbyCompletionProvider } from "./TabbyCompletionProvider";
import { TabbyStatusBarItem } from "./TabbyStatusBarItem";
import { CodeShellWebviewViewProvider } from "./CodeShellWebviewViewProvider";
import registerQuickFixProvider from "./ContinueQuickFixProvider";


function registerWebviewViewExtension(context: ExtensionContext) {
	const provider = new CodeShellWebviewViewProvider(context);

	// Register the provider with the extension's context
	context.subscriptions.push(
		window.registerWebviewViewProvider(CodeShellWebviewViewProvider.viewId, provider, {
			webviewOptions: { retainContextWhenHidden: true }
		}),
		commands.registerCommand("safecoder.explain_this_code", () => provider.executeCommand("safecoder.explain_this_code")),
		commands.registerCommand("safecoder.improve_this_code", () => provider.executeCommand("safecoder.improve_this_code")),
		commands.registerCommand("safecoder.clean_this_code", () => provider.executeCommand("safecoder.clean_this_code")),
		commands.registerCommand("safecoder.generate_comment", () => provider.executeCommand("safecoder.generate_comment")),
		commands.registerCommand("safecoder.generate_unit_test", () => provider.executeCommand("safecoder.generate_unit_test")),
		commands.registerCommand("safecoder.check_performance", () => provider.executeCommand("safecoder.check_performance")),
		commands.registerCommand("safecoder.check_security", () => provider.executeCommand("safecoder.check_security")),
		//快速修复bug
		commands.registerCommand("safecoder.quickfix", (message: string, code: string, edit: boolean) => provider.executeQuickFixBugCommand("safecoder.quickfix",message, code, edit))
		
	);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
  console.debug("Activating safecoder extension", new Date());
  await createAgentInstance(context);
  const completionProvider = new TabbyCompletionProvider();
  const statusBarItem = new TabbyStatusBarItem(completionProvider);
  context.subscriptions.push(
    languages.registerInlineCompletionItemProvider({ pattern: "**" }, completionProvider),
    statusBarItem.register(),
    ...tabbyCommands(),
  );
    //chat功能
    registerWebviewViewExtension(context);
	registerQuickFixProvider()

}

// this method is called when your extension is deactivated
export function deactivate() {
  console.debug("Deactivating safecoder extension", new Date());
}
