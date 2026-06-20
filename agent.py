import os
import re

try:
    from google import genai
    GEMINI_CLIENT = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
except Exception:
    GEMINI_CLIENT = None

from tools import (
    convert_cups_to_ml,
    convert_cups_to_grams,
    get_cooking_tip,
    get_measurement_details,
    query_knowledge_base,
    scale,
    scale_recipe_text,
)

TOOLS = {
    "scale_recipe": scale_recipe_text,
    "scale": scale,
    "cup_to_ml": convert_cups_to_ml,
    "cup_to_grams": convert_cups_to_grams,
    "knowledge": query_knowledge_base,
}

TOOL_PROMPT = """
You are a recipe assistant that can choose one tool for the user request.
Available tools:
1. scale_recipe
2. scale
3. cup_to_ml
4. cup_to_grams
5. knowledge

Reply with only one of:
scale_recipe
scale
cup_to_ml
cup_to_grams
knowledge
"""


def _extract_tool_choice(response):
    if response is None:
        return "knowledge"

    if hasattr(response, "output_text"):
        return response.output_text

    if isinstance(response, dict):
        return response.get("output_text") or response.get("text") or ""

    if hasattr(response, "output"):
        output = response.output
        if isinstance(output, list) and output:
            first = output[0]
            if isinstance(first, dict):
                content = first.get("content")
                if isinstance(content, list) and content:
                    first_content = content[0]
                    if isinstance(first_content, dict):
                        return first_content.get("text", "")
        return str(output)

    return str(response)


def choose_tool(user_query: str) -> str:
    if GEMINI_CLIENT is None:
        return _choose_tool_locally(user_query)

    prompt = TOOL_PROMPT + "\nUser request:\n" + user_query.strip()
    response = GEMINI_CLIENT.responses.create(model="gpt-4.1-mini", input=prompt)
    choice = _extract_tool_choice(response).strip().splitlines()[0].lower()
    return choice if choice in TOOLS else "knowledge"


def _choose_tool_locally(user_query: str) -> str:
    query = user_query.lower()
    if "convert" in query and "cup" in query and ("ml" in query or "milliliter" in query):
        return "cup_to_ml"
    if "convert" in query and "cup" in query and ("gram" in query or "g" in query):
        return "cup_to_grams"
    if "scale" in query and "servings" in query:
        if "recipe" in query or "ingredient" in query or "ingredients" in query:
            return "scale_recipe"
        return "scale"
    if "tip" in query or "help" in query or "advice" in query:
        return "knowledge"
    return "scale_recipe"


def _parse_cups(query: str) -> float:
    match = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*cups?", query, re.I)
    return float(match.group(1)) if match else 1.0


def _parse_scale_values(query: str):
    old_match = re.search(r"from\s+([0-9]+(?:\.[0-9]+)?)\s*servings?", query, re.I)
    new_match = re.search(r"to\s+([0-9]+(?:\.[0-9]+)?)\s*servings?", query, re.I)
    if old_match and new_match:
        return float(old_match.group(1)), float(new_match.group(1))
    numbers = re.findall(r"([0-9]+(?:\.[0-9]+)?)", query)
    if len(numbers) >= 2:
        return float(numbers[-2]), float(numbers[-1])
    return 1.0, 1.0


def _parse_quantity(query: str) -> float:
    match = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*cups?", query, re.I)
    if match:
        return float(match.group(1))
    match = re.search(r"([0-9]+(?:\.[0-9]+)?)", query)
    return float(match.group(1)) if match else 1.0


def agent(user_query: str) -> str:
    tool_choice = choose_tool(user_query)

    if tool_choice == "scale_recipe":
        current_servings, desired_servings = _parse_scale_values(user_query)
        scaled_text = TOOLS[tool_choice](user_query, current_servings, desired_servings)
        return f"Scaled recipe:\n{scaled_text}"

    if tool_choice == "scale":
        quantity = _parse_quantity(user_query)
        current_servings, desired_servings = _parse_scale_values(user_query)
        result = TOOLS[tool_choice](quantity, current_servings, desired_servings)
        factor = desired_servings / current_servings if current_servings else 1.0
        return f"Scaled quantity: {quantity} × {factor:.2f} = {result}"

    if tool_choice == "cup_to_ml":
        cups = _parse_cups(user_query)
        result = TOOLS[tool_choice](cups)
        return f"{cups} cups = {result} ml"

    if tool_choice == "cup_to_grams":
        cups = _parse_cups(user_query)
        result = TOOLS[tool_choice](cups)
        return f"{cups} cups = {result} g"

    return TOOLS[tool_choice](user_query)


def recipe_agent(recipe_name: str, recipe_text: str, current_servings: int, desired_servings: int) -> dict:
    user_query = f"Scale this recipe from {current_servings} servings to {desired_servings} servings:\n{recipe_text}"
    tool_choice = choose_tool(user_query)

    if tool_choice == "knowledge":
        return {"tool": tool_choice, "answer": TOOLS[tool_choice](user_query)}

    scaled_recipe = TOOLS[tool_choice](recipe_text, current_servings, desired_servings)
    details = get_measurement_details(recipe_text, current_servings, desired_servings)
    tip = get_cooking_tip(recipe_text)

    return {
        "tool": tool_choice,
        "recipe_name": recipe_name,
        "scaled_recipe": scaled_recipe,
        "details": details,
        "tip": tip,
        "current_servings": current_servings,
        "desired_servings": desired_servings,
    }
