# Testing Tool
# Auto-validation of generated code

import os
import subprocess
from langchain.tools import tool

DEFAULT_TEST_TIMEOUT = 180  # seconds


@tool
def Test_Runner(working_directory: str, test_command: str = "") -> str:
    """
    Run automated tests / validation commands for the project.

    Use this tool when the agent wants to:
    - Run Python tests (e.g., `pytest`, `python -m pytest`)
    - Run JS/TS tests (e.g., `npm test`, `pnpm test`, `yarn test`)
    - Run any custom test or build validation command

    Args:
        working_directory: Root directory of the project.
        test_command: Optional test command to run. If empty, the tool will try
                      to auto-detect a sensible default (e.g., `pytest` or `npm test`).

    Returns:
        A formatted string containing:
            - STDOUT
            - STDERR
            - Exit code (if non-zero)
    """
    abs_working_dir = os.path.abspath(working_directory)

    if not os.path.isdir(abs_working_dir):
        return f"Error: '{abs_working_dir}' is not a valid directory"

    # --- Auto-detect test command if not provided ---
    if not test_command:
        # Python / pytest style project
        if (
            os.path.exists(os.path.join(abs_working_dir, "pytest.ini"))
            or os.path.exists(os.path.join(abs_working_dir, "pyproject.toml"))
            or os.path.isdir(os.path.join(abs_working_dir, "tests"))
        ):
            test_command = "pytest"

        # Node / package.json project
        elif os.path.exists(os.path.join(abs_working_dir, "package.json")):
            test_command = "npm test"

        else:
            return (
                "Error: Could not auto-detect test command. "
                "Please provide 'test_command' explicitly "
                "(e.g., 'pytest', 'python -m pytest', 'npm test')."
            )

    try:
        result = subprocess.run(
            test_command,
            shell=True,
            cwd=abs_working_dir,
            timeout=DEFAULT_TEST_TIMEOUT,
            capture_output=True,
            text=True,
        )

        stdout = result.stdout or ""
        stderr = result.stderr or ""

        output = f"""COMMAND:
{test_command}

STDOUT:
{stdout}
STDERR:
{stderr}
"""

        if not stdout.strip() and not stderr.strip():
            output += "No output produced by test command.\n"

        if result.returncode == 0:
            output += "\nResult:  Tests completed successfully (exit code 0)\n"
        else:
            output += f"\nResult:  Tests failed (exit code {result.returncode})\n"

        return output

    except subprocess.TimeoutExpired:
        return (
            f"Error: Test command timed out after {DEFAULT_TEST_TIMEOUT} seconds: "
            f"'{test_command}'"
        )
    except Exception as e:
        return f"Error: Failed to run test command '{test_command}': {e}"
