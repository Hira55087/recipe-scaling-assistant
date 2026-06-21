import streamlit as st
from agent import recipe_agent

def scaler_page():

    st.title("Recipe Scaler")
    st.write(f"Welcome {st.session_state.user} 👋")

    recipe_name = st.text_input("Recipe Name")
    recipe_text = st.text_area("Ingredients")

    col1, col2 = st.columns(2)
    current = col1.number_input("Current Servings", 1, 100, 2)
    desired = col2.number_input("Desired Servings", 1, 100, 6)

    if st.button("Scale Recipe"):

        result = recipe_agent(recipe_name, recipe_text, current, desired)

        st.code(result["scaled_recipe"])
        st.info(result["tip"])