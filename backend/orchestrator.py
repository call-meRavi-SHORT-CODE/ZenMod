import os
from typing import Any, Dict

# LangChain 1.0+ Imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent  # <--- New Standard API
from langchain_core.messages import HumanMessage

# API Key
from config import google_api
GOOGLE_API_KEY = google_api

# === IMPORT YOUR TOOLS HERE ======================================
# (Keep your existing tool imports exactly as they were)
from function_tools.CodeEmitter import Code_Emitter
from function_tools.ContentFetcher import Content_Fetcher
from function_tools.MetaScanner import Meta_Scanner
from function_tools.PythonRunner import run_python_file
from function_tools.FileCreator import Create_File
from function_tools.OsHandler import Shell_Command
from function_tools.Refactor import File_Delete_Move
from function_tools.Validation import Test_Runner
from function_tools.WebSearch import Web_Search
from function_tools.PlannerTool import Plan_Generator
from function_tools.CodeGenerator import Code_Generator
# ================================================================

# === LLM (Gemini) ===============================================
bugx_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.1,
)
# ================================================================

# === TOOL LIST ==================================================
BUGX_TOOLS = [
    Plan_Generator,
    Web_Search,
    Meta_Scanner,
    Content_Fetcher,
    Create_File,
    Code_Emitter,
    Code_Generator,
    Shell_Command,
    run_python_file,
    Test_Runner,
    File_Delete_Move,
]

# === SYSTEM PROMPT ==============================================
# In LangChain 1.0, we pass the system prompt string directly to create_agent.
# We no longer need manual {agent_scratchpad} placeholders.
SYSTEM_PROMPT = """\
You are BugX, an autonomous AI Software Engineer Agent.

You work inside a local project directory and have access to tools
that let you PLAN, READ, WRITE, RUN, TEST, and SEARCH codebases.

Your job:
- Understand the user’s request.
- Decide which tools to call and in what order.
- Use the tools to inspect and modify the codebase.
- Finish with a clear, useful answer for the user.

High-level tool usage guidelines (IMPORTANT):

- Plan_Generator:
  Use this when the user request is broad or multi-step
  (e.g. "build X project", "add a whole feature", "refactor the app").
  It returns a step-by-step plan you can then execute using other tools.

- Web_Search:
  Use when you need:
    * library / framework docs
    * error explanations
    * install commands
    * examples for unfamiliar tech
  Always prefer this instead of guessing for unknown APIs.

- Meta_Scanner:
  Use when you need an overview of the repo
  (what files/folders exist, sizes, structure) before editing.

- Content_Fetcher:
  Use when you need to READ a file before changing it,
  or to understand existing code/context.

- Create_File:
  Use when you need to create a brand new file with some content
  (e.g. new module, component, config, test file).

- Code_Emitter:
  Use when you want to OVERWRITE or update a file with new content
  (often after generating code with Code_Generator).

- Code_Generator:
  Use when you need to GENERATE or MODIFY code.
  Combine it with Content_Fetcher (to get existing code) and Code_Emitter
  (to write back the new version).

- Shell_Command:
  Use for shell-level tasks inside the project:
    * installing dependencies (pip / npm / etc.)
    * running non-Python commands (npm run, node, docker, etc.)
    * git commands (status, diff, etc.)
  Avoid destructive commands (rm, format, etc.) unless clearly required.

- run_python_file:
  Use specifically when you need to run a Python entrypoint file
  (e.g. "run main.py", "execute this script").

- Test_Runner:
  Use when you need to run the project’s tests (pytest, npm test, etc.)
  to validate changes and see failures.

- File_Delete_Move:
  Use when you need to delete or rename/move files or directories.
  Only use this when refactoring, cleaning up unused files,
  or following explicit user instructions.

General behavior rules:

- Think step by step.
- Prefer reading (Meta_Scanner + Content_Fetcher) BEFORE heavy edits.
- Prefer Plan_Generator for big tasks, then execute plan steps.
- Prefer Web_Search instead of inventing unknown API details.
- Avoid dangerous or destructive changes unless clearly justified.
- After finishing tool calls, give a clear "Final Answer" that:
  * summarizes what you did,
  * mentions key files changed,
  * mentions commands/tests run,
  * lists any remaining TODOs for the user.

You MUST follow the ReAct format:

Thought: you should always think about what to do next
Action: the action to take, must be one of [{tool_names}]
Action Input: the JSON-serializable input to that tool
Observation: the result of the tool

(Repeat Thought/Action/Action Input/Observation as needed.)

When you’re done using tools:

Thought: I now know the final answer
Final Answer: a direct, helpful answer to the user’s question.

"""

# === CREATE AGENT (LangChain 1.0+ Graph API) ====================
# create_agent builds a compiled graph. No AgentExecutor is needed.
agent = create_agent(
    model=bugx_llm,
    tools=BUGX_TOOLS,
    system_prompt=SYSTEM_PROMPT
)
# ================================================================

# === RUNNER FUNCTION ============================================
def run_bugx_agent(user_input: str, working_directory: str = "./") -> Dict[str, Any]:
    """
    Runs the BugX agent using the LangChain 1.0 Graph API.
    """
    original_cwd = os.getcwd()
    try:
        # 1. Switch to target directory
        if os.path.exists(working_directory):
            os.chdir(working_directory)
            print(f"moved to: {working_directory}")
        
        # 2. Invoke the agent
        # The new API expects a dictionary with "messages"
        result = agent.invoke({
            "messages": [HumanMessage(content=user_input)]
        })

        # 3. Extract output
        # result["messages"][-1] is the final AI response
        final_output = result["messages"][-1].content
        return {"output": final_output}

    except Exception as e:
        return {"output": f"Critical Error: {str(e)}"}
    finally:
        # 4. Cleanup: return to original directory
        os.chdir(original_cwd)


if __name__ == "__main__":
    # Ensure test path exists
    test_path = r"E:\-BugX\Test_Project"
    if not os.path.exists(test_path):
        os.makedirs(test_path)

    print("Starting Agent...")
    result = run_bugx_agent(
        """write a small FastAPI app with one /health endpoint and tests.""",
        working_directory=test_path
    )

    print("\n=== FINAL OUTPUT ===")
    print(result["output"])