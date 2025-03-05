import aiohttp
from typing import Annotated
from dotenv import load_dotenv

from livekit.agents import llm
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.agents.multimodal import MultimodalAgent

import os

load_dotenv(dotenv_path="../.env")
BACKEND_URL = os.environ.get("BACKEND_URL")
AI_AGENT_BACKEND_TOKEN = os.environ.get("AI_AGENT_BACKEND_TOKEN")
# first define a class that inherits from llm.FunctionContext
class AgentActions(llm.FunctionContext):
    # the llm.ai_callable decorator marks this function as a tool available to the LLM
    # by default, it'll use the docstring as the function's description
    @llm.ai_callable(description="save the assignment")
    async def save_assignment(
        self,
        # by using the Annotated type, arg description and type are available to the LLM
        assignment: Annotated[
            str, llm.TypeInfo(description="The assignment to save")
        ],
    ):
        """Called when the user says all doubts are resolved. This function will schedule the assignment."""
        print("Saving assignment")
        # logger.info(f"saving assignment {assignment}")
        # url = f"{BACKEND_URL}/save_assignment?token={AI_AGENT_BACKEND_TOKEN}"
        # async with aiohttp.ClientSession() as session:
        #     async with session.post(url, data=assignment) as response:
        #         if response.status == 200:
        #             response_data = await response.text()
        #             # response from the function call is returned to the LLM
        #             # as a tool response. The LLM's response will include this data
        #             return f"{response_data}"
        #         else:
        #             raise f"Failed to get weather data, status code: {response.status}"