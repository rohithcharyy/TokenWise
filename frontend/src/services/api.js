const API_BASE_URL = "http://127.0.0.1:8000";


export async function compressMessages(
  messages,
  model
) {

  const response = await fetch(
    `${API_BASE_URL}/api/compress`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messages,
        model,
      }),
    }
  );


  if (!response.ok) {

    const errorData =
      await response
        .json()
        .catch(() => ({}));


    throw new Error(
      errorData.detail ||
      "Compression request failed."
    );

  }


  return response.json();

}


export async function sendChatMessage(
  messages,
  model,
  automaticSwitching = false
) {

  const response = await fetch(
    `${API_BASE_URL}/api/chat`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        messages,

        model,

        automatic_switching:
          automaticSwitching,

      }),
    }
  );


  if (!response.ok) {

    const errorData =
      await response
        .json()
        .catch(() => ({}));


    throw new Error(
      errorData.detail ||
      "LLM request failed."
    );

  }


  return response.json();

}