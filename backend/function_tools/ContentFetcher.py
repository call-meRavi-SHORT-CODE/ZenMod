import os
from google.genai import types
from langchain.tools import tool



MAX_CHARS = 10000 
@tool
def Content_Fetcher(working_directory: str, file_path: str) -> dict:
    """Fetch and return the content of a file from inside the working directory.

    Ensures:
    - The file is inside the working directory.
    - Only regular files can be read.
    - Returns at most MAX_CHARS characters.
    - Adds a truncation message if file is large.

    Args:
        working_directory: Base directory to restrict access.
        file_path: Relative path to the file to read.
    """
    # Convert paths to absolute paths
    abs_working_dir = os.path.abspath(working_directory)
    abs_file_path = os.path.abspath(os.path.join(working_directory, file_path))

    # --- SAFETY CHECK 1 ---
    if not abs_file_path.startswith(abs_working_dir):
        return {"result": f'Error: "{file_path}" is not in the working directory'}

    # --- SAFETY CHECK 2 ---
    if not os.path.isfile(abs_file_path):
        return {"result": f'Error: "{file_path}" is not a file'}

    # Read file content
    try:
        with open(abs_file_path, "r", encoding="utf-8") as f:
            file_content_string = f.read(MAX_CHARS)

        # Add truncation note if needed
        if len(file_content_string) >= MAX_CHARS:
            file_content_string += (
                f'\n[...File "{file_path}" truncated at {MAX_CHARS} characters]'
            )

        return {"result": file_content_string}

    except Exception as e:
        return {"result": f'Error reading file "{file_path}": {e}'}


#print(Content_Fetcher(r"E:\-BugX", r"app.py"))

"""
schema_content_fetcher = types.FunctionDeclaration(
    name="Content_Fetcher",
    description="Reads content from a file inside the working directory, truncated to MAX_CHARS.",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "file_path": types.Schema(
                type=types.Type.STRING,
                description="Relative path of the file to read."
            ),
        },
        required=["file_path"]
    ),
)

"""