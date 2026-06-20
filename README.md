# Recipe Scaler

A React + Vite application for scaling recipe ingredient measurements in real time.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open the URL shown by Vite.

## Project structure

- `src/App.tsx` — main UI and controls
- `src/main.tsx` — app bootstrap
- `src/utils/recipeParser.ts` — measurement parsing, scaling, formatting
- `src/App.module.css` — UI styles

## Next steps

- Add copy/export buttons
- Add keyboard accessibility improvements
- Add unit tests for parser utilities

## Streamlit frontend workflow

This project now includes a Streamlit frontend that sends recipe scaling requests through the agent pipeline:

- Streamlit UI in `app.py`
- Agent routing in `agent.py`
- Scaling, conversion, and knowledge tools in `tools.py`

### Run the Streamlit app

```bash
python3 -m pip install -r requirements.txt
streamlit run app.py
```
