from langchain.tools import tool
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from langchain.tools import tool
from config import google_api
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI



GOOGLE_API_KEY = google_api


code_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GOOGLE_API_KEY)


# --- SYSTEM PROMPT FOR CODE GENERATION ---
code_system_prompt = """
You are BugX Code Engine.

Your job is to generate clean, correct, runnable code.

RULES:
- Output ONLY code.
- No explanation text outside code.
- If context is provided, modify or extend that code.
- Preserve the language/framework requested by the user.
- If generating a new file, output the entire file content.
"""



# --- PROMPT TEMPLATE ---
code_prompt = ChatPromptTemplate.from_messages([
    ("system", code_system_prompt),
    ("user",
     "User Request:\n{prompt}\n\n"
     "Existing Code Context (optional):\n{context}")
])


# --- OUTPUT PARSER ---
code_parser = StrOutputParser()


# --- CHAIN ---
code_chain = code_prompt | code_llm | code_parser


# --- LANGCHAIN TOOL ---
@tool
def Code_Generator(prompt: str, context: str = "") -> str:
    """
    Generate high-quality runnable code based on the user request.

    Use this tool whenever the agent needs to:
    - Create new code from scratch
    - Modify or extend existing code
    - Fix bugs in code using provided context
    - Convert code between languages
    - Implement features or backend logic
    - Produce entire files (HTML, CSS, JS, Python, React, etc.)

    Args:
        prompt: The user's code request (e.g., “create a Flask login route”)
        context: Existing code or file content to reference or update (optional)

    Returns:
        Pure code ONLY no explanations.
    """
    return code_chain.invoke({"prompt": prompt, "context": context})
