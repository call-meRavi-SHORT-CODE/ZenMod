import re

# --- Function to parse PlannerTool response ---
def parse_response(response: str):
    result = {
        "project": "",
        "reply": "",
        "focus": "",
        "plans": {},
        "summary": ""
    }

    current_section = None
    current_step = None

    for line in response.split("\n"):
        line = line.strip()

        if line.startswith("Plan:"):
            current_section = "plans"
        elif line.startswith("Summary:"):
            current_section = "summary"
            result["summary"] = line.split(":", 1)[1].strip()
        elif current_section == "reply":
            result["reply"] += " " + line
        elif current_section == "focus":
            result["focus"] += " " + line
        elif current_section == "plans":
            match = re.match(r"(?:- \[ \] )?Step\s*(\d+):\s*(.*)", line)
            if match:
                current_step = int(match.group(1))
                step_text = match.group(2).strip()
                result["plans"][current_step] = step_text
            elif current_step:
                result["plans"][current_step] += " " + line
        elif current_section == "summary":
            result["summary"] += " " + line.replace("```", "")

    # Clean up whitespace
    for key in result:
        if isinstance(result[key], str):
            result[key] = result[key].strip()

    return result