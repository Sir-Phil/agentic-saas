import os
from fastapi import FastAPI, Request, Query
from fastapi.responses import StreamingResponse
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
from openai import OpenAI

app = FastAPI()

# 🔐 Clerk setup
clerk_config = ClerkConfig(jwks_url=os.getenv("CLERK_JWKS_URL"))
clerk_guard = ClerkHTTPBearer(clerk_config)


# =========================
# 🧠 CONTENT PROMPT ENGINE
# =========================
def build_prompt(content_type: str, topic: str):
    prompts = {
        "idea": f"Generate a startup idea about {topic}.",
        "blog": f"Write a detailed SEO-optimized blog post about {topic} with headings, subheadings, and examples.",
        "tweet": f"Write 5 viral tweets about {topic}.",
        "linkedin": f"Write a professional LinkedIn post about {topic}.",
        "ad": f"Write a high-converting ad copy for {topic}.",
        "product": f"Write a compelling product description for {topic}.",
    }
    return prompts.get(content_type, prompts["idea"])


# =========================
# ⚡ MAIN API ROUTE
# =========================
@app.get("/api")
async def generate(
    request: Request,
    type: str = Query("idea"),
    topic: str = Query("")
):
    try:
        # 🔐 Auth header check
        auth_header = request.headers.get("authorization")
        if not auth_header:
            return StreamingResponse(
                iter(["data: Missing Authorization header\n\n"]),
                media_type="text/event-stream",
            )

        # 🔐 Verify Clerk JWT
        creds: HTTPAuthorizationCredentials = await clerk_guard(request)
        user_id = creds.decoded.get("sub")
        plan = creds.decoded.get("subscription", "free")

        print("USER:", user_id)
        print("PLAN:", plan)

        # 💰 Simple plan logic
        if plan != "premium_subscription" and type == "ad":
            return StreamingResponse(
                iter(["data: Upgrade to premium to use this feature\n\n"]),
                media_type="text/event-stream",
            )

        # 🤖 OpenRouter client
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )

        user_prompt = build_prompt(type, topic)

        stream = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[{"role": "user", "content": user_prompt}],
            stream=True,
        )

        # ⚡ STREAM HANDLER
        def event_stream():
            try:
                for chunk in stream:
                    if not chunk.choices:
                        continue

                    delta = chunk.choices[0].delta

                    if getattr(delta, "content", None):
                        yield f"data: {delta.content}\n\n"

                yield "data: [DONE]\n\n"

            except Exception as e:
                yield f"data: Stream Error: {str(e)}\n\n"

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
            iter([f"data: Fatal Error: {str(e)}\n\n"]),
            media_type="text/event-stream",
        )


# =========================
# 🚀 REQUIRED FOR VERCEL
# =========================
handler = app