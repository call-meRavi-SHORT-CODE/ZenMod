import os
from langchain.tools import tool

@tool
def Create_File(working_directory: str, file_path: str, content: str) -> str:
    """Create ANY type of file (any extension) safely inside the working directory.

    Ensures:
    - The file cannot escape the working directory.
    - Parent directories are created if missing.
    - File content is written using UTF-8.

    Args:
        working_directory: Root folder where files must be created.
        file_path: Relative path including filename and extension.
        content: Content to write into the file.
    """
    abs_working_dir = os.path.abspath(working_directory)
    abs_file_path = os.path.abspath(os.path.join(working_directory, file_path))

    # Safety: Prevent escaping the workspace
    if not abs_file_path.startswith(abs_working_dir):
        return f'Error: "{file_path}" is not inside the working directory'

    # Ensure parent directory exists
    parent = os.path.dirname(abs_file_path)
    try:
        os.makedirs(parent, exist_ok=True)
    except Exception as e:
        return f"Error creating directories: {e}"

    # Write file
    try:
        with open(abs_file_path, "w", encoding="utf-8") as f:
            f.write(content)

        return f'File "{file_path}" created successfully ({len(content)} chars).'
    except Exception as e:
        return f"Error writing file: {e}"
