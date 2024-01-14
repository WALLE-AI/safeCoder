import { ExtensionContext, workspace, env, version } from "vscode";
import { TabbyAgent, PartialAgentConfig, DataStore } from "safecoder-agent";

function getWorkspaceConfiguration(): PartialAgentConfig {
  const configuration = workspace.getConfiguration("safecoder");
  const config: PartialAgentConfig = {};
  const endpoint = configuration.get<string>("api.endpoint");
  if (endpoint && endpoint.trim().length > 0) {
    config.server = {
      endpoint,
    };
  }
  const anonymousUsageTrackingDisabled = configuration.get<boolean>("usage.anonymousUsageTracking", false);
  config.anonymousUsageTracking = {
    disable: anonymousUsageTrackingDisabled,
  };
  return config;
}

var instance: TabbyAgent;

export function agent(): TabbyAgent {
  if (!instance) {
    throw new Error("Tabby Agent not initialized");
  }
  return instance;
}

export async function createAgentInstance(context: ExtensionContext): Promise<TabbyAgent> {
  if (!instance) {
    const extensionDataStore: DataStore = {
      data: {},
      load: async function () {
        this.data = context.globalState.get("data", {});
      },
      save: async function () {
        context.globalState.update("data", this.data);
      },
    };
    const agent = await TabbyAgent.create({ dataStore: env.appHost === "desktop" ? undefined : extensionDataStore });
    const initPromise = agent.initialize({
      config: getWorkspaceConfiguration(),
      client: `${env.appName} ${env.appHost} ${version}, ${context.extension.id} ${context.extension.packageJSON.version}`,
      clientProperties: {
        ide: {
          name: `${env.appName} ${env.appHost}`,
          version: version,
        },
        tabby_plugin: {
          name: context.extension.id,
          version: context.extension.packageJSON.version,
        },
      },
    });
    workspace.onDidChangeConfiguration(async (event) => {
      await initPromise;
      const configuration = workspace.getConfiguration("safecoder");
      if (event.affectsConfiguration("safecoder.api.endpoint")) {
        const endpoint = configuration.get<string>("api.endpoint");
        if (endpoint && endpoint.trim().length > 0) {
          agent.updateConfig("server.endpoint", endpoint);
        } else {
          agent.clearConfig("server.endpoint");
        }
      }
      if (event.affectsConfiguration("safecoder.usage.anonymousUsageTracking")) {
        const anonymousUsageTrackingDisabled = configuration.get<boolean>("usage.anonymousUsageTracking", false);
        agent.updateConfig("anonymousUsageTracking.disable", anonymousUsageTrackingDisabled);
      }
    });
    instance = agent;
  }
  return instance;
}
