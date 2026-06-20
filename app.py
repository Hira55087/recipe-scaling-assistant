import json
from pathlib import Path

import streamlit as st

from agent import recipe_agent

st.set_page_config(page_title="Recipe Scaler", layout="centered")

PAGE_STYLE = """
<style>
:root {
  color-scheme: light;
}
.stApp {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem 1rem 2rem;
}
.stApp > header {
  padding-bottom: 0.5rem;
}
.stButton > button {
  border-radius: 999px;
  padding: 0.9rem 1.6rem;
  font-weight: 600;
}
.stTextInput>div>div>input,
.stNumberInput>div>div>input,
.stTextArea>div>div>textarea {
  border-radius: 14px;
  border: 1px solid #d1d5db;
  padding: 0.9rem;
}
.stTextArea>div>div>textarea {
  min-height: 180px;
}
.stAlert {
  border-radius: 16px;
}
.stMarkdown h1,
.stMarkdown h2,
.stMarkdown h3,
.stMarkdown h4 {
  margin-top: 1.2rem;
}
</style>
"""

st.markdown(PAGE_STYLE, unsafe_allow_html=True)

HISTORY_PATH = Path(__file__).parent / "recipe_history.json"


def load_history():
    if not HISTORY_PATH.exists():
        return []
    try:
        return json.loads(HISTORY_PATH.read_text(encoding="utf-8")) or []
    except Exception:
        return []


def save_history(history):
    try:
        HISTORY_PATH.write_text(json.dumps(history, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception:
        st.warning("Unable to save recipe history to disk.")


if "history" not in st.session_state:
    st.session_state.history = load_history()

if "page" not in st.session_state:
    st.session_state.page = "scale"

st.title("Recipe Scaler")
st.write("Front-end requests are routed through the agent, which chooses the appropriate tool and returns the scaled recipe.")

if st.session_state.page == "scale":
    with st.form("recipe_scaler_form"):
        recipe_name = st.text_input("Recipe Name")
        recipe_text = st.text_area(
            "Ingredients and instructions",
            placeholder="e.g.\n2 cups flour\n1 1/2 tsp salt\n3 eggs",
            height=220,
        )

        cols = st.columns(2)
        current_servings = cols[0].number_input("Current Servings", min_value=1, value=2, step=1)
        desired_servings = cols[1].number_input("Desired Servings", min_value=1, value=6, step=1)

        submit = st.form_submit_button("Scale Recipe")

    if submit:
        if not recipe_text.strip():
            st.error("Please enter your recipe before scaling.")
        elif current_servings <= 0 or desired_servings <= 0:
            st.error("Servings must be at least 1.")
        else:
            with st.spinner("Contacting recipe agent..."):
                result = recipe_agent(recipe_name.strip(), recipe_text.strip(), current_servings, desired_servings)

            if "scaled_recipe" in result:
                entry = {
                    "name": recipe_name.strip() or "Untitled Recipe",
                    "original": recipe_text.strip(),
                    "scaled": result["scaled_recipe"],
                    "details": result["details"],
                    "tip": result["tip"],
                    "current_servings": current_servings,
                    "desired_servings": desired_servings,
                }
                st.session_state.history.insert(0, entry)
                save_history(st.session_state.history)
                st.session_state.page = "scale"

                st.markdown("## Scaled Recipe")
                if result.get("recipe_name"):
                    st.markdown(f"**{result['recipe_name']}**")
                st.code(result["scaled_recipe"], language="")
                st.caption(f"Tool used: {result.get('tool')} | Scale factor: {round(result['desired_servings'] / result['current_servings'], 2)}x")

                if result["details"]:
                    st.markdown("### Ingredient changes")
                    for detail in result["details"]:
                        line = f"- **{detail['original']}** → {detail['scaled']}"
                        if detail.get("grams"):
                            line += f" ({detail['grams']})"
                        st.markdown(line)

                st.markdown("### Cooking Tip")
                st.info(result["tip"])
            else:
                st.markdown("## Agent result")
                st.write(result.get("answer", "No result available."))

    st.write("---")

    if st.button(f"View History ({len(st.session_state.history)})"):
        st.session_state.page = "history"

if st.session_state.page == "history":
    st.markdown("# Scaled Recipe History")
    if not st.session_state.history:
        st.info("No scaled recipes yet. Scale a recipe to add it to history.")
    else:
        for index, entry in enumerate(st.session_state.history):
            st.markdown(f"### {index + 1}. {entry['name']}")
            st.markdown(f"- Servings: {entry['current_servings']} → {entry['desired_servings']}")
            st.code(entry['scaled'], language="")
            if entry['details']:
                for detail in entry['details']:
                    line = f"- **{detail['original']}** → {detail['scaled']}"
                    if detail.get("grams"):
                        line += f" ({detail['grams']})"
                    st.markdown(line)
            st.markdown(f"**Tip:** {entry['tip']}")
            st.write("---")

    if st.button("Back to Scaler"):
        st.session_state.page = "scale"
