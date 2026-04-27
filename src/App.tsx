import { ChangeEvent, useMemo, useState } from 'react';
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

  const quickScaleOptions = [0.5, 1, 1.5, 2];

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Recipe Scaler</h1>
        <p className={styles.subtitle}>
          Paste your recipe, set original servings, and use the slider to scale ingredients instantly.
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
            placeholder="Paste your recipe here..."
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
                    <strong>{detail.originalText}</strong> → {detail.scaledText}
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
      </div>
    </div>
  );
}

export default App;
