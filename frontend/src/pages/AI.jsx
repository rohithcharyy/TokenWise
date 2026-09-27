import { useEffect, useState } from "react";

import {
  Bot,
  Paperclip,
  Send,
  Settings2,
  TrendingDown,
  Repeat2,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { recordAnalytics } from "../services/analytics";
import { sendChatMessage } from "../services/api";


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const SESSIONS_STORAGE_KEY = "tokenwise_ai_sessions";
const SELECTED_MODEL_STORAGE_KEY = "tokenwise_selected_model";
const SELECTED_PROVIDER_STORAGE_KEY =
  "tokenwise_selected_provider";
const AUTO_SWITCH_STORAGE_KEY =
  "automaticModelSwitching";


/* =========================================================
   PROVIDER + MODEL CONFIGURATION
   ========================================================= */

const PROVIDERS = {
  openai: {
    name: "OpenAI",

    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
      },
    ],
  },

  groq: {
    name: "Groq",

    models: [
      {
        id: "gpt-oss-120b",
        name: "GPT OSS 120B",
      },
      {
        id: "gpt-oss-20b",
        name: "GPT OSS 20B",
      },
      {
        id: "qwen-3.8-27b",
        name: "Qwen 3.8 27B",
      },
    ],
  },

  gemini: {
    name: "Google Gemini",

    models: [
      {
        id: "gemini-3.8-flash",
        name: "Gemini 3.8 Flash",
      },
      {
        id: "gemini-3.5-flash",
        name: "Gemini 3.5 Flash",
      },
      {
        id: "gemini-3.5-flash-lite",
        name: "Gemini 3.5 Flash Lite",
      },
    ],
  },

  openrouter: {
    name: "OpenRouter",

    models: [
      {
        id: "openrouter-free",
        name: "OpenRouter Free",
      },
      {
        id: "nemotron-3-ultra",
        name: "Nemotron 3 Ultra",
      },
      {
        id: "gemma-4-26b",
        name: "Gemma 4 26B",
      },
    ],
  },
};


/* =========================================================
   ALL AVAILABLE MODELS
   ========================================================= */

const ALL_MODELS = Object.values(PROVIDERS)
  .flatMap(
    (provider) => provider.models
  );


/* =========================================================
   MODEL CONFIG
   ========================================================= */

function getModelConfig(modelId) {

  for (
    const providerKey of Object.keys(PROVIDERS)
  ) {

    const provider =
      PROVIDERS[providerKey];

    const model =
      provider.models.find(
        (item) =>
          item.id === modelId
      );

    if (model) {

      return {
        providerId: providerKey,
        providerName: provider.name,
        modelName: model.name,
      };

    }

  }


  return {
    providerId: "unknown",
    providerName: "Unknown",
    modelName: modelId,
  };

}


/* =========================================================
   EMPTY SESSION
   ========================================================= */

function createEmptySession() {

  return {

    apiMessages: [],

    uiMessages: [],

    stats: {
      tokensBefore: 0,
      tokensAfter: 0,
      tokensSaved: 0,
    },

  };

}


/* =========================================================
   LOAD SESSIONS
   ========================================================= */

function loadSessions() {

  try {

    const savedSessions =
      localStorage.getItem(
        SESSIONS_STORAGE_KEY
      );


    if (!savedSessions) {

      return {
        "gpt-oss-120b":
          createEmptySession(),
      };

    }


    const parsed =
      JSON.parse(savedSessions);


    if (
      !parsed ||
      typeof parsed !== "object"
    ) {

      return {
        "gpt-oss-120b":
          createEmptySession(),
      };

    }


    return parsed;

  } catch (error) {

    console.error(
      "Unable to load TokenWise sessions:",
      error
    );


    return {
      "gpt-oss-120b":
        createEmptySession(),
    };

  }

}


/* =========================================================
   LOAD SELECTED PROVIDER
   ========================================================= */

function loadSelectedProvider() {

  try {

    const savedProvider =
      localStorage.getItem(
        SELECTED_PROVIDER_STORAGE_KEY
      );


    if (
      savedProvider &&
      PROVIDERS[savedProvider]
    ) {

      return savedProvider;

    }

  } catch (error) {

    console.error(
      "Unable to load selected provider:",
      error
    );

  }


  return "groq";

}


/* =========================================================
   LOAD SELECTED MODEL
   ========================================================= */

function loadSelectedModel() {

  try {

    const savedModel =
      localStorage.getItem(
        SELECTED_MODEL_STORAGE_KEY
      );


    if (
      savedModel &&
      ALL_MODELS.some(
        (model) =>
          model.id === savedModel
      )
    ) {

      return savedModel;

    }

  } catch (error) {

    console.error(
      "Unable to load selected model:",
      error
    );

  }


  return "gpt-oss-120b";

}


/* =========================================================
   AI PAGE
   ========================================================= */

function AI() {

  /* =======================================================
     PROVIDER
     ======================================================= */

  const [
    selectedProvider,
    setSelectedProvider,
  ] = useState(
    loadSelectedProvider
  );


  /* =======================================================
     MODEL
     ======================================================= */

  const [
    selectedModel,
    setSelectedModel,
  ] = useState(
    loadSelectedModel
  );


  /* =======================================================
     SESSIONS
     ======================================================= */

  const [
    sessions,
    setSessions,
  ] = useState(
    loadSessions
  );


  /* =======================================================
     MESSAGE
     ======================================================= */

  const [
    message,
    setMessage,
  ] = useState("");


  /* =======================================================
     LOADING
     ======================================================= */

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);


  /* =======================================================
     ERROR
     ======================================================= */

  const [
    error,
    setError,
  ] = useState("");


  /* =======================================================
     AUTOMATIC SWITCHING
     ======================================================= */

  const [
    automaticModelSwitching,
    setAutomaticModelSwitching,
  ] = useState(() => {

    return (
      localStorage.getItem(
        AUTO_SWITCH_STORAGE_KEY
      ) === "true"
    );

  });


  /* =======================================================
     SWITCH NOTICE
     ======================================================= */

  const [
    switchNotice,
    setSwitchNotice,
  ] = useState("");


  /* =======================================================
     SAVE SESSIONS
     ======================================================= */

  useEffect(() => {

    try {

      localStorage.setItem(
        SESSIONS_STORAGE_KEY,
        JSON.stringify(sessions)
      );

    } catch (error) {

      console.error(
        "Unable to save TokenWise sessions:",
        error
      );

    }

  }, [sessions]);


  /* =======================================================
     SAVE MODEL
     ======================================================= */

  useEffect(() => {

    try {

      localStorage.setItem(
        SELECTED_MODEL_STORAGE_KEY,
        selectedModel
      );

    } catch (error) {

      console.error(
        "Unable to save selected model:",
        error
      );

    }

  }, [selectedModel]);


  /* =======================================================
     SAVE PROVIDER
     ======================================================= */

  useEffect(() => {

    try {

      localStorage.setItem(
        SELECTED_PROVIDER_STORAGE_KEY,
        selectedProvider
      );

    } catch (error) {

      console.error(
        "Unable to save selected provider:",
        error
      );

    }

  }, [selectedProvider]);


  /* =======================================================
     CURRENT SESSION
     ======================================================= */

  const currentSession =
    sessions[selectedModel] ||
    createEmptySession();


  const currentMessages =
    currentSession.uiMessages || [];


  const currentStats =
    currentSession.stats || {
      tokensBefore: 0,
      tokensAfter: 0,
      tokensSaved: 0,
    };


  /* =======================================================
     CURRENT MODEL
     ======================================================= */

  const currentModelConfig =
    getModelConfig(
      selectedModel
    );


  /* =======================================================
     AVAILABLE MODELS
     ======================================================= */

  const availableModels =
    PROVIDERS[
      selectedProvider
    ]?.models || [];


  /* =======================================================
     PROVIDER CHANGE
     ======================================================= */

  function handleProviderChange(event) {

    const newProvider =
      event.target.value;


    const provider =
      PROVIDERS[newProvider];


    if (!provider) {
      return;
    }


    const firstModel =
      provider.models[0];


    if (!firstModel) {
      return;
    }


    setSessions((previous) => {

      if (
        previous[
          firstModel.id
        ]
      ) {

        return previous;

      }


      return {

        ...previous,

        [firstModel.id]:
          createEmptySession(),

      };

    });


    setSelectedProvider(
      newProvider
    );


    setSelectedModel(
      firstModel.id
    );


    setError("");

    setSwitchNotice("");

  }


  /* =======================================================
     MODEL CHANGE
     ======================================================= */

  function handleModelChange(event) {

    const newModel =
      event.target.value;


    setSessions((previous) => {

      if (
        previous[newModel]
      ) {

        return previous;

      }


      return {

        ...previous,

        [newModel]:
          createEmptySession(),

      };

    });


    setSelectedModel(
      newModel
    );


    setError("");

    setSwitchNotice("");

  }


  /* =======================================================
     FALLBACK MODELS
     ======================================================= */

  function getFallbackModels(
    currentModel
  ) {

    const currentIndex =
      ALL_MODELS.findIndex(
        (model) =>
          model.id === currentModel
      );


    if (currentIndex === -1) {

      return ALL_MODELS;

    }


    return [

      ...ALL_MODELS.slice(
        currentIndex + 1
      ),

      ...ALL_MODELS.slice(
        0,
        currentIndex
      ),

    ];

  }


  /* =======================================================
     REQUEST MODEL
     ======================================================= */

  async function requestModel(
    messages,
    modelId
  ) {

    return sendChatMessage(
      messages,
      modelId
    );

  }


  /* =======================================================
     SEND MESSAGE
     ======================================================= */

  async function handleSend() {

    const trimmedMessage =
      message.trim();


    if (
      !trimmedMessage ||
      isLoading
    ) {

      return;

    }


    setError("");

    setSwitchNotice("");


    /* =====================================================
       USER MESSAGE
       ===================================================== */

    const userMessage = {

      role: "user",

      content:
        trimmedMessage,

    };


    const activeModel =
      selectedModel;


    const activeSession =
      sessions[activeModel] ||
      createEmptySession();


    const existingApiMessages =
      activeSession.apiMessages ||
      [];


    const updatedApiMessages = [

      ...existingApiMessages,

      userMessage,

    ];


    /* =====================================================
       SHOW USER MESSAGE
       ===================================================== */

    setSessions((previous) => {

      const session =
        previous[activeModel] ||
        createEmptySession();


      return {

        ...previous,

        [activeModel]: {

          ...session,

          apiMessages:
            updatedApiMessages,

          uiMessages: [

            ...(session.uiMessages || []),

            {
              type: "user",
              content:
                trimmedMessage,
            },

          ],

        },

      };

    });


    setMessage("");

    setIsLoading(true);


    let responseModel =
      activeModel;


    let result = null;

    let lastError = null;


    try {

      /* ===================================================
         FIRST MODEL
         =================================================== */

      try {

        result =
          await requestModel(
            updatedApiMessages,
            activeModel
          );

      } catch (err) {

        lastError = err;


        if (
          !automaticModelSwitching
        ) {

          throw err;

        }


        /* ================================================
           AUTOMATIC MODEL SWITCHING
           ================================================ */

        const fallbackModels =
          getFallbackModels(
            activeModel
          );


        let switched = false;


        for (
          const fallbackModel
          of fallbackModels
        ) {

          try {

            result =
              await requestModel(
                updatedApiMessages,
                fallbackModel.id
              );


            responseModel =
              fallbackModel.id;


            switched = true;

            break;

          } catch (fallbackError) {

            lastError =
              fallbackError;

          }

        }


        if (!switched) {

          throw (
            lastError ||
            new Error(
              "All available models failed."
            )
          );

        }


        /* ================================================
           SWITCH NOTICE
           ================================================ */

        const previousModelName =
          getModelConfig(
            activeModel
          ).modelName;


        const newModelName =
          getModelConfig(
            responseModel
          ).modelName;


        setSwitchNotice(
          `Automatically switched from ${previousModelName} to ${newModelName}.`
        );


        /* ================================================
           CREATE FALLBACK SESSION
           ================================================ */

        setSessions((previous) => {

          if (
            previous[
              responseModel
            ]
          ) {

            return previous;

          }


          return {

            ...previous,

            [responseModel]:
              createEmptySession(),

          };

        });


        setSelectedModel(
          responseModel
        );


        const newProvider =
          getModelConfig(
            responseModel
          ).providerId;


        setSelectedProvider(
          newProvider
        );

      }


      /* ===================================================
         VALIDATE RESULT
         =================================================== */

      if (!result) {

        throw new Error(
          "The selected model returned no response."
        );

      }


      /* ===================================================
         OPTIMIZATION DATA
         =================================================== */

      const optimization =
        result.optimization ||
        {};


      const tokensBefore =
        Number(
          optimization.tokens_before ||
          0
        );


      const tokensAfter =
        Number(
          optimization.tokens_after ||
          0
        );


      const tokensSaved =
        Number(
          optimization.tokens_saved ||
          0
        );


      /* ===================================================
         RECORD ANALYTICS
         =================================================== */

      recordAnalytics({

        model:
          result.model_label ||
          responseModel,

        provider:
          result.provider,

        tokensBefore,

        tokensAfter,

        tokensSaved,

        operation:
          "Context compression",

      });


      /* ===================================================
         RESPONSE SESSION
         =================================================== */

      const responseSession =
        sessions[responseModel] ||
        createEmptySession();


      const previousStats =
        responseSession.stats || {

          tokensBefore: 0,

          tokensAfter: 0,

          tokensSaved: 0,

        };


      const newStats = {

        tokensBefore:
          previousStats.tokensBefore +
          tokensBefore,

        tokensAfter:
          previousStats.tokensAfter +
          tokensAfter,

        tokensSaved:
          previousStats.tokensSaved +
          tokensSaved,

      };


      /* ===================================================
         ASSISTANT MESSAGE
         =================================================== */

      const assistantMessage = {

        role: "assistant",

        content:
          result.response,

      };


      /* ===================================================
         SAVE RESPONSE
         =================================================== */

      setSessions((previous) => {

        const session =
          previous[responseModel] ||
          createEmptySession();


        return {

          ...previous,

          [responseModel]: {

            ...session,

            apiMessages: [

              ...updatedApiMessages,

              assistantMessage,

            ],

            uiMessages: [

              ...(session.uiMessages || []),

              {

                type:
                  "assistant",

                content:
                  result.response,

                model:
                  result.model_label,

                provider:
                  result.provider,

                usage:
                  result.usage,

              },

            ],

            stats:
              newStats,

          },

        };

      });


    } catch (err) {

      setError(

        err?.message ||
        "Unable to connect to the TokenWise backend."

      );

    } finally {

      setIsLoading(false);

    }

  }


  /* =======================================================
     KEYBOARD
     ======================================================= */

  function handleKeyDown(event) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSend();

    }

  }


  /* =======================================================
     AUTOMATIC SWITCHING TOGGLE
     ======================================================= */

  function handleAutomaticSwitchingToggle() {

    const newValue =
      !automaticModelSwitching;


    setAutomaticModelSwitching(
      newValue
    );


    localStorage.setItem(
      AUTO_SWITCH_STORAGE_KEY,
      String(newValue)
    );

  }


  /* =======================================================
     REDUCTION
     ======================================================= */

  const cumulativeReduction =
    currentStats.tokensBefore > 0

      ? (
          currentStats.tokensSaved /
          currentStats.tokensBefore
        ) * 100

      : 0;


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div className="ai-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="ai-page-header">

        <div>

          <h1>
            AI Workspace
          </h1>

          <p>
            Select a provider and model and interact with it through TokenWise.
          </p>

        </div>

      </div>


      {/* =================================================
          WORKSPACE
      ================================================= */}

      <div className="ai-workspace">


        {/* =================================================
            MODEL BAR
        ================================================= */}

        <div className="ai-model-bar">

          <div className="ai-model-info">

            <div className="ai-model-icon">

              <Bot size={19} />

            </div>


            <div>

              <span>
                Selected model
              </span>

              <strong>
                {currentModelConfig.modelName}
              </strong>

            </div>

          </div>


          <div className="ai-model-actions">

            <select
              className="ai-model-selector"
              value={selectedProvider}
              onChange={
                handleProviderChange
              }
              disabled={isLoading}
            >

              {Object.entries(
                PROVIDERS
              ).map(
                (
                  [
                    providerId,
                    provider,
                  ]
                ) => (

                  <option
                    key={providerId}
                    value={providerId}
                  >
                    {provider.name}
                  </option>

                )
              )}

            </select>


            <select
              className="ai-model-selector"
              value={selectedModel}
              onChange={
                handleModelChange
              }
              disabled={isLoading}
            >

              {availableModels.map(
                (model) => (

                  <option
                    key={model.id}
                    value={model.id}
                  >
                    {model.name}
                  </option>

                )
              )}

            </select>


            <button
              className="ai-settings-button"
              title="Model settings"
              type="button"
            >

              <Settings2 size={17} />

            </button>

          </div>

        </div>


        {/* =================================================
            AUTOMATIC SWITCHING
        ================================================= */}

        <div className="ai-auto-switch-bar">

          <div className="ai-auto-switch-left">

            <Repeat2 size={15} />

            <div>

              <strong>
                Automatic Model Switching
              </strong>

              <span>

                {automaticModelSwitching

                  ? "Enabled — TokenWise can switch models automatically."

                  : "Disabled — TokenWise will use only the selected model."

                }

              </span>

            </div>

          </div>


          <button
            type="button"
            className={`settings-toggle ${
              automaticModelSwitching
                ? "active"
                : ""
            }`}
            onClick={
              handleAutomaticSwitchingToggle
            }
            disabled={isLoading}
            aria-label="Toggle automatic model switching"
          >

            <span />

          </button>

        </div>


        {/* =================================================
            SWITCH NOTICE
        ================================================= */}

        {switchNotice && (

          <div className="ai-switch-notice">

            <Repeat2 size={15} />

            <span>
              {switchNotice}
            </span>

          </div>

        )}


        {/* =================================================
            OPTIMIZATION PANEL
        ================================================= */}

        <section className="ai-compression-result">

          <div className="ai-result-header">

            <div className="ai-result-title">

              <div className="ai-result-icon">

                <TrendingDown size={16} />

              </div>


              <div>

                <strong>
                  TokenWise Optimization
                </strong>

                <span>
                  Cumulative conversation statistics
                </span>

              </div>

            </div>

          </div>


          <div className="ai-token-stats">

            <div className="ai-token-stat">

              <span>
                Before
              </span>

              <strong>
                {currentStats.tokensBefore.toLocaleString()}
              </strong>

              <small>
                tokens
              </small>

            </div>


            <div className="ai-token-stat">

              <span>
                After
              </span>

              <strong>
                {currentStats.tokensAfter.toLocaleString()}
              </strong>

              <small>
                tokens
              </small>

            </div>


            <div className="ai-token-stat">

              <span>
                Saved
              </span>

              <strong>
                {currentStats.tokensSaved.toLocaleString()}
              </strong>

              <small>
                tokens
              </small>

            </div>


            <div className="ai-token-stat">

              <span>
                Reduction
              </span>

              <strong>
                {cumulativeReduction.toFixed(1)}%
              </strong>

              <small>
                cumulative
              </small>

            </div>

          </div>


          <div className="ai-transform-info">

            <span>

              {currentStats.tokensBefore > 0

                ? "Optimization active for this conversation."

                : "No optimization data yet. Send a message to begin."

              }

            </span>

          </div>

        </section>


        {/* =================================================
            CHAT AREA
        ================================================= */}

        <div className="ai-chat">

          {currentMessages.length === 0 ? (

            <div className="ai-empty-state">

              <div className="ai-empty-icon">

                <Bot size={25} />

              </div>


              <h2>
                Start a conversation
              </h2>


              <p>
                Your messages will be optimized by TokenWise
                before being sent to the selected model.
              </p>

            </div>

          ) : (

            <div className="ai-messages">

              {currentMessages.map(
                (item, index) => {

                  /* ========================================
                     USER MESSAGE
                     ======================================== */

                  if (
                    item.type === "user"
                  ) {

                    return (

                      <div
                        className="ai-message ai-message-user"
                        key={index}
                      >

                        <div className="ai-message-label">
                          You
                        </div>


                        <div className="ai-message-bubble">
                          {item.content}
                        </div>

                      </div>

                    );

                  }


                  /* ========================================
                     ASSISTANT MESSAGE
                     ======================================== */

                  if (
                    item.type === "assistant"
                  ) {

                    return (

                      <div
                        className="ai-message ai-message-assistant"
                        key={index}
                      >

                        <div className="ai-message-label">

                          {item.model ||
                            currentModelConfig.modelName}

                        </div>


                        <div className="ai-message-bubble ai-assistant-content">

                          <ReactMarkdown
                            remarkPlugins={[
                              remarkGfm,
                            ]}
                            components={{

                              table: ({
                                children,
                              }) => (

                                <div className="ai-markdown-table-wrapper">

                                  <table>
                                    {children}
                                  </table>

                                </div>

                              ),


                              a: ({
                                children,
                                href,
                              }) => (

                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>

                              ),


                              code: ({
                                inline,
                                children,
                                ...props
                              }) =>

                                inline ? (

                                  <code
                                    className="ai-inline-code"
                                    {...props}
                                  >
                                    {children}
                                  </code>

                                ) : (

                                  <pre className="ai-code-block">

                                    <code {...props}>
                                      {children}
                                    </code>

                                  </pre>

                                ),

                            }}
                          >

                            {item.content}

                          </ReactMarkdown>

                        </div>


                        {item.usage && (

                          <div className="ai-response-meta">

                            <span>
                              {item.provider}
                            </span>

                            <span>
                              •
                            </span>

                            <span>

                              {item.usage.total_tokens}
                              {" "}
                              tokens

                            </span>

                          </div>

                        )}

                      </div>

                    );

                  }


                  return null;

                }
              )}


              {/* ==========================================
                  LOADING
              ========================================== */}

              {isLoading && (

                <div className="ai-loading">

                  <div className="ai-loading-icon">

                    <Bot size={15} />

                  </div>

                  <span>

                    TokenWise is optimizing your context
                    and waiting for the LLM response...

                  </span>

                </div>

              )}

            </div>

          )}

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="ai-error">

            <strong>
              Request failed
            </strong>

            <span>
              {error}
            </span>

          </div>

        )}


        {/* =================================================
            COMPOSER
        ================================================= */}

        <div className="ai-composer">

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            placeholder={
              `Message ${currentModelConfig.modelName}...`
            }
            rows={3}
            disabled={isLoading}
          />


          <div className="ai-composer-footer">

            <div className="ai-tools">

              <button
                type="button"
                title="Attach file"
                disabled={isLoading}
              >

                <Paperclip size={17} />

              </button>


              <span>
                TokenWise will optimize your context automatically
              </span>

            </div>


            <button
              className="ai-send-button"
              onClick={handleSend}
              disabled={
                isLoading ||
                !message.trim()
              }
              type="button"
            >

              <Send size={16} />

              {isLoading
                ? "Processing..."
                : "Send"}

            </button>

          </div>

        </div>


        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <p className="ai-disclaimer">

          TokenWise optimizes context before sending it
          to the selected LLM.

        </p>

      </div>

    </div>

  );

}


export default AI;