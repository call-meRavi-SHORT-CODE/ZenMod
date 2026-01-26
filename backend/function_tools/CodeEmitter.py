import os
from google.genai import types
from langchain.tools import tool


@tool
def Code_Emitter(working_directory: str, file_path: str, content: str) -> str:
    """Safely write content to a file inside the working directory.

    Ensures:
    - The file path cannot escape the working directory.
    - Parent directories are created if missing.
    - File content is written using UTF-8.

    Args:
        working_directory: Base folder where the file must be created.
        file_path: Relative path to the target file inside the working directory.
        content: The text content to write into the file.
    """
    # Convert to absolute paths
    abs_working_dir = os.path.abspath(working_directory)
    abs_file_path = os.path.abspath(os.path.join(working_directory, file_path))

    # --- SAFETY CHECK 1: Prevent directory escape ---
    if not abs_file_path.startswith(abs_working_dir):
        return f'Error: "{file_path}" is not in the working directory'

    # --- Ensure parent directories exist ---
    parent_dir = os.path.dirname(abs_file_path)
    if not os.path.isdir(parent_dir):
        try:
            os.makedirs(parent_dir)
        except Exception as e:
            return f'Could not create parent dirs: "{parent_dir}" → {e}'

    # --- Write the file ---
    try:
        with open(abs_file_path, "w", encoding="utf-8") as f:
            f.write(content)

        return (
            f'Successfully wrote to "{file_path}" '
            f'({len(content)} characters)'
        )
    except Exception as e:
        return f'Failed to write to file "{file_path}": {e}'


#print(Code_Emitter(r"E:\-BugX", r"test.txt","Hello I am Ravikrishna"))

"""
schema_code_emitter = types.FunctionDeclaration(
    name="Code_Emitter",
    description="Writes a file inside the working directory safely.",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "file_path": types.Schema(
                type=types.Type.STRING,
                description="Relative path of the file to write inside the working directory."
            ),
            "content": types.Schema(
                type=types.Type.STRING,
                description="Text content to write into the file."
            ),
        },
        required=["file_path", "content"]
    ),
)
"""