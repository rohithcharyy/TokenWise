import { useState } from "react";

import {
  Settings as SettingsIcon,
  Bot,
  SlidersHorizontal,
  Database,
  CheckCircle2,
  Save,
  Repeat2,
} from "lucide-react";


/* =========================================================
   AVAILABLE MODELS
   ========================================================= */

const models = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
  },
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
];

/* =========================================================
   SETTINGS PAGE
   ========================================================= */

function Settings() {

 const [userName, setUserName] = useState(
  () => localStorage.getItem("tokenwise_user_name") || "Rohith"
);

  const [defaultModel, setDefaultModel] =
    useState(() => localStorage.getItem("tokenwise_default_model") || "gpt-4o-mini");

  const [temperature, setTemperature] =
    useState(() => localStorage.getItem("tokenwise_temperature") || "0.7");

  const [maxContext, setMaxContext] =
    useState(() => localStorage.getItem("tokenwise_max_context") || "8000");

  const [compressionEnabled, setCompressionEnabled] =
    useState(() => localStorage.getItem("tokenwise_compression_enabled") === "true");

  const [preserveCode, setPreserveCode] =
    useState(() => localStorage.getItem("tokenwise_preserve_code") === "true");

  const [preserveSystemMessages, setPreserveSystemMessages] =
    useState(() => localStorage.getItem("tokenwise_preserve_system_messages") === "true");

 const [automaticModelSwitching, setAutomaticModelSwitching] =
  useState(() => {
    return localStorage.getItem("tokenwise_automatic_model_switching") === "true";
  });
  const [saved, setSaved] =
    useState(false);


  /* =======================================================
     SAVE SETTINGS
     ======================================================= */

  const handleSave = () => {

  localStorage.setItem(
    "tokenwise_user_name",
    userName
  );
  window.dispatchEvent(new Event("tokenwise-profile-updated"));

  localStorage.setItem(
    "tokenwise_default_model",
    defaultModel
  );

  localStorage.setItem(
    "tokenwise_temperature",
    temperature
  );

  localStorage.setItem(
    "tokenwise_max_context",
    maxContext
  );

  localStorage.setItem(
    "tokenwise_compression_enabled",
    compressionEnabled
  );

  localStorage.setItem(
    "tokenwise_preserve_code",
    preserveCode
  );

  localStorage.setItem(
    "tokenwise_preserve_system_messages",
    preserveSystemMessages
  );

  localStorage.setItem(
    "tokenwise_automatic_model_switching",
    automaticModelSwitching
  );


  setSaved(true);


  setTimeout(() => {

    setSaved(false);

  }, 2500);

};


  return (

    <div className="page-content">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-heading">

        <div>

          <h1>
            Settings
          </h1>

          <p>
            Configure your TokenWise application.
          </p>

        </div>

      </div>


      <div className="settings-page">


        {/* =================================================
            GENERAL
        ================================================= */}

        <section className="settings-section-card">

          <div className="settings-section-header">

            <div className="settings-section-icon">

              <SettingsIcon size={19} />

            </div>

            <div>

              <h2>
                General
              </h2>

              <p>
                Basic TokenWise preferences.
              </p>

            </div>

          </div>


          <div className="settings-fields">


            {/* USER NAME */}

            <div className="settings-field">

              <label>
                User Name
              </label>

              <input
                type="text"
                value={userName}
                onChange={(event) =>
                  setUserName(event.target.value)
                }
                placeholder="Enter your name"
              />

              <span>
                Your name will be displayed throughout TokenWise.
              </span>

            </div>


            {/* DEFAULT MODEL */}

            <div className="settings-field">

              <label>
                Default AI Model
              </label>

              <select
                value={defaultModel}
                onChange={(event) =>
                  setDefaultModel(event.target.value)
                }
              >

                {models.map((model) => (

                  <option
                    key={model.id}
                    value={model.id}
                  >
                    {model.name}
                  </option>

                ))}

              </select>

              <span>
                Model selected automatically when opening the AI workspace.
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            AI & MODEL CONFIGURATION
        ================================================= */}

        <section className="settings-section-card">

          <div className="settings-section-header">

            <div className="settings-section-icon">

              <Bot size={19} />

            </div>

            <div>

              <h2>
                AI & Model Configuration
              </h2>

              <p>
                Configure how TokenWise selects and uses language models.
              </p>

            </div>

          </div>


          <div className="settings-fields">


            {/* TEMPERATURE */}

            <div className="settings-field">

              <label>
                Temperature
              </label>

              <div className="settings-range-row">

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(event) =>
                    setTemperature(event.target.value)
                  }
                />

                <span className="settings-range-value">
                  {temperature}
                </span>

              </div>

              <span>
                Controls how creative or deterministic model responses are.
              </span>

            </div>


            {/* MAX CONTEXT */}

            <div className="settings-field">

              <label>
                Maximum Context Tokens
              </label>

              <select
                value={maxContext}
                onChange={(event) =>
                  setMaxContext(event.target.value)
                }
              >

                <option value="4000">
                  4,000 tokens
                </option>

                <option value="8000">
                  8,000 tokens
                </option>

                <option value="16000">
                  16,000 tokens
                </option>

                <option value="32000">
                  32,000 tokens
                </option>

              </select>

              <span>
                Maximum context size before TokenWise attempts optimization.
              </span>

            </div>

          </div>


          {/* AUTOMATIC MODEL SWITCHING */}

          <div className="settings-options">

            <div className="settings-option">

              <div>

                <strong>
                  Automatic Model Switching
                </strong>

                <span>
                  Automatically switch to another available model when the
                  current model reaches its token or context limit.
                </span>

              </div>


              <button
                type="button"
                className={`settings-toggle ${
                  automaticModelSwitching
                    ? "active"
                    : ""
                }`}
               onClick={() => {
  const newValue = !automaticModelSwitching;

  setAutomaticModelSwitching(newValue);

  localStorage.setItem(
    "automaticModelSwitching",
    String(newValue)
  );
}}
                aria-label="Toggle automatic model switching"
              >

                <span />

              </button>

            </div>


            {automaticModelSwitching && (

              <div className="settings-auto-switch-info">

                <Repeat2 size={16} />

                <div>

                  <strong>
                    Automatic switching enabled
                  </strong>

                  <span>
                    TokenWise will use another configured model when
                    the selected model cannot handle the request.
                  </span>

                </div>

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            CONTEXT COMPRESSION
        ================================================= */}

        <section className="settings-section-card">

          <div className="settings-section-header">

            <div className="settings-section-icon">

              <SlidersHorizontal size={19} />

            </div>

            <div>

              <h2>
                Context Compression
              </h2>

              <p>
                Control how TokenWise optimizes context before sending it to an LLM.
              </p>

            </div>

          </div>


          <div className="settings-options">


            {/* COMPRESSION */}

            <div className="settings-option">

              <div>

                <strong>
                  Enable Context Compression
                </strong>

                <span>
                  Automatically reduce unnecessary context before sending requests.
                </span>

              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  compressionEnabled
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setCompressionEnabled(
                    !compressionEnabled
                  )
                }
                aria-label="Toggle context compression"
              >

                <span />

              </button>

            </div>


            {/* CODE */}

            <div className="settings-option">

              <div>

                <strong>
                  Preserve Code Blocks
                </strong>

                <span>
                  Prevent important code sections from being aggressively compressed.
                </span>

              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  preserveCode
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setPreserveCode(!preserveCode)
                }
                aria-label="Toggle preserve code blocks"
              >

                <span />

              </button>

            </div>


            {/* SYSTEM MESSAGES */}

            <div className="settings-option">

              <div>

                <strong>
                  Preserve System Messages
                </strong>

                <span>
                  Keep system instructions intact during context optimization.
                </span>

              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  preserveSystemMessages
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setPreserveSystemMessages(
                    !preserveSystemMessages
                  )
                }
                aria-label="Toggle preserve system messages"
              >

                <span />

              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            BACKEND CONNECTION
        ================================================= */}

        <section className="settings-section-card">

          <div className="settings-section-header">

            <div className="settings-section-icon">

              <Database size={19} />

            </div>

            <div>

              <h2>
                Backend Connection
              </h2>

              <p>
                Status of the TokenWise backend service.
              </p>

            </div>

          </div>


          <div className="settings-connection">

            <div className="settings-connection-status">

              <span className="settings-status-dot" />

              <div>

                <strong>
                  Backend Connected
                </strong>

                <span>
                  TokenWise API is available and ready.
                </span>

              </div>

            </div>


            <span className="settings-connected-badge">
              Connected
            </span>

          </div>

        </section>


        {/* =================================================
            SAVE
        ================================================= */}

        <div className="settings-actions">

          {saved && (

            <div className="settings-saved">

              <CheckCircle2 size={16} />

              Settings saved

            </div>

          )}


          <button
            type="button"
            className="settings-save-button"
            onClick={handleSave}
          >

            <Save size={16} />

            Save Changes

          </button>

        </div>


      </div>

    </div>

  );
}


export default Settings;