"""
Groq streaming service (llama-3.3-70b-versatile).
"""

import json
from typing import AsyncGenerator

from groq import AsyncGroq

from app.core.config import settings
from app.models.schemas import ProcessedGitHubData
from app.utils.prompt_builder import build_analysis_prompt, SYSTEM_PROMPT


async def stream_analysis(data: ProcessedGitHubData) -> AsyncGenerator[str, None]:
    """
    Yields SSE-formatted strings:
      data: {"type": "token", "payload": "<text chunk>"}\n\n

    On completion:
      data: {"type": "done", "payload": ""}\n\n

    On error:
      data: {"type": "error", "payload": "<message>"}\n\n
    """
    try:
        client = AsyncGroq(api_key=settings.groq_api_key)
        prompt = build_analysis_prompt(data)

        stream = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            max_tokens=1500,
            stream=True,
        )

        async for chunk in stream:
            text = chunk.choices[0].delta.content
            if text:
                yield f"data: {json.dumps({'type': 'token', 'payload': text})}\n\n"

        yield 'data: {"type": "done", "payload": ""}\n\n'

    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'payload': str(e)})}\n\n"
