import os
from google.genai import types
from langchain.tools import tool


@tool
def Meta_Scanner(working_directory: str, directory: str = None) -> str:
    """Scan a directory and return metadata for each file/folder.

    Shows:
    - name
    - size in bytes
    - whether it is a directory

    If no directory is provided, scans the working directory.

    Args:
        working_directory: Base directory for safe scanning.
        directory: Optional target directory to scan.
    """
    # Convert working directory to absolute
    abs_working_dir = os.path.abspath(working_directory)

    # Default: scan working directory itself
    if directory is None:
        abs_directory = abs_working_dir
    else:
        abs_directory = os.path.abspath(directory)

    # Validate directory
    if not os.path.isdir(abs_directory):
        return f"Error: '{abs_directory}' is not a valid directory"

    final_response = ""

    # Attempt to list directory contents
    try:
        contents = os.listdir(abs_directory)
    except Exception as e:
        return f"Error reading directory: {e}"

    # Collect metadata
    for content in contents:
        content_path = os.path.join(abs_directory, content)
        is_dir = os.path.isdir(content_path)

        try:
            size = os.path.getsize(content_path)
        except:
            size = 0

        final_response += (
            f"{content} → size: {size} bytes, is_dir: {is_dir}\n"
        )

    return final_response

#print(Meta_Scanner("E:\-BugX"))


"""
schema_meta_scanner = types.FunctionDeclaration(
    name="Meta_Scanner",
    description="Lists files in the specified directory along with their sizes, constrained to the working directory.",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "directory": types.Schema(
                type=types.Type.STRING,
                description="The directory to list files from, relative to the working directory. If not provided, lists files in the working directory itself.",
            ),
        },
    ),
)

"""

"""

Example
.env → size: 54 bytes, is_dir: False
.git → size: 4096 bytes, is_dir: True
.gitignore → size: 11 bytes, is_dir: False
app.py → size: 955 bytes, is_dir: False
config.py → size: 466 bytes, is_dir: False
LICENSE → size: 1070 bytes, is_dir: False
requirements.txt → size: 43 bytes, is_dir: False
tools → size: 0 bytes, is_dir: True
venv → size: 0 bytes, is_dir: True
__pycache__ → size: 0 bytes, is_dir: True
"""