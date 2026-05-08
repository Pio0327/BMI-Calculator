# BMI & Macro Calculator - React Native Expo App

A beautiful, modern mobile app for calculating BMI, BMR, TDEE, and daily macro targets. Built with React Native and Expo.

## Features

✅ **Personal Metrics Input**
- Age, sex, height, and weight
- Activity level selection (Sedentary to Very Active)
- Goal selection (Lose Weight, Maintain, Gain Muscle)

✅ **Health Calculations**
- BMI with category (Underweight, Normal, Overweight, Obese)
- BMR (Basal Metabolic Rate) using Mifflin-St Jeor formula
- TDEE (Total Daily Energy Expenditure)
- Goal-adjusted target calories
- Daily macro targets (Protein, Carbs, Fat)

✅ **Visual Representation**
- Macro split pie/donut chart
- Color-coded macro cards
- BMI category colors

✅ **Design**
- Clean, modern health app aesthetic
- Responsive layout with smooth scrolling
- Warm cream background (#F5F0E8)
- Intuitive toggle buttons and inputs

## Tech Stack

- **Framework**: React Native
- **Deployment**: Expo
- **Charts**: victory-native@36 + react-native-svg
- **State Management**: React Hooks (useState)
- **Language**: JavaScript

## Installation

1. **Install Node.js** (v16 or later) from [nodejs.org](https://nodejs.org/)

2. **Install Expo CLI**:
   ```bash
   npm install -g expo-cli
   ```

3. **Navigate to project folder**:
   ```bash
   cd C:\Users\Lenovo\BMI-Calculator
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the App

### Start Development Server
```bash
npm start
```

You'll see a QR code in the terminal.

### Test on Physical Device
1. Download **Expo Go** app on your phone (iOS App Store or Google Play)
2. Open Expo Go
3. Scan the QR code shown in your terminal

### Test in Emulator

**Android**:
```bash
npm run android
```

**Web**:
```bash
npm run web
```

## How to Use

1. **Enter Your Stats**:
   - Age (years)
   - Sex (Male/Female toggle)
   - Height (cm)
   - Weight (kg)
   - Activity level (select from 5 options)
   - Goal (Lose Weight / Maintain / Gain Muscle)

2. **Tap Calculate** - Results appear instantly

3. **View Results**:
   - BMI with color-coded category
   - BMR (calories at rest)
   - TDEE (calories with activity)
   - Target daily calories (adjusted for your goal)
   - Daily macro targets in grams
   - Visual pie chart of macro split

## Formulas Used

**BMI**: `weight(kg) / height(m)²`

**BMR (Mifflin-St Jeor)**:
- Male: `(10×kg) + (6.25×cm) − (5×age) + 5`
- Female: `(10×kg) + (6.25×cm) − (5×age) − 161`

**TDEE**: `BMR × activity multiplier`
- Sedentary: 1.2
- Light: 1.375
- Moderate: 1.55
- Active: 1.725
- Very Active: 1.9

**Target Calories**:
- Lose weight: `TDEE − 500`
- Maintain: `TDEE`
- Gain muscle: `TDEE + 300`

**Macro Splits** (by goal):
- Lose: 40% protein, 30% carbs, 30% fat
- Maintain: 30% protein, 40% carbs, 30% fat
- Gain: 30% protein, 45% carbs, 25% fat

## Project Structure

```
C:\Users\Lenovo\BMI-Calculator\
├── app/
│   └── index.js          # Main app component
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── babel.config.js       # Babel configuration
└── README.md             # This file
```

## Troubleshooting

**"Cannot find module" error**:
```bash
npm install
```

**Port 8081 already in use**:
```bash
npm start -- --port 8082
```

**Expo Go not working**:
- Ensure phone and computer are on the same WiFi network
- Try using tunnel mode: `expo start --tunnel`

## Customization

- **Colors**: Edit the `COLORS` object at the top of `app/index.js`
- **Activity Levels**: Modify `ActivityMultipliers` object
- **Macro Splits**: Adjust `MacroSplits` object
- **Layout**: Edit StyleSheet at the bottom of the file

## Performance Notes

- All calculations run instantly on-device
- No API calls or network requests
- Lightweight SVG-based charts
- Optimized for iOS and Android

Enjoy your fitness journey! 💪
