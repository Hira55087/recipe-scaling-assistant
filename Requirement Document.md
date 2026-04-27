# Recipe Scaler - Requirements Document

## 1. Project Overview

### 1.1 Project Title
Recipe Scaler - Intelligent Recipe Ingredient Scaling Tool

### 1.2 Purpose
A web application that allows users to dynamically scale recipe ingredients up or down based on the number of servings. Users can paste any recipe and use an interactive slider to instantly adjust all measurements.

### 1.3 Problem Statement
Users often find recipes that serve 4-6 people but need to cook for a different number of servings. Manually calculating and adjusting each ingredient measurement is time-consuming and error-prone. Recipe Scaler solves this by automatically detecting and scaling all numeric measurements.

---

## 2. Functional Requirements

### 2.1 Core Features

#### FR-1: Recipe Input
- **Requirement**: Users can paste recipe text into a text input area
- **Details**:
  - Support multiple recipe formats (free text, structured formats)
  - Accept recipes of any reasonable length
  - Preserve original recipe formatting initially
  - Allow clearing/resetting the input area

#### FR-2: Ingredient Detection & Parsing
- **Requirement**: Use Regular Expressions to identify and extract numeric measurements
- **Details**:
  - Detect common measurement patterns:
    - `2 cups`, `3 tbsp`, `1.5 oz`, `4 1/2 cups`, `1/3 cup`
    - Decimals: `2.5`, `1.75`
    - Fractions: `1/2`, `3/4`, `2 1/3`
    - Mixed numbers: `2 1/2`, `3 3/4`
  - Match units: cups, tbsp, tsp, oz, kg, g, ml, l, lb, etc.
  - Support both singular and plural forms (`cup/cups`, `tablespoon/tbsp`, etc.)
  - Ignore numbers in context (recipe names, step numbers, temperatures)

#### FR-3: Interactive Scaling Slider
- **Requirement**: User can adjust scaling factor via interactive slider
- **Details**:
  - Slider range: 0.25x to 4x (or 0.25 to 10x servings scaling)
  - Display current scaling factor (e.g., "1.5x", "Scale for 6 servings")
  - Real-time visual feedback as slider moves
  - Predefined quick buttons (0.5x, 1x, 1.5x, 2x) for common scalings
  - Manual input field to enter exact scaling number

#### FR-4: Real-time Calculation & Display
- **Requirement**: Dynamically update all measurements in the recipe as slider changes
- **Details**:
  - Calculate scaled values instantly (no lag)
  - Highlight/color-code modified ingredients
  - Display original value alongside scaled value
  - Format results appropriately (reduce fractions, use decimals when needed)
  - Maintain units alongside numbers

#### FR-5: Output & Export
- **Requirement**: Users can view and copy the scaled recipe
- **Details**:
  - Display scaled recipe with updated measurements
  - "Copy to Clipboard" button for scaled recipe
  - Option to print scaled recipe
  - Option to export as plain text or PDF

#### FR-6: Result Formatting
- **Requirement**: Present scaled numbers in user-friendly format
- **Details**:
  - Convert decimals to fractions when appropriate (2.5 → "2 1/2")
  - Round to sensible precision (not 1.33333 but "1 1/3")
  - Simplify fractions (4/8 → 1/2)
  - Preserve original unit abbreviations

---

## 3. Technical Requirements

### 3.1 Architecture

#### TR-1: Frontend Framework
- **Requirement**: Build with React.js OR Vue.js
- **Rationale**: For reactive, real-time UI updates
- **Details**:
  - Choose one framework (recommend React for ecosystem, Vue for simplicity)
  - Use functional components (React) or Composition API (Vue)
  - State management for recipe input and scaling factor

#### TR-2: Regular Expression Engine
- **Requirement**: Implement robust RegEx patterns for measurement detection
- **Patterns to Support**:
  ```
  Decimals: (\d+\.\d+)
  Fractions: (\d+\/\d+)
  Mixed Numbers: (\d+\s+\d+\/\d+)
  Whole Numbers: (\d+)
  Units: (cups?|tbsp|tsp|oz|grams?|ml|liters?|lbs?|kg|etc.)
  ```
- **Accuracy**: Regex must avoid false positives (e.g., recipe IDs, timestamps)

#### TR-3: Calculation Engine
- **Requirement**: Implement fraction-to-decimal conversion and back
- **Details**:
  - Support arithmetic with fractions
  - Convert between fractions and decimals accurately
  - Simplify fractions to lowest terms
  - Libraries: Consider `fraction.js` or similar for robust fraction math

#### TR-4: Technology Stack
- **Frontend**: React.js 18+ or Vue.js 3+
- **Styling**: Tailwind CSS or CSS Modules
- **State Management**: React Context/Hooks or Vue Composition API
- **Build Tool**: Vite or Create React App
- **Version Control**: Git
- **Hosting**: Vercel, Netlify, or GitHub Pages

#### TR-5: Browser Compatibility
- **Minimum**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Support**: Responsive design for tablets and smartphones

---

## 4. User Interface & Experience Requirements

### 4.1 Layout & Navigation

#### UX-1: Main Interface Layout
- **Requirement**: Clean, intuitive single-page interface
- **Sections**:
  - Header with app title and brief description
  - Left Panel: Recipe input area
  - Right Panel: Scaled recipe preview
  - Control bar: Slider, quick buttons, manual input
  - Footer: Usage instructions, credits

#### UX-2: Input Area
- **Requirement**: User-friendly recipe pasting experience
- **Details**:
  - Large textarea for recipe input
  - Placeholder text with example recipe
  - Character count or warning if recipe is very long
  - "Reset" button to clear input

#### UX-3: Control Panel
- **Requirement**: Intuitive scaling controls
- **Details**:
  - Prominent horizontal slider with labels
  - Quick action buttons below slider
  - Manual input field with +/- buttons
  - Display current serving size or multiplier

#### UX-4: Output Preview
- **Requirement**: Clear display of scaled recipe
- **Details**:
  - Highlight modified measurements (different color/bold)
  - Show original and scaled side-by-side (optional)
  - Organized, readable format
  - Copy and print buttons

### 4.2 Visual Design

#### UX-5: Color Scheme
- **Requirement**: Professional, kitchen-friendly aesthetic
- **Details**:
  - Warm, inviting colors (oranges, greens)
  - High contrast for readability
  - Consistent color coding for original vs. scaled values

#### UX-6: Accessibility (WCAG 2.1 Level AA)
- **Requirement**: Ensure app usable by all users
- **Details**:
  - Semantic HTML
  - ARIA labels for interactive elements
  - Keyboard navigation support
  - Sufficient color contrast (4.5:1 minimum)
  - Alt text for images

---

## 5. Non-Functional Requirements

### 5.1 Performance

#### NFR-1: Response Time
- **Requirement**: Real-time scaling with <100ms latency
- **Details**: Slider interaction should feel instantaneous

#### NFR-2: Scalability
- **Requirement**: Handle recipes up to 10,000 characters
- **Details**: No performance degradation with large recipes

### 5.2 Reliability

#### NFR-3: Error Handling
- **Requirement**: Graceful handling of edge cases
- **Details**:
  - Empty recipe input
  - Invalid scaling factors
  - Malformed measurements
  - Show user-friendly error messages

#### NFR-4: Data Validation
- **Requirement**: Validate all user inputs
- **Details**:
  - Scaling factor: 0.25x - 10x
  - Recipe text: non-empty, reasonable length

### 5.3 Security

#### NFR-5: Client-Side Processing
- **Requirement**: All processing happens in the browser
- **Details**:
  - No server needed (PWA possible)
  - No user data sent to external servers
  - Safe for offline use

### 5.4 Usability

#### NFR-6: User Guidance
- **Requirement**: In-app help and documentation
- **Details**:
  - Quick start guide
  - Example recipes
  - FAQ section
  - Clear error messages

---

## 6. Use Cases

### UC-1: Basic Scaling
**Actor**: Home Cook
**Scenario**: 
1. User finds a recipe for 4 servings
2. Pastes recipe into app
3. Moves slider to 1.5x for 6 servings
4. Views updated ingredient measurements
5. Copies scaled recipe to use while cooking

### UC-2: Halving a Recipe
**Actor**: Single Cook
**Scenario**:
1. User has a recipe for 8 servings
2. Wants to cook for 2 people (0.25x)
3. Clicks "0.5x" button
4. Reviews scaled measurements (all halved)
5. Prints for kitchen use

### UC-3: Complex Fractions
**Actor**: Baker
**Scenario**:
1. Recipe calls for "2 1/2 cups flour"
2. User scales to 1.3x
3. App calculates: 2.5 × 1.3 = 3.25 = 3 1/4 cups
4. Results display as clean fractions

---

## 7. Data & Storage

### 7.1 Data Handling

#### DR-1: No Server Backend
- **Requirement**: Client-side only operation
- **Details**:
  - All computation in browser
  - Optional: localStorage for recipe history

#### DR-2: Browser Storage (Optional Feature)
- **Requirement**: Save recently scaled recipes
- **Details**:
  - Store last 5-10 recipes in localStorage
  - Clear ability for privacy

---

## 8. Testing Requirements

### 8.1 Functional Testing

#### TR-1: Unit Tests
- Test RegEx patterns with various formats
- Test fraction/decimal conversion math
- Test scaling calculations

#### TR-2: Integration Tests
- Test full workflow: input → parse → scale → display
- Test UI responsiveness

#### TR-3: User Acceptance Testing
- Test with real recipes
- Verify correctness of measurements
- Check edge cases (very large/small numbers)

### 8.2 Test Scenarios
- [x] Recipe with decimals: "2.5 cups flour"
- [x] Recipe with fractions: "1/3 cup sugar"
- [x] Recipe with mixed numbers: "2 1/2 tbsp butter"
- [x] Recipe with multiple units
- [x] Scaling up (2x, 3x)
- [x] Scaling down (0.5x, 0.25x)
- [x] Empty input
- [x] Large recipes (5000+ chars)

---

## 9. Success Criteria

### 9.1 Functional Success
- [ ] RegEx successfully identifies 95%+ of measurements
- [ ] Calculated scaling is mathematically accurate
- [ ] Fractions displayed correctly and simplified
- [ ] App handles all common units

### 9.2 UX Success
- [ ] Users can paste recipe and scale in <1 minute (first use)
- [ ] Slider interaction feels smooth and responsive
- [ ] Results are readable and clearly formatted

### 9.3 Technical Success
- [ ] No external dependencies for core calculation (except optional fraction lib)
- [ ] Sub-100ms scaling response time
- [ ] Works on desktop and mobile browsers
- [ ] 100% client-side (no network calls)

---

## 10. Deliverables

### 10.1 Development Artifacts
1. **Source Code**
   - React/Vue component structure
   - RegEx pattern utilities
   - Calculation engine
   - Styling files

2. **Documentation**
   - README with setup instructions
   - Component documentation
   - RegEx patterns explained
   - User guide

3. **Test Suite**
   - Unit tests for calculations
   - Unit tests for RegEx patterns
   - Integration tests

### 10.2 Deployment
- [ ] GitHub repository with clean commit history
- [ ] Hosted live demo (Vercel/Netlify)
- [ ] README with installation & usage
- [ ] LICENSE file

### 10.3 Optional Features (Post-MVP)
- Dietary restriction filtering
- Recipe rating/favoriting
- Export to grocery list
- Nutrition calculation updates
- Dark mode
- Multi-language support

---

## 11. Risk Assessment

### 11.1 Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Inaccurate RegEx patterns | Medium | High | Extensive testing with recipe corpus |
| Fraction math complexity | Medium | Medium | Use proven library like fraction.js |
| Browser compatibility | Low | Medium | Test in multiple browsers |
| Performance on large recipes | Low | Low | Optimize RegEx, use memoization |

### 11.2 User Experience Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Users expect more features | High | Low | Clearly define MVP scope |
| Misunderstanding workflow | Medium | Low | Provide example recipe |
| Slider precision expectations | Medium | Low | Allow manual number input |

---

## 12. Timeline & Milestones (Estimated)

### Phase 1: Planning & Setup (Week 1)
- [ ] Finalize tech stack choice
- [ ] Set up development environment
- [ ] Create project repository

### Phase 2: Core Development (Weeks 2-3)
- [ ] Implement RegEx patterns
- [ ] Build calculation engine
- [ ] Develop React/Vue components
- [ ] Add slider & controls

### Phase 3: UI/UX & Styling (Week 4)
- [ ] Refine interface design
- [ ] Add responsive design
- [ ] Implement accessibility features

### Phase 4: Testing & QA (Week 5)
- [ ] Write and run tests
- [ ] Fix bugs
- [ ] User acceptance testing

### Phase 5: Deployment (Week 6)
- [ ] Deploy to hosting
- [ ] Final checks
- [ ] Launch

---

## 13. Acceptance Criteria

The Recipe Scaler project will be considered complete when:

1. ✅ All Functional Requirements (FR-1 through FR-6) are implemented and working
2. ✅ Real-time scaling responds in <100ms
3. ✅ RegEx successfully identifies ≥95% of common recipe measurements
4. ✅ Fraction math is 100% accurate
5. ✅ UI is responsive on desktop, tablet, and mobile
6. ✅ At least 80% code coverage with tests
7. ✅ App is deployed and publicly accessible
8. ✅ Documentation and README are complete
9. ✅ App has been tested with 15+ real recipes with 0 critical bugs

---

## Appendix A: Example Recipes for Testing

```
Classic Chocolate Chip Cookies (Makes 24 cookies)
- 2 1/4 cups all-purpose flour
- 1 tsp baking soda
- 1 tsp salt
- 1 cup butter, softened
- 3/4 cup granulated sugar
- 3/4 cup packed brown sugar
- 2 large eggs
- 2 tsp vanilla extract
- 2 cups chocolate chips
```

```
Simple Pasta for 4
- 1 lb pasta
- 3 tbsp olive oil
- 4 cloves garlic, minced
- 2.5 cups fresh tomatoes
- 1/2 cup fresh basil
- Salt and pepper to taste
```

---

**Document Version**: 1.0
**Last Updated**: March 17, 2026
**Author**: Requirements Team
**Status**: Ready for Development
