
#File Delete/Move Tool	Helps refactoring

import os
import shutil
from langchain.tools import tool


@tool
def File_Delete_Move(
    working_directory: str,
    action: str,
    source_path: str,
    destination_path: str = ""
) -> str:
    """
    Delete or move files/directories inside the working directory.

    Use this tool to:
    - Delete a file or directory
    - Move or rename a file or directory

    Args:
        working_directory: Root directory for all operations.
        action: One of: "delete", "move".
        source_path: Relative path to the file or directory to delete/move.
        destination_path: Relative target path for move (ignored for delete).

    Returns:
        A status message describing the result of the operation.
    """
    abs_working_dir = os.path.abspath(working_directory)
    abs_source = os.path.abspath(os.path.join(working_directory, source_path))

    # Safety: ensure source is inside workspace
    if not abs_source.startswith(abs_working_dir):
        return f'Error: "source_path" ({source_path}) is outside the working directory'

    if action not in {"delete", "move"}:
        return 'Error: "action" must be either "delete" or "move"'

    if not os.path.exists(abs_source):
        return f'Error: Source path "{source_path}" does not exist'

    # DELETE
    if action == "delete":
        try:
            if os.path.isfile(abs_source) or os.path.islink(abs_source):
                os.remove(abs_source)
                return f'Successfully deleted file: "{source_path}"'
            elif os.path.isdir(abs_source):
                shutil.rmtree(abs_source)
                return f'Successfully deleted directory: "{source_path}"'
            else:
                return f'Error: "{source_path}" is neither a file nor a directory'
        except Exception as e:
            return f'Error deleting "{source_path}": {e}'

    # MOVE
    if action == "move":
        if not destination_path:
            return 'Error: "destination_path" is required when action="move"'

        abs_destination = os.path.abspath(os.path.join(working_directory, destination_path))

        # Safety: ensure destination is also inside workspace
        if not abs_destination.startswith(abs_working_dir):
            return f'Error: "destination_path" ({destination_path}) is outside the working directory'

        try:
            # Ensure parent dir exists
            dest_parent = os.path.dirname(abs_destination)
            os.makedirs(dest_parent, exist_ok=True)

            shutil.move(abs_source, abs_destination)
            return f'Successfully moved "{source_path}" → "{destination_path}"'
        except Exception as e:
            return f'Error moving "{source_path}" to "{destination_path}": {e}'
