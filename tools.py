import re

COMMON_FRACTIONS = {
    "½": 0.5,
    "⅓": 1/3,
    "⅔": 2/3,
    "¼": 0.25,
    "¾": 0.75,
    "⅕": 0.2,
    "⅖": 0.4,
    "⅗": 0.6,
    "⅘": 0.8,
    "⅙": 1/6,
    "⅚": 5/6,
    "⅐": 1/7,
    "⅛": 0.125,
    "⅜": 0.375,
    "⅝": 0.625,
    "⅞": 0.875,
}

VALUE_PATTERN = r"(?:\d+\s+\d+/\d+|\d+/\d+|\d+\.\d+|\d+(?:[\u00BC-\u00BE\u2150-\u215E])|[\u00BC-\u00BE\u2150-\u215E])"
UNIT_PATTERN = r"cups?|tablespoons?|tbsp|tsp|ounces?|oz|pounds?|lbs?|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|eggs?|cloves?|pieces?|slices?|slice|pinch|dashes?|dash"
MEASUREMENT_PATTERN = rf"(?P<value>{VALUE_PATTERN})\s*(?P<unit>{UNIT_PATTERN})\b"
MEASUREMENT_REGEX = re.compile(MEASUREMENT_PATTERN, re.IGNORECASE)

VALUE_PATTERN = r"(?:\d+\s+\d+/\d+|\d+/\d+|\d+\.\d+|\d+[\u00BC-\u00BE\u2150-\u215E]|\d+|[\u00BC-\u00BE\u2150-\u215E])"
UNIT_PATTERN = r"cups?|tablespoons?|tbsp|tsp|ounces?|oz|pounds?|lbs?|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|eggs?|cloves?|pieces?|slices?|slice|pinch|dashes?|dash"
MEASUREMENT_PATTERN = rf"(?P<value>{VALUE_PATTERN})\s*(?P<unit>{UNIT_PATTERN})\b"
MEASUREMENT_REGEX = re.compile(MEASUREMENT_PATTERN, re.IGNORECASE)

LINE_QUANTITY_PATTERN = re.compile(rf"^(?P<value>{VALUE_PATTERN})\s+(?P<unit>{UNIT_PATTERN})\b(?P<rest>.*)$", re.IGNORECASE)

GRAM_FACTORS = {
    "cup": 120.0,
    "cups": 120.0,
    "tbsp": 15.0,
    "tablespoon": 15.0,
    "tablespoons": 15.0,
    "tsp": 5.0,
    "teaspoon": 5.0,
    "teaspoons": 5.0,
}

RAG_KNOWLEDGE = [
    {
        "topics": ["scale", "servings", "recipe"],
        "answer": "To scale a recipe, multiply each ingredient quantity by the ratio of desired servings to current servings.",
    },
    {
        "topics": ["cup", "ml", "milliliter"],
        "answer": "In this project, one cup is treated as 240 milliliters.",
    },
    {
        "topics": ["cup", "gram", "g"],
        "answer": "A common conversion used here is 1 cup ≈ 120 grams for dry ingredients like flour.",
    },
    {
        "topics": ["bowl", "mix", "stir"],
        "answer": "Use a larger mixing bowl when you increase recipe volume to avoid spills and make stirring easier.",
    },
]


def parse_amount(value: str) -> float:
    value = value.strip()
    if value in COMMON_FRACTIONS:
        return COMMON_FRACTIONS[value]

    mixed_match = re.match(r"^(\d+)\s+(\d+)/(\d+)$", value)
    if mixed_match:
        whole = float(mixed_match.group(1))
        numerator = float(mixed_match.group(2))
        denominator = float(mixed_match.group(3))
        return whole + numerator / denominator

    fraction_match = re.match(r"^(\d+)/(\d+)$", value)
    if fraction_match:
        numerator = float(fraction_match.group(1))
        denominator = float(fraction_match.group(2))
        return numerator / denominator

    unicode_fraction = ''.join(ch for ch in value if ch in COMMON_FRACTIONS)
    if unicode_fraction:
        digits = re.match(r"^(\d+)", value)
        base = float(digits.group(1)) if digits else 0.0
        return base + COMMON_FRACTIONS[unicode_fraction]

    try:
        return float(value)
    except ValueError:
        return 0.0


def greatest_common_divisor(a: int, b: int) -> int:
    while b:
        a, b = b, a % b
    return a


def format_amount(value: float) -> str:
    if abs(value) < 1e-6:
        return "0"

    rounded = round(value, 2)
    if abs(rounded - round(rounded)) < 0.01:
        return str(int(round(rounded)))

    integer_part = int(rounded)
    fraction_part = abs(rounded - integer_part)
    denominator = 16
    numerator = round(fraction_part * denominator)

    if numerator == 0:
        return str(integer_part)

    if numerator == denominator:
        return str(integer_part + 1)

    gcd = greatest_common_divisor(numerator, denominator)
    numerator //= gcd
    denominator //= gcd
    fraction_text = f"{numerator}/{denominator}"

    if integer_part == 0:
        return fraction_text
    return f"{integer_part} {fraction_text}"


def measurement_to_grams(match: re.Match, scale: float):
    unit = match.group("unit").lower()
    if unit not in GRAM_FACTORS:
        return None

    quantity = parse_amount(match.group("value")) * scale
    grams = quantity * GRAM_FACTORS[unit]
    return grams


def scale_measurement(match: re.Match, scale: float) -> str:
    original_value = parse_amount(match.group("value"))
    scaled_value = original_value * scale
    scaled_quantity_text = format_amount(scaled_value)
    return f"{scaled_quantity_text} {match.group('unit')}"


def scale_recipe_text(recipe_text: str, current_servings: float, desired_servings: float) -> str:
    if current_servings <= 0:
        raise ValueError("Current servings must be greater than zero.")
    scale = desired_servings / current_servings
    return MEASUREMENT_REGEX.sub(lambda match: scale_measurement(match, scale), recipe_text)


def get_measurement_details(recipe_text: str, current_servings: float, desired_servings: float):
    if current_servings <= 0:
        raise ValueError("Current servings must be greater than zero.")

    scale = desired_servings / current_servings
    details = []

    for line in recipe_text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue

        quantity_match = LINE_QUANTITY_PATTERN.match(stripped)
        if quantity_match:
            scaled_line = MEASUREMENT_REGEX.sub(lambda match: scale_measurement(match, scale), stripped)
            grams_total = 0.0
            grams_found = False

            for match in MEASUREMENT_REGEX.finditer(stripped):
                grams = measurement_to_grams(match, scale)
                if grams is not None:
                    grams_total += grams
                    grams_found = True

            grams_text = f"{format_amount(grams_total)} g" if grams_found else None
            details.append({
                "original": stripped,
                "scaled": scaled_line,
                "grams": grams_text,
            })

    return details


def get_cooking_tip(recipe_text: str) -> str:
    lower_text = recipe_text.lower()
    if "bowl" in lower_text or "mix" in lower_text:
        return "Use a larger mixing bowl when you scale this recipe."
    if "oven" in lower_text:
        return "Keep an eye on cook time when the recipe volume grows."
    return "Use a larger pan or bowl when scaling up to keep cooking even and avoid spills."


def scale(quantity: float, old_servings: float, new_servings: float) -> float:
    return quantity * new_servings / old_servings


def convert_cups_to_ml(cups: float) -> float:
    return cups * 240.0


def convert_cups_to_grams(cups: float, grams_per_cup: float = 120.0) -> float:
    return cups * grams_per_cup


def query_knowledge_base(query: str) -> str:
    query_lower = query.lower()
    for item in RAG_KNOWLEDGE:
        if any(topic in query_lower for topic in item["topics"]):
            return item["answer"]
    return "I don't have a precise answer in the knowledge base, but I can still help with recipe scaling and conversions."
