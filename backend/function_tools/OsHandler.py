# Shell Command Tool
# Install packages, run frameworks, handle OS commands


import os
import subprocess
from langchain.tools import tool


# Optional: simple safeguard for obviously dangerous commands
def _is_dangerous_command(command: str) -> bool:
    lower = command.lower().strip()

    blocked_patterns = [
        "rm -rf /",
        "rm -rf \\",
        "format c:",
        "mkfs",          # formatting commands
        ":(){:|:&};:",   # fork bomb
    ]

    # Block sudo by default for safety
    if lower.startswith("sudo "):
        return True

    return any(pat in lower for pat in blocked_patterns)


@tool
def Shell_Command(working_directory: str, command: str) -> str:
    """
    Execute a shell command inside the given working directory.

    Use this tool for:
    - Installing dependencies (e.g., `pip install`, `npm install`)
    - Running build tools (e.g., `npm run dev`, `pytest`, `python manage.py migrate`)
    - Listing files (`ls`, `dir`) and other CLI utilities

    Args:
        working_directory: The base directory where the command should run.
        command: The shell command to execute, as a single string.

    Returns:
        A formatted string with STDOUT, STDERR, and exit code (if non-zero).
    """

    # Resolve working directory
    abs_working_dir = os.path.abspath(working_directory)

    if not os.path.isdir(abs_working_dir):
        return f"Error: '{abs_working_dir}' is not a valid directory"

    # Basic safety check for obviously dangerous commands
    if _is_dangerous_command(command):
        return f"Error: Command blocked for safety: '{command}'"

    try:
        # Run command with shell so users can pass a full string
        result = subprocess.run(
            command,
            shell=True,
            cwd=abs_working_dir,
            timeout=120,           # 2 minutes max
            capture_output=True,
            text=True
        )

        stdout = result.stdout or ""
        stderr = result.stderr or ""

        output = f"""STDOUT:
            {stdout}
            STDERR:
            {stderr}
            """

        if not stdout.strip() and not stderr.strip():
            output = "No output produced.\n"

        if result.returncode != 0:
            output += f"Process exited with code {result.returncode}\n"

        return output

    except subprocess.TimeoutExpired:
        return f"Error: Command timed out after 120 seconds: '{command}'"
    except Exception as e:
        return f"Error: Failed to execute command '{command}': {e}"
