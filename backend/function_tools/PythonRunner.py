import os
import subprocess
from google.genai import types
from langchain.tools import tool



@tool
def run_python_file(working_directory: str, file_path: str) -> str:
    """Execute a Python file located inside the working directory.

    Ensures:
    - The file stays within the working directory.
    - The target is an existing `.py` file.
    - Execution time is limited to 30 seconds.
    - STDOUT and STDERR are captured and returned.

    Args:
        working_directory: Base directory where the file exists.
        file_path: Relative path to the Python file to execute.
    """
    abs_working_dir = os.path.abspath(working_directory)
    abs_file_path = os.path.abspath(os.path.join(working_directory, file_path))

    # Validate location
    if not abs_file_path.startswith(abs_working_dir):
        return f"Error: '{file_path}' is not in the working directory"

    # Validate file exists
    if not os.path.isfile(abs_file_path):
        return f"Error: '{file_path}' is not a file"

    # Validate Python file
    if not file_path.endswith(".py"):
        return f"Error: '{file_path}' is not a Python file."

    try:
        output = subprocess.run(
            ["python3", abs_file_path],
            cwd=abs_working_dir,
            timeout=30,
            capture_output=True,
            text=True
        )

        # Construct return message
        final_string = f"""
            STDOUT:
            {output.stdout}
            STDERR:
            {output.stderr}
            """

        # No output
        if output.stdout.strip() == "" and output.stderr.strip() == "":
            final_string = "No output produced.\n"

        # Non-zero return code
        if output.returncode != 0:
            final_string += f"Process exited with code {output.returncode}\n"

        return final_string

    except Exception as e:
        return f"Error executing Python file: {e}"

"""
schema_python_runner = types.FunctionDeclaration(
    name="run_python_file",
    description="Executes a Python file inside the working directory and returns its output.",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "file_path": types.Schema(
                type=types.Type.STRING,
                description="Relative path to the Python file to execute."
            ),
        },
        required=["file_path"]
    ),
)
"""