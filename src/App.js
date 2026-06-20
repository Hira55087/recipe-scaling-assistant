import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from 'react';
import { getMeasurementDetails, scaleRecipeText } from './utils/recipeParser';
import styles from './App.module.css';
const HISTORY_STORAGE_KEY = 'recipeHistory';
function App() {
    const [recipeText, setRecipeText] = useState('');
    const [originalServings, setOriginalServings] = useState(4);
    const [scale, setScale] = useState(1);
    const [history, setHistory] = useState(() => {
        try {
            const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            return savedHistory ? JSON.parse(savedHistory) : [];
        }
        catch {
            return [];
        }
    });
    const [showHistory, setShowHistory] = useState(false);
    // Save history to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        }
        catch {
            // Ignore storage errors in private mode or if localStorage is unavailable
        }
    }, [history]);
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
    // Auto-save recipe to history when recipe text changes or scale/original servings update
    useEffect(() => {
        if (!recipeText.trim()) {
            return;
        }
        const recipeName = recipeText.split('\n')[0] || 'Untitled Recipe';
        setHistory((prevHistory) => {
            const lastEntry = prevHistory[0];
            if (lastEntry?.recipeText === recipeText) {
                if (lastEntry.originalServings === originalServings && lastEntry.scale === scale) {
                    return prevHistory; // No change
                }
                const updatedEntry = {
                    ...lastEntry,
                    originalServings,
                    scale,
                    timestamp: Date.now(),
                };
                return [updatedEntry, ...prevHistory.slice(1)];
            }
            const newEntry = {
                id: Date.now().toString(),
                recipeName,
                recipeText,
                originalServings,
                scale,
                timestamp: Date.now(),
            };
            const updated = [newEntry, ...prevHistory];
            return updated.slice(0, 20);
        });
    }, [recipeText, originalServings, scale]);
    const handleLoadFromHistory = (entry) => {
        setRecipeText(entry.recipeText);
        setOriginalServings(entry.originalServings);
        setScale(entry.scale);
        setShowHistory(false);
    };
    const handleDeleteFromHistory = (id) => {
        setHistory(history.filter((entry) => entry.id !== id));
    };
    const quickScaleOptions = [0.5, 1, 1.5, 2];
    return (_jsxs("div", { className: styles.app, children: [_jsxs("header", { className: styles.header, children: [_jsx("h1", { className: styles.title, children: "Recipe Scaler" }), _jsx("p", { className: styles.subtitle, children: "Paste your recipe, set original servings, and use the slider to scale ingredients. Recipes are automatically saved to history." })] }), _jsxs("div", { className: styles.grid, children: [_jsxs("section", { className: styles.panel, children: [_jsx("label", { className: styles.label, htmlFor: "recipe-input", children: "Recipe input" }), _jsx("textarea", { id: "recipe-input", className: styles.textarea, value: recipeText, onChange: (event) => setRecipeText(event.target.value), placeholder: "Paste your recipe here... (automatically saved to history)" }), _jsxs("div", { className: styles.servingSection, children: [_jsx("div", { className: styles.servingRow, children: _jsxs("div", { className: styles.servingField, children: [_jsx("label", { className: styles.label, htmlFor: "original-servings", children: "Original servings" }), _jsx("input", { id: "original-servings", type: "number", className: styles.servingInput, min: "1", value: originalServings, onChange: handleOriginalServingsChange, "aria-label": "Original recipe servings" })] }) }), _jsxs("div", { className: styles.servingRow, children: [_jsx("label", { className: styles.label, htmlFor: "scale-slider", children: "Scaling factor" }), _jsx("input", { id: "scale-slider", type: "range", min: "0.25", max: "4", step: "0.25", value: scale, onChange: handleScaleChange, className: styles.slider, "aria-label": "Scaling factor slider" }), _jsxs("span", { className: styles.scaleValue, children: [scale, "x"] })] }), _jsxs("div", { className: styles.scaleFactorDisplay, children: ["Scaling Factor: ", _jsxs("strong", { children: [scale, "x"] }), " (Scaled for ", Math.round(originalServings * scale), " servings)"] })] }), _jsx("div", { className: styles.controlRow, children: _jsx("div", { className: styles.label, children: "Quick scales" }) }), _jsx("div", { className: styles.buttonGroup, children: quickScaleOptions.map((value) => (_jsxs("button", { type: "button", className: `${styles.quickButton} ${scale === value ? styles.activeButton : ''}`, onClick: () => handleQuickScale(value), children: [value, "x"] }, value))) }), _jsx("div", { className: styles.controlRow, children: _jsx("button", { type: "button", className: styles.button, onClick: handleReset, children: "Reset recipe" }) }), _jsx("div", { className: styles.controlRow, children: _jsxs("button", { type: "button", className: `${styles.button} ${showHistory ? styles.activeButton : ''}`, onClick: () => setShowHistory(!showHistory), children: ["View history (", history.length, ")"] }) })] }), _jsxs("section", { className: styles.panel, children: [_jsx("div", { className: styles.label, children: "Scaled recipe preview" }), _jsx("div", { className: styles.preview, "aria-live": "polite", children: scaledSegments.map((segment, index) => (_jsx("span", { className: segment.isMeasurement ? styles.highlight : undefined, children: segment.text }, index))) }), measurementDetails.length > 0 ? (_jsxs("div", { className: styles.detailsBlock, children: [_jsx("div", { className: styles.label, children: "Ingredient scaling details" }), _jsx("ul", { className: styles.detailList, children: measurementDetails.map((detail, index) => (_jsx("li", { className: styles.detailItem, children: _jsxs("div", { className: styles.detailRow, children: [_jsxs("div", { className: styles.detailConversion, children: [_jsx("strong", { children: detail.originalText }), detail.gramConversion && (_jsxs("span", { className: styles.gramValue, children: [" \u2192 ", detail.gramConversion] }))] }), _jsx("div", { className: styles.detailArrow, children: "\u2192" }), _jsx("div", { className: styles.detailScaled, children: detail.scaledText })] }) }, index))) })] })) : (_jsx("p", { className: styles.smallNote, children: "No ingredient measurements detected yet." })), _jsx("p", { className: styles.footer, children: "Measurements highlighted in the preview are updated automatically based on serving size." })] }), showHistory && (_jsxs("section", { className: styles.panel, children: [_jsx("div", { className: styles.label, children: "Recipe History" }), history.length === 0 ? (_jsx("p", { className: styles.smallNote, children: "No saved recipes yet. Scale a recipe and click \"Save to history\"." })) : (_jsx("ul", { className: styles.historyList, children: history.map((entry) => (_jsxs("li", { className: styles.historyItem, children: [_jsx("div", { className: styles.historyItemName, children: entry.recipeName }), _jsxs("div", { className: styles.historyItemDetails, children: [entry.originalServings, " servings \u2192 ", entry.scale, "x"] }), _jsx("div", { className: styles.historyItemDate, children: new Date(entry.timestamp).toLocaleDateString() }), _jsxs("div", { className: styles.historyItemActions, children: [_jsx("button", { type: "button", className: styles.smallButton, onClick: () => handleLoadFromHistory(entry), children: "Load" }), _jsx("button", { type: "button", className: `${styles.smallButton} ${styles.deleteButton}`, onClick: () => handleDeleteFromHistory(entry.id), children: "Delete" })] })] }, entry.id))) }))] }))] })] }));
}
export default App;
//# sourceMappingURL=App.js.map