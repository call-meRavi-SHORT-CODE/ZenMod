from langchain_google_genai import ChatGoogleGenerativeAI
from typing import Dict
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import re
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from langchain.tools import tool
from config import google_api
from services.helper import parse_response




GOOGLE_API_KEY = google_api

planner_prompt = """
You are BugX, an AI Software Engineer Agent.

The user has asked: {{ prompt }}

Your task is to generate a clear, step-by-step plan to fulfill the user’s request.

The user may ask you to:

• Build an entire project  
• Modify existing files  
• Add new features  
• Debug code  
• Refactor or optimize code  
• Integrate components  
• Fix errors  
• Analyze the current codebase  

Your plan must adapt to the type of task the user is requesting.

Follow this exact response structure:

Plan:

 Step 1: Describe the first concrete and necessary action toward solving the user’s request.

 Step 2: Describe the next actionable step.
 ...

 Step N: Describe the final action needed to complete the task.

Summary: <Provide a concise wrap-up of the plan, highlighting key dependencies, important considerations, or potential challenges.>

Guidelines:

• Each step must be specific, technical, and actionable.  
• The plan must directly match the user's intent — whether creating, modifying, debugging, integrating, or expanding code.  
• For simple tasks (e.g., editing one file), keep the plan short and targeted.  
• For large tasks (e.g., full project creation), outline a more detailed multi-stage plan.  
• Assume you have access to file tools, a web browser, and the ability to inspect/modify code.  
• Always follow the Plan → Steps → Summary format exactly.

Example:

Project Name: Weather Forecast Dashboard

Your Reply to the Human Prompter: Sure! Let’s create a plan to build a weather dashboard that displays real-time data.

Current Focus: Develop a responsive web app to show current and forecasted weather information.

Plan:

 Step 1: Research public weather APIs (e.g., OpenWeatherMap) and review API documentation.

 Step 2: Set up a Flask backend to handle API requests and process weather data.

 Step 3: Design a simple, dark-themed HTML/CSS interface to display temperature, humidity, and weather icons.

 Step 4: Integrate the backend with the frontend to fetch and display live weather updates.

 Step 5: Test the dashboard for various cities and ensure data updates correctly.

 Step 6: Deploy the application on a cloud platform (e.g., Render, netlify).

Summary: This plan focuses on building a live weather dashboard using Flask and public APIs. Key challenges include API rate limits and ensuring responsive UI updates.
"""





llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GOOGLE_API_KEY)

# --- Create prompt template ---
prompt = ChatPromptTemplate.from_messages([
    ("system", planner_prompt),
    ("user", "Request: {user_prompt}")
])

# --- Output parser ---
parser = StrOutputParser()

# --- Create full chain ---
chain = prompt | llm | parser


# --- Function to execute ---
def execute(user_prompt: str) -> str:
    """Run the planner chain"""
    return chain.invoke({"user_prompt": user_prompt})





@tool
def Plan_Generator(user_prompt: str) -> Dict:
    """
    Generate a technical step-by-step software engineering plan using BugX planner.

    Args:
        user_prompt: The user's request (task, bug, feature, project, etc.)

    Returns:
        A dictionary containing:
            - plans: Ordered step instructions
            - summary: Final summary of the plan
    """
    raw_output = chain.invoke({"user_prompt": user_prompt})
    return parse_response(raw_output)


"""

# --- Run the agent directly ---
if __name__ == "__main__":
    user_prompt = "module not found: pandas error"

    response = execute(user_prompt)
    print("\nRaw Response:\n", response)

    parsed = parse_response(response)
    print("\nParsed Output:\n", parsed)

"""