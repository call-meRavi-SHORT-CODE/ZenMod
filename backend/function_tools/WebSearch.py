# Web Search Tool (Using DuckDuckGoSearchRun)
# Compatible with LangChain v0.2–0.3+

from langchain.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun


@tool
def Web_Search(query: str, max_results: int = 5) -> list:
    """
    Perform a web search using DuckDuckGo.

    Args:
        query: Search query string.
        max_results: Maximum number of results to return (default: 5)

    Returns:
        A list of search result dictionaries:
        [
            {
                "title": "...",
                "snippet": "...",
                "url": "..."
            },
            ...
        ]
    """

    try:
        search = DuckDuckGoSearchRun()
        raw_results = search.run(query)

        # DuckDuckGoSearchRun returns a string → split into lines
        lines = raw_results.split("\n")

        formatted = []

        for line in lines[:max_results]:
            parts = line.split(" | ")

            # Each line is typically: "Title | Snippet | URL"
            if len(parts) == 3:
                title, snippet, url = parts
            else:
                title = line
                snippet = ""
                url = ""

            formatted.append({
                "title": title.strip(),
                "snippet": snippet.strip(),
                "url": url.strip(),
            })

        return formatted

    except Exception as e:
        return [f"Error during web search: {e}"]
