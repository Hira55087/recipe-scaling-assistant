import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { getMeasurementDetails, scaleRecipeText } from './utils/recipeParser';
import styles from './App.module.css';
const defaultRecipe = `Classic Chocolate Chip Cookies (Makes 24 cookies, 12 servings)
- 1 ⅞ cups All-purpose flour
- ¾ tsp Baking soda
- ¾ tsp Salt
- ¾ cup plus 1 tbsp Butter, softened
- ⅝ cup Granulated sugar (approx. 10 tbsp)
- ⅝ cup Packed brown sugar (approx. 10 tbsp)
- 2 Large eggs (See note below)
- 1 ½ tsp Vanilla extract
- 1 ⅔ cups Chocolate chips
`;
function App() {
    const [recipeText, setRecipeText] = useState(defaultRecipe);
    const [originalServings, setOriginalServings] = useState(4);
    const [scale, setScale] = useState(1);
    const scaledSegments = useMemo(() => scaleRecipeText(recipeText, scale), [recipeText, scale]);
    const measurementDetails = useMemo(() => getMeasurementDetails(recipeText, scale), [recipeText, scale]);
    const handleScaleChange = (event) => {
        const value = Number(event.target.value);
        setScale(value);
    };
    const handleOriginalServingsChange = (event) => {
        const value = Number(event.target.value);
        if (value > 0) {
            setOriginalServings(value);
        }
    };
    const handleQuickScale = (value) => {
        setScale(value);
    };
    const handleReset = () => {
        setRecipeText('');
        setOriginalServings(4);
        setScale(1);
    };
    const quickScaleOptions = [0.5, 1, 1.5, 2];
    return (_jsxs("div", { className: styles.app, children: [_jsxs("header", { className: styles.header, children: [_jsx("h1", { className: styles.title, children: "Recipe Scaler" }), _jsx("p", { className: styles.subtitle, children: "Paste your recipe, set original servings, and use the slider to scale ingredients instantly." })] }), _jsxs("div", { className: styles.grid, children: [_jsxs("section", { className: styles.panel, children: [_jsx("label", { className: styles.label, htmlFor: "recipe-input", children: "Recipe input" }), _jsx("textarea", { id: "recipe-input", className: styles.textarea, value: recipeText, onChange: (event) => setRecipeText(event.target.value), placeholder: "Paste your recipe here..." }), _jsxs("div", { className: styles.servingSection, children: [_jsx("div", { className: styles.servingRow, children: _jsxs("div", { className: styles.servingField, children: [_jsx("label", { className: styles.label, htmlFor: "original-servings", children: "Original servings" }), _jsx("input", { id: "original-servings", type: "number", className: styles.servingInput, min: "1", value: originalServings, onChange: handleOriginalServingsChange, "aria-label": "Original recipe servings" })] }) }), _jsxs("div", { className: styles.servingRow, children: [_jsx("label", { className: styles.label, htmlFor: "scale-slider", children: "Scaling factor" }), _jsx("input", { id: "scale-slider", type: "range", min: "0.25", max: "4", step: "0.25", value: scale, onChange: handleScaleChange, className: styles.slider, "aria-label": "Scaling factor slider" }), _jsxs("span", { className: styles.scaleValue, children: [scale, "x"] })] }), _jsxs("div", { className: styles.scaleFactorDisplay, children: ["Scaling Factor: ", _jsxs("strong", { children: [scale, "x"] }), " (Scaled for ", Math.round(originalServings * scale), " servings)"] })] }), _jsx("div", { className: styles.controlRow, children: _jsx("div", { className: styles.label, children: "Quick scales" }) }), _jsx("div", { className: styles.buttonGroup, children: quickScaleOptions.map((value) => (_jsxs("button", { type: "button", className: `${styles.quickButton} ${scale === value ? styles.activeButton : ''}`, onClick: () => handleQuickScale(value), children: [value, "x"] }, value))) }), _jsx("div", { className: styles.controlRow, children: _jsx("button", { type: "button", className: styles.button, onClick: handleReset, children: "Reset recipe" }) })] }), _jsxs("section", { className: styles.panel, children: [_jsx("div", { className: styles.label, children: "Scaled recipe preview" }), _jsx("div", { className: styles.preview, "aria-live": "polite", children: scaledSegments.map((segment, index) => (_jsx("span", { className: segment.isMeasurement ? styles.highlight : undefined, children: segment.text }, index))) }), measurementDetails.length > 0 ? (_jsxs("div", { className: styles.detailsBlock, children: [_jsx("div", { className: styles.label, children: "Ingredient scaling details" }), _jsx("ul", { className: styles.detailList, children: measurementDetails.map((detail, index) => (_jsxs("li", { className: styles.detailItem, children: [_jsx("strong", { children: detail.originalText }), " \u2192 ", detail.scaledText] }, index))) })] })) : (_jsx("p", { className: styles.smallNote, children: "No ingredient measurements detected yet." })), _jsx("p", { className: styles.footer, children: "Measurements highlighted in the preview are updated automatically based on serving size." })] })] })] }));
}
export default App;
//# sourceMappingURL=App.js.map