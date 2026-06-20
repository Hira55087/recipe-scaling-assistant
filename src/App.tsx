import { ChangeEvent, useMemo, useState, useEffect } from 'react';
import { getMeasurementDetails, scaleRecipeText } from './utils/recipeParser';
import styles from './App.module.css';

interface RecipeHistory {
  id: string;
  recipeName: string;
  recipeText: string;
  originalServings: number;
  scale: number;
  timestamp: number;
}

const HISTORY_STORAGE_KEY = 'recipeHistory';

function App() {
  const [recipeText, setRecipeText] = useState('');
  const [originalServings, setOriginalServings] = useState(4);
  const [scale, setScale] = useState(1);
  const [history, setHistory] = useState<RecipeHistory[]>(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage errors in private mode or if localStorage is unavailable
    }
  }, [history]);

  const scaledSegments = useMemo(
    () => scaleRecipeText(recipeText, scale),
    [recipeText, scale],
  );

  const measurementDetails = useMemo(
    () => getMeasurementDetails(recipeText, scale),
    [recipeText, scale],
  );

  const handleScaleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setScale(value);
  };

  const handleOriginalServingsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (value > 0) {
      setOriginalServings(value);
    }
  };

  const handleQuickScale = (value: number) => {
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

      const newEntry: RecipeHistory = {
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

  const handleLoadFromHistory = (entry: RecipeHistory) => {
    setRecipeText(entry.recipeText);
    setOriginalServings(entry.originalServings);
    setScale(entry.scale);
    setShowHistory(false);
  };

  const handleDeleteFromHistory = (id: string) => {
    setHistory(history.filter((entry) => entry.id !== id));
  };

  const quickScaleOptions = [0.5, 1, 1.5, 2];

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Recipe Scaler</h1>
        <p className={styles.subtitle}>
          Paste your recipe, set original servings, and use the slider to scale ingredients. Recipes are automatically saved to history.
        </p>
      </header>

      <div className={styles.grid}>
        <section className={styles.panel}>
          <label className={styles.label} htmlFor="recipe-input">
            Recipe input
          </label>
          <textarea
            id="recipe-input"
            className={styles.textarea}
            value={recipeText}
            onChange={(event) => setRecipeText(event.target.value)}
            placeholder="Paste your recipe here... (automatically saved to history)"
          />

          <div className={styles.servingSection}>
            <div className={styles.servingRow}>
              <div className={styles.servingField}>
                <label className={styles.label} htmlFor="original-servings">
                  Original servings
                </label>
                <input
                  id="original-servings"
                  type="number"
                  className={styles.servingInput}
                  min="1"
                  value={originalServings}
                  onChange={handleOriginalServingsChange}
                  aria-label="Original recipe servings"
                />
              </div>
            </div>

            <div className={styles.servingRow}>
              <label className={styles.label} htmlFor="scale-slider">
                Scaling factor
              </label>
              <input
                id="scale-slider"
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={scale}
                onChange={handleScaleChange}
                className={styles.slider}
                aria-label="Scaling factor slider"
              />
              <span className={styles.scaleValue}>{scale}x</span>
            </div>

            <div className={styles.scaleFactorDisplay}>
              Scaling Factor: <strong>{scale}x</strong> (Scaled for {Math.round(originalServings * scale)} servings)
            </div>
          </div>

          <div className={styles.controlRow}>
            <div className={styles.label}>Quick scales</div>
          </div>
          <div className={styles.buttonGroup}>
            {quickScaleOptions.map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.quickButton} ${scale === value ? styles.activeButton : ''}`}
                onClick={() => handleQuickScale(value)}
              >
                {value}x
              </button>
            ))}
          </div>

          <div className={styles.controlRow}>
            <button type="button" className={styles.button} onClick={handleReset}>
              Reset recipe
            </button>
          </div>

          <div className={styles.controlRow}>
            <button
              type="button"
              className={`${styles.button} ${showHistory ? styles.activeButton : ''}`}
              onClick={() => setShowHistory(!showHistory)}
            >
              View history ({history.length})
            </button>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.label}>Scaled recipe preview</div>
          <div className={styles.preview} aria-live="polite">
            {scaledSegments.map((segment, index) => (
              <span
                key={index}
                className={segment.isMeasurement ? styles.highlight : undefined}
              >
                {segment.text}
              </span>
            ))}
          </div>

          {measurementDetails.length > 0 ? (
            <div className={styles.detailsBlock}>
              <div className={styles.label}>Ingredient scaling details</div>
              <ul className={styles.detailList}>
                {measurementDetails.map((detail, index) => (
                  <li key={index} className={styles.detailItem}>
                    <div className={styles.detailRow}>
                      <div className={styles.detailConversion}>
                        <strong>{detail.originalText}</strong> 
                        {detail.gramConversion && (
                          <span className={styles.gramValue}> → {detail.gramConversion}</span>
                        )}
                      </div>
                      <div className={styles.detailArrow}>→</div>
                      <div className={styles.detailScaled}>
                        {detail.scaledText}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className={styles.smallNote}>No ingredient measurements detected yet.</p>
          )}

          <p className={styles.footer}>
            Measurements highlighted in the preview are updated automatically based on serving size.
          </p>
        </section>

        {showHistory && (
          <section className={styles.panel}>
            <div className={styles.label}>Recipe History</div>
            {history.length === 0 ? (
              <p className={styles.smallNote}>No saved recipes yet. Scale a recipe and click "Save to history".</p>
            ) : (
              <ul className={styles.historyList}>
                {history.map((entry) => (
                  <li key={entry.id} className={styles.historyItem}>
                    <div className={styles.historyItemName}>{entry.recipeName}</div>
                    <div className={styles.historyItemDetails}>
                      {entry.originalServings} servings → {entry.scale}x
                    </div>
                    <div className={styles.historyItemDate}>
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <div className={styles.historyItemActions}>
                      <button
                        type="button"
                        className={styles.smallButton}
                        onClick={() => handleLoadFromHistory(entry)}
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        className={`${styles.smallButton} ${styles.deleteButton}`}
                        onClick={() => handleDeleteFromHistory(entry.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
