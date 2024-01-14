import {
  CancellationToken,
  InlineCompletionContext,
  InlineCompletionItem,
  InlineCompletionItemProvider,
  InlineCompletionTriggerKind,
  Position,
  Range,
  TextDocument,
  workspace,
} from "vscode";
import { EventEmitter } from "events";
import { CompletionResponse } from "safecoder-agent";
import { agent } from "./agent";

export class TabbyCompletionProvider extends EventEmitter implements InlineCompletionItemProvider {
  private triggerMode: "automatic" | "manual" | "disabled" = "automatic";
  private onGoingRequestAbortController: AbortController | null = null;
  private loading: boolean = false;

  constructor() {
    super();
    this.updateConfiguration();
    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("safecoder") || event.affectsConfiguration("editor.inlineSuggest")) {
        this.updateConfiguration();
      }
    });
  }

  public getTriggerMode(): "automatic" | "manual" | "disabled" {
    return this.triggerMode;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public async provideInlineCompletionItems(
    document: TextDocument,
    position: Position,
    context: InlineCompletionContext,
    token: CancellationToken,
  ): Promise<InlineCompletionItem[] | null> {
    if (context.triggerKind === InlineCompletionTriggerKind.Automatic && this.triggerMode === "manual") {
      return null;
    }

    if (context.triggerKind === InlineCompletionTriggerKind.Invoke && this.triggerMode === "automatic") {
      return null;
    }

    // Check if autocomplete widget is visible
    if (context.selectedCompletionInfo !== undefined) {
      console.debug("Autocomplete widget is visible, skipping.");
      return null;
    }

    if (token?.isCancellationRequested) {
      console.debug("Cancellation was requested.");
      return null;
    }

    const replaceRange = this.calculateReplaceRange(document, position);

    const request = {
      filepath: document.uri.fsPath,
      language: document.languageId, // https://code.visualstudio.com/docs/languages/identifiers
      text: document.getText(),
      position: document.offsetAt(position),
      manually: context.triggerKind === InlineCompletionTriggerKind.Invoke,
    };

    const abortController = new AbortController();
    this.onGoingRequestAbortController = abortController;
    token?.onCancellationRequested(() => {
      console.debug("Cancellation requested.");
      abortController.abort();
    });

    try {
      this.loading = true;
      this.emit("loadingStatusUpdated");
      const result = await agent().provideCompletions(request, { signal: abortController.signal });
      //判断result第一字符之前是否有空格，如果有，则去掉空格 fix：wizardcoder-3B 首个空字符导致的格式问题 
      if(result.choices[0].text.charAt(0) === " "){
          result.choices[0].text = result.choices[0].text.substring(1)
      }
      this.loading = false;
      this.emit("loadingStatusUpdated");
      return this.toInlineCompletions(result, replaceRange);
    } catch (error: any) {
      if (this.onGoingRequestAbortController === abortController) {
        // the request was not replaced by a new request, set loading to false safely
        this.loading = false;
        this.emit("loadingStatusUpdated");
      }
      if (error.name !== "AbortError") {
        console.debug("Error when providing completions", { error });
      }
    }

    return null;
  }


  private updateConfiguration() {
    if (!workspace.getConfiguration("editor").get("inlineSuggest.enabled", true)) {
      this.triggerMode = "disabled";
      this.emit("triggerModeUpdated");
    } else {
      this.triggerMode = workspace.getConfiguration("safecoder").get("inlineCompletion.triggerMode", "automatic");
      this.emit("triggerModeUpdated");
    }
  }

  private toInlineCompletions(tabbyCompletion: CompletionResponse | null, range: Range): InlineCompletionItem[] {
    console.log("tabbyCompletion:",tabbyCompletion)
    return (
      tabbyCompletion?.choices?.map((choice: any) => {
        let event = {
          type: "select",
          completion_id: tabbyCompletion.id,
          choice_index: choice.index,
        };
        console.log("choice text: ",choice.text)
        return new InlineCompletionItem(choice.text, range, {
          title: "",
          command: "safecoder.emitEvent",
          arguments: [event],
        });
      }) || []
    );
  }

  private hasSuffixParen(document: TextDocument, position: Position) {
    const suffix = document.getText(
      new Range(position.line, position.character, position.line, position.character + 1),
    );
    return ")]}".indexOf(suffix) > -1;
  }

  // FIXME: move replace range calculation to tabby-agent
  private calculateReplaceRange(document: TextDocument, position: Position): Range {
    const hasSuffixParen = this.hasSuffixParen(document, position);
    if (hasSuffixParen) {
      return new Range(position.line, position.character, position.line, position.character + 1);
    } else {
      return new Range(position, position);
    }
  }
}
