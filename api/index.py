import os
from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
from openai import OpenAI

app = FastAPI()

# 🔐 Clerk setup
clerk_config = ClerkConfig(jwks_url=os.getenv("CLERK_JWKS_URL"))
clerk_guard = ClerkHTTPBearer(clerk_config)


@app.get("/api")
def idea(creds: HTTPAuthorizationCredentials = Depends(clerk_guard)):
    try:
        # ✅ Extract user
        user_id = creds.decoded.get("sub")

        # 🤖 OpenRouter client
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )

        prompt = [
            {
                "role": "user",
                "content": "Reply with a new business idea for AI Agents, formatted with headings, sub-headings and bullet points"
            }
        ]

        stream = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=prompt,
            stream=True,
        )

        def event_stream():
            try:
                for chunk in stream:
                    delta = chunk.choices[0].delta

                    if hasattr(delta, "content") and delta.content:
                        text = delta.content

                        # Clean SSE formatting
                        yield f"data: {text}\n\n"

                yield "data: [DONE]\n\n"

            except Exception as e:
                yield f"data: Error: {str(e)}\n\n"

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )

    except Exception as e:
        return StreamingResponse(
            iter([f"data: Auth/Error: {str(e)}\n\n"]),
            media_type="text/event-stream",
        )


# ✅ Required for Vercel Python
handler = app