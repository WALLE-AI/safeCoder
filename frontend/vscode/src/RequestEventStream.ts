/* eslint-disable */
import { workspace } from "vscode";
import { FetchStream } from "./FetchStream";
import AbortController from "abort-controller";

let abortController = new AbortController();

export async function stopEventStream() {
    //safeCoder
    abortController.abort();

}

export function selectedAddress(address:string,modelName:string) {
    //switch分别判断address
    switch(modelName){
        case "safecoder":
            return address +"safecoder/v1/code/chat/completions" 
            break;
        case "wizarcoder":
            return address +"wizarcoder/v1/code/chat/completions" 
            break;
        case "starcoder":
            return address + "starcoder/v1/code/chat/completions" 
            break;
        case "codeshell":
            return address +"codeshell/v1/code/chat/completions" 
            break;
        case "mistral":
            return address + "mistral/v1/code/chat/completions"
            break;
        case "gpt-3.5-turbo-16k":
            return address + "gpt-3.5-turbo-16k/v1/code/chat/completions"
            break;
    }

} 
//TODO:需要适配不同的models
export async function postEventStream(prompt: Array<{}| undefined>, msgCallback: (data: string) => any, doneCallback: () => void, errorCallback: (err: any) => void) {
    let maxtokens = workspace.getConfiguration("safecoder").get("api.chat.chatMaxtokens") as number;
    let websearch = workspace.getConfiguration("safecoder").get("api.chat.websearch") as boolean;
    let body = {
        "messages": prompt,
        "temperature": 0.2,
        "frequency_penalty": 1.2,
        "stream":true,
        "max_tokens": maxtokens,
        "web_search":websearch
    };

    let jsonBody = JSON.stringify(body);

    let address = workspace.getConfiguration("safecoder").get("api.chat.endpoint") as string;
    let modelName = workspace.getConfiguration("safecoder").get("api.chat.models") as string;
    let addressEndPoint = selectedAddress(address,modelName) as string
    abortController = new AbortController();
    //超时5000毫秒
    const timer = setTimeout(() => {
        abortController.abort();
        errorCallback(new Error('Request timed out'));
    }, 5000);
    try {
        await new FetchStream({
            url: addressEndPoint,
            requestInit: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: jsonBody,
                signal: abortController.signal
            },
            onmessage: msgCallback,
            ondone: doneCallback,
            onerror: errorCallback
        });
    } catch (error) {
        // 处理其他错误
        errorCallback(error);
    } finally {
        clearTimeout(timer);
    }

}