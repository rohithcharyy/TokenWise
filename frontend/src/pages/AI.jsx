import { useEffect, useState } from "react";
import {
  Bot,
  Paperclip,
  Send,
  Settings2,
  TrendingDown,
  Repeat2,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { recordAnalytics } from "../services/analytics";
import { sendChatMessage } from "../services/api";

const SESSIONS_STORAGE_KEY = "tokenwise_ai_sessions";
const SELECTED_MODEL_STORAGE_KEY = "tokenwise_selected_model";
const SELECTED_PROVIDER_STORAGE_KEY = "tokenwise_selected_provider";
const AUTO_SWITCH_STORAGE_KEY = "automaticModelSwitching";

const PROVIDERS = {
  openai: {
    name: "OpenAI",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    ],
  },
  groq: {
    name: "Groq",
    models: [
      { id: "gpt-oss-120b", name: "GPT OSS 120B" },
      { id: "gpt-oss-20b", name: "GPT OSS 20B" },
      { id: "qwen-3.8-27b", name: "Qwen 3.8 27B" },
    ],
  },
  gemini: {
    name: "Google Gemini",
    models: [
      { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash" },
      { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash" },
      { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite" },
    ],
  },
  openrouter: {
    name: "OpenRouter",
    models: [
      { id: "openrouter-free", name: "OpenRouter Free" },
      { id: "nemotron-3-ultra", name: "Nemotron 3 Ultra" },
      { id: "gemma-4-26b", name: "Gemma 4 26B" },
    ],
  },
};

const ALL_MODELS = Object.values(PROVIDERS).flatMap(
  (provider) => provider.models
);

function getModelConfig(modelId) {
  for (const providerId of Object.keys(PROVIDERS)) {
    const provider = PROVIDERS[providerId];
    const model = provider.models.find((item) => item.id === modelId);
    if (model) {
      return {
        providerId,
        providerName: provider.name,
        modelName: model.name,
      };
    }
  }
  return { providerId: "unknown", providerName: "Unknown", modelName: modelId };
}

function createEmptySession() {
  return {
    apiMessages: [],
    uiMessages: [],
    stats: { tokensBefore: 0, tokensAfter: 0, tokensSaved: 0 },
  };
}

function loadSessions() {
  try {
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!saved) return { "gpt-oss-120b": createEmptySession() };
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") {
      return { "gpt-oss-120b": createEmptySession() };
    }
    return parsed;
  } catch (error) {
    console.error("Unable to load TokenWise sessions:", error);
    return { "gpt-oss-120b": createEmptySession() };
  }
}

function loadSelectedProvider() {
  try {
    const saved = localStorage.getItem(SELECTED_PROVIDER_STORAGE_KEY);
    if (saved && PROVIDERS[saved]) return saved;
  } catch (error) {
    console.error("Unable to load selected provider:", error);
  }
  return "groq";
}

function loadSelectedModel() {
  try {
    const saved = localStorage.getItem(SELECTED_MODEL_STORAGE_KEY);
    if (saved && ALL_MODELS.some((model) => model.id === saved)) return saved;
  } catch (error) {
    console.error("Unable to load selected model:", error);
  }
  return "gpt-oss-120b";
}

function AI() {
  const [selectedProvider, setSelectedProvider] = useState(loadSelectedProvider);
  const [selectedModel, setSelectedModel] = useState(loadSelectedModel);
  const [sessions, setSessions] = useState(loadSessions);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [automaticModelSwitching, setAutomaticModelSwitching] = useState(
    () => localStorage.getItem(AUTO_SWITCH_STORAGE_KEY) === "true"
  );
  const [switchNotice, setSwitchNotice] = useState("");
  const [isOptimizationOpen, setIsOptimizationOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Unable to save TokenWise sessions:", error);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, selectedModel);
    } catch (error) {
      console.error("Unable to save selected model:", error);
    }
  }, [selectedModel]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_PROVIDER_STORAGE_KEY, selectedProvider);
    } catch (error) {
      console.error("Unable to save selected provider:", error);
    }
  }, [selectedProvider]);

  const currentSession = sessions[selectedModel] || createEmptySession();
  const currentMessages = currentSession.uiMessages || [];
  const currentStats = currentSession.stats || {
    tokensBefore: 0,
    tokensAfter: 0,
    tokensSaved: 0,
  };
  const currentModelConfig = getModelConfig(selectedModel);
  const availableModels = PROVIDERS[selectedProvider]?.models || [];

  function handleProviderChange(event) {
    const newProvider = event.target.value;
    const provider = PROVIDERS[newProvider];
    if (!provider) return;

    const firstModel = provider.models[0];
    if (!firstModel) return;

    setSessions((previous) => {
      if (previous[firstModel.id]) return previous;
      return { ...previous, [firstModel.id]: createEmptySession() };
    });
    setSelectedProvider(newProvider);
    setSelectedModel(firstModel.id);
    setError("");
    setSwitchNotice("");
  }

  function handleModelChange(event) {
    const newModel = event.target.value;
    setSessions((previous) => {
      if (previous[newModel]) return previous;
      return { ...previous, [newModel]: createEmptySession() };
    });
    setSelectedModel(newModel);
    setError("");
    setSwitchNotice("");
  }

  function getFallbackModels(currentModel) {
    const currentIndex = ALL_MODELS.findIndex((model) => model.id === currentModel);
    if (currentIndex === -1) return ALL_MODELS;
    return [
      ...ALL_MODELS.slice(currentIndex + 1),
      ...ALL_MODELS.slice(0, currentIndex),
    ];
  }

  async function requestModel(messages, modelId) {
    return sendChatMessage(messages, modelId);
  }

  async function handleSend() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    setError("");
    setSwitchNotice("");

    const userMessage = { role: "user", content: trimmedMessage };
    const activeModel = selectedModel;
    const activeSession = sessions[activeModel] || createEmptySession();
    const updatedApiMessages = [
      ...(activeSession.apiMessages || []),
      userMessage,
    ];

    setSessions((previous) => {
      const session = previous[activeModel] || createEmptySession();
      return {
        ...previous,
        [activeModel]: {
          ...session,
          apiMessages: updatedApiMessages,
          uiMessages: [
            ...(session.uiMessages || []),
            { type: "user", content: trimmedMessage },
          ],
        },
      };
    });

    setMessage("");
    setIsLoading(true);

    let responseModel = activeModel;
    let result = null;
    let lastError = null;

    try {
      try {
        result = await requestModel(updatedApiMessages, activeModel);
      } catch (err) {
        lastError = err;
        if (!automaticModelSwitching) throw err;

        let switched = false;
        for (const fallbackModel of getFallbackModels(activeModel)) {
          try {
            result = await requestModel(updatedApiMessages, fallbackModel.id);
            responseModel = fallbackModel.id;
            switched = true;
            break;
          } catch (fallbackError) {
            lastError = fallbackError;
          }
        }

        if (!switched) {
          throw lastError || new Error("All available models failed.");
        }

        const previousModelName = getModelConfig(activeModel).modelName;
        const newModelName = getModelConfig(responseModel).modelName;
        setSwitchNotice(
          `Automatically switched from ${previousModelName} to ${newModelName}.`
        );

        setSessions((previous) => {
          if (previous[responseModel]) return previous;
          return {
            ...previous,
            [responseModel]: createEmptySession(),
          };
        });
        setSelectedModel(responseModel);
        setSelectedProvider(getModelConfig(responseModel).providerId);
      }

      if (!result) {
        throw new Error("The selected model returned no response.");
      }

      const optimization = result.optimization || {};
      const tokensBefore = Number(optimization.tokens_before || 0);
      const tokensAfter = Number(optimization.tokens_after || 0);
      const tokensSaved = Number(optimization.tokens_saved || 0);

      recordAnalytics({
        model: result.model_label || responseModel,
        provider: result.provider,
        tokensBefore,
        tokensAfter,
        tokensSaved,
        operation: "Context compression",
      });

      const responseSession = sessions[responseModel] || createEmptySession();
      const previousStats = responseSession.stats || {
        tokensBefore: 0,
        tokensAfter: 0,
        tokensSaved: 0,
      };
      const newStats = {
        tokensBefore: previousStats.tokensBefore + tokensBefore,
        tokensAfter: previousStats.tokensAfter + tokensAfter,
        tokensSaved: previousStats.tokensSaved + tokensSaved,
      };
      const assistantMessage = { role: "assistant", content: result.response };

      setSessions((previous) => {
        const session = previous[responseModel] || createEmptySession();
        return {
          ...previous,
          [responseModel]: {
            ...session,
            apiMessages: [...updatedApiMessages, assistantMessage],
            uiMessages: [
              ...(session.uiMessages || []),
              {
                type: "assistant",
                content: result.response,
                model: result.model_label,
                provider: result.provider,
                usage: result.usage,
              },
            ],
            stats: newStats,
          },
        };
      });
    } catch (err) {
      setError(err?.message || "Unable to connect to the TokenWise backend.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleAutomaticSwitchingToggle() {
    const newValue = !automaticModelSwitching;
    setAutomaticModelSwitching(newValue);
    localStorage.setItem(AUTO_SWITCH_STORAGE_KEY, String(newValue));
  }

  const cumulativeReduction =
    currentStats.tokensBefore > 0
      ? (currentStats.tokensSaved / currentStats.tokensBefore) * 100
      : 0;

  return (
    <div className="ai-page">
      <div className="ai-workspace">
        {/* MODEL BAR */}
        <div className="ai-model-bar">
          <div className="ai-model-info">
            <div className="ai-model-icon"><Bot size={19} /></div>
            <div>
              <span>Selected model</span>
              <strong>{currentModelConfig.modelName}</strong>
            </div>
          </div>

          <div className="ai-model-actions">
            <select
              className="ai-model-selector"
              value={selectedProvider}
              onChange={handleProviderChange}
              disabled={isLoading}
              aria-label="Select provider"
            >
              {Object.entries(PROVIDERS).map(([providerId, provider]) => (
                <option key={providerId} value={providerId}>{provider.name}</option>
              ))}
            </select>

            <select
              className="ai-model-selector"
              value={selectedModel}
              onChange={handleModelChange}
              disabled={isLoading}
              aria-label="Select model"
            >
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>

            <button className="ai-settings-button" title="Model settings" type="button">
              <Settings2 size={17} />
            </button>
          </div>
        </div>

        {/* AUTOMATIC SWITCHING */}
        <div className="ai-auto-switch-bar">
          <div className="ai-auto-switch-left">
            <Repeat2 size={15} />
            <div>
              <strong>Automatic Model Switching</strong>
              <span>
                {automaticModelSwitching
                  ? "Enabled — TokenWise can switch models automatically."
                  : "Disabled — TokenWise will use only the selected model."}
              </span>
            </div>
          </div>

          <button
            type="button"
            className={`settings-toggle ${automaticModelSwitching ? "active" : ""}`}
            onClick={handleAutomaticSwitchingToggle}
            disabled={isLoading}
            aria-label="Toggle automatic model switching"
          >
            <span />
          </button>
        </div>

        {switchNotice && (
          <div className="ai-switch-notice">
            <Repeat2 size={15} />
            <span>{switchNotice}</span>
          </div>
        )}

        {/* CHAT + COLLAPSIBLE OPTIMIZATION PANEL */}
        <div className={`ai-chat-layout ${isOptimizationOpen ? "optimization-open" : ""}`}>
          <div className="ai-chat">
            {currentMessages.length === 0 ? (
              <div className="ai-empty-state">
                <div className="ai-empty-icon"><Bot size={25} /></div>
                <h2>Start a conversation</h2>
                <p>
                  Your messages will be optimized by TokenWise before being sent
                  to the selected model.
                </p>
              </div>
            ) : (
              <div className="ai-messages">
                {currentMessages.map((item, index) => {
                  if (item.type === "user") {
                    return (
                      <div className="ai-message ai-message-user" key={index}>
                        <div className="ai-message-label">You</div>
                        <div className="ai-message-bubble">{item.content}</div>
                      </div>
                    );
                  }

                  if (item.type === "assistant") {
                    return (
                      <div className="ai-message ai-message-assistant" key={index}>
                        <div className="ai-message-label">
                          {item.model || currentModelConfig.modelName}
                        </div>
                        <div className="ai-message-bubble ai-assistant-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table: ({ children }) => (
                                <div className="ai-markdown-table-wrapper">
                                  <table>{children}</table>
                                </div>
                              ),
                              a: ({ children, href }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              ),
                              code: ({ inline, children, ...props }) =>
                                inline ? (
                                  <code className="ai-inline-code" {...props}>{children}</code>
                                ) : (
                                  <pre className="ai-code-block">
                                    <code {...props}>{children}</code>
                                  </pre>
                                ),
                            }}
                          >
                            {item.content}
                          </ReactMarkdown>
                        </div>

                        {item.usage && (
                          <div className="ai-response-meta">
                            <span>{item.provider}</span>
                            <span>•</span>
                            <span>{item.usage.total_tokens} tokens</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}

                {isLoading && (
                  <div className="ai-loading">
                    <div className="ai-loading-icon"><Bot size={15} /></div>
                    <span>
                      TokenWise is optimizing your context and waiting for the
                      LLM response...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className={`ai-optimization-panel ${isOptimizationOpen ? "open" : ""}`}>
            <button
              type="button"
              className="ai-optimization-tab"
              onClick={() => setIsOptimizationOpen((open) => !open)}
              aria-expanded={isOptimizationOpen}
              aria-label={isOptimizationOpen ? "Close optimization panel" : "Open optimization panel"}
              title="Toggle optimization panel"
            >
              <TrendingDown size={17} />
              <span>Optimization</span>
            </button>

            {isOptimizationOpen && (
              <div className="ai-optimization-panel-content">
                <div className="ai-compression-result">
                  <div className="ai-result-header">
                    <div className="ai-result-title">
                      <div className="ai-result-icon"><TrendingDown size={16} /></div>
                      <div>
                        <strong>TokenWise Optimization</strong>
                        <span>Cumulative conversation statistics</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ai-optimization-close"
                      onClick={() => setIsOptimizationOpen(false)}
                      aria-label="Close optimization panel"
                      title="Close panel"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="ai-token-stats">
                    <div className="ai-token-stat">
                      <span>Before</span>
                      <strong>{currentStats.tokensBefore.toLocaleString()}</strong>
                      <small>tokens</small>
                    </div>
                    <div className="ai-token-stat">
                      <span>After</span>
                      <strong>{currentStats.tokensAfter.toLocaleString()}</strong>
                      <small>tokens</small>
                    </div>
                    <div className="ai-token-stat">
                      <span>Saved</span>
                      <strong>{currentStats.tokensSaved.toLocaleString()}</strong>
                      <small>tokens</small>
                    </div>
                    <div className="ai-token-stat">
                      <span>Reduction</span>
                      <strong>{cumulativeReduction.toFixed(1)}%</strong>
                      <small>cumulative</small>
                    </div>
                  </div>

                  <div className="ai-transform-info">
                    <span>
                      {currentStats.tokensBefore > 0
                        ? "Optimization active for this conversation."
                        : "No optimization data yet. Send a message to begin."}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* ERROR */}
        {error && (
          <div className="ai-error">
            <strong>Request failed</strong>
            <span>{error}</span>
          </div>
        )}

        {/* COMPOSER */}
        <div className="ai-composer">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${currentModelConfig.modelName}...`}
            rows={3}
            disabled={isLoading}
            aria-label="Message"
          />

          <div className="ai-composer-footer">
            <div className="ai-tools">
              <button type="button" title="Attach file" disabled={isLoading}>
                <Paperclip size={17} />
              </button>
              <span>TokenWise will optimize your context automatically</span>
            </div>

            <button
              className="ai-send-button"
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              type="button"
            >
              <Send size={16} />
              {isLoading ? "Processing..." : "Send"}
            </button>
          </div>
        </div>

        <p className="ai-disclaimer">
          TokenWise optimizes context before sending it to the selected LLM.
        </p>
      </div>
    </div>
  );
}

export default AI;
