import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { VictoryPie } from 'victory-native';
import Svg from 'react-native-svg';

const COLORS = {
  background: '#06070C',
  surface: '#0F1419',
  card: '#0F1419',
  text: '#FFFFFF',
  textSecondary: '#E0E0E0',
  label: '#F0F0F0',
  border: '#1E2139',
  accent: '#00D4FF',
  accentSecondary: '#7C3AED',
  protein: '#10B981',
  carbs: '#F59E0B',
  fat: '#EF4444',
  white: '#FFFFFF',
  underweight: '#0EA5E9',
  normal: '#10B981',
  overweight: '#F59E0B',
  obese: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  gradient1: '#00D4FF',
  gradient2: '#7C3AED',
};

const ActivityMultipliers = {
  Sedentary: 1.2,
  Light: 1.375,
  Moderate: 1.55,
  Active: 1.725,
  'Very Active': 1.9,
};

const MacroSplits = {
  'Lose weight': { protein: 0.4, carbs: 0.3, fat: 0.3 },
  Maintain: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  'Gain muscle': { protein: 0.3, carbs: 0.45, fat: 0.25 },
};

const WorkoutPrograms = {
  'Lose weight': {
    Underweight: {
      type: 'Strength + Light Cardio',
      frequency: '3-4x per week',
      duration: '45-60 mins',
      tips: ['Focus on building muscle mass', 'Include 2-3 strength days', 'Light cardio (20-30 mins)', 'Ensure adequate protein intake'],
    },
    Normal: {
      type: 'Cardio + Strength',
      frequency: '4-5x per week',
      duration: '45-60 mins',
      tips: ['3 strength days, 2 cardio days', 'Include HIIT sessions', 'Progressive deficit approach', 'Stay consistent'],
    },
    Overweight: {
      type: 'Cardio Heavy + Strength',
      frequency: '5-6x per week',
      duration: '60 mins',
      tips: ['4-5 cardio sessions per week', '2 strength days', 'Include walking daily', 'Join group fitness classes'],
    },
    Obese: {
      type: 'Low-impact Cardio + Strength',
      frequency: '5-6x per week',
      duration: '45-60 mins',
      tips: ['Swimming, cycling, or elliptical', 'Start with 2 strength days', 'Daily walking recommended', 'Consult a trainer'],
    },
  },
  Maintain: {
    Underweight: {
      type: 'Strength Focus',
      frequency: '3-4x per week',
      duration: '60 mins',
      tips: ['Build muscle mass progressively', 'Compound exercises essential', 'Adequate protein intake', 'Progressive overload'],
    },
    Normal: {
      type: 'Balanced Strength & Cardio',
      frequency: '4-5x per week',
      duration: '45-60 mins',
      tips: ['3 strength, 2 cardio days', 'Maintain current fitness level', 'Mix compound & isolation', 'Flexibility training'],
    },
    Overweight: {
      type: 'Strength + Moderate Cardio',
      frequency: '4-5x per week',
      duration: '50-60 mins',
      tips: ['2-3 strength days', '2 cardio sessions', 'Light caloric deficit optional', 'Joint-friendly exercises'],
    },
    Obese: {
      type: 'Strength + Low-impact Cardio',
      frequency: '4-5x per week',
      duration: '45-60 mins',
      tips: ['Start strength training', 'Low-impact cardio 2-3x', 'Form over intensity', 'Professional guidance recommended'],
    },
  },
  'Gain muscle': {
    Underweight: {
      type: 'Heavy Strength Training',
      frequency: '4-5x per week',
      duration: '60-75 mins',
      tips: ['Progressive overload priority', 'Compound exercises focus', 'Eat in caloric surplus', 'Adequate rest days'],
    },
    Normal: {
      type: 'Hypertrophy Training',
      frequency: '4-5x per week',
      duration: '60 mins',
      tips: ['Upper/Lower or Push/Pull splits', 'Progressive overload', 'Higher volume training', 'Caloric surplus essential'],
    },
    Overweight: {
      type: 'Strength + Controlled Cardio',
      frequency: '4-5x per week',
      duration: '60 mins',
      tips: ['Prioritize strength training', 'Light cardio for heart health', 'Lean muscle gain focus', 'Moderate caloric surplus'],
    },
    Obese: {
      type: 'Building Strength Foundation',
      frequency: '3-4x per week',
      duration: '45-60 mins',
      tips: ['Start with compound movements', 'Master proper form first', 'Build strength foundation', 'Work with a trainer'],
    },
  },
};

// Meal Examples Database
const MealExamples = {
  breakfast: [
    { name: 'Oatmeal with eggs', protein: 15, carbs: 45, fat: 8, prepTime: '10 mins' },
    { name: 'Greek yogurt & berries', protein: 20, carbs: 30, fat: 5, prepTime: '5 mins' },
    { name: 'Scrambled eggs + toast', protein: 18, carbs: 35, fat: 12, prepTime: '10 mins' },
    { name: 'Protein pancakes', protein: 25, carbs: 40, fat: 6, prepTime: '15 mins' },
    { name: 'Smoothie bowl', protein: 20, carbs: 50, fat: 8, prepTime: '5 mins' },
  ],
  lunch: [
    { name: 'Grilled chicken + rice', protein: 40, carbs: 50, fat: 8, prepTime: '20 mins' },
    { name: 'Tuna salad', protein: 35, carbs: 15, fat: 10, prepTime: '10 mins' },
    { name: 'Lean beef + sweet potato', protein: 38, carbs: 40, fat: 10, prepTime: '25 mins' },
    { name: 'Turkey sandwich', protein: 28, carbs: 45, fat: 8, prepTime: '5 mins' },
    { name: 'Salmon + quinoa', protein: 35, carbs: 45, fat: 12, prepTime: '20 mins' },
  ],
  snack: [
    { name: 'Protein bar', protein: 20, carbs: 25, fat: 8, prepTime: '0 mins' },
    { name: 'Almonds (handful)', protein: 8, carbs: 6, fat: 14, prepTime: '0 mins' },
    { name: 'Banana + peanut butter', protein: 8, carbs: 30, fat: 8, prepTime: '2 mins' },
    { name: 'Greek yogurt', protein: 18, carbs: 8, fat: 3, prepTime: '0 mins' },
    { name: 'Hard boiled eggs', protein: 12, carbs: 1, fat: 11, prepTime: '0 mins' },
  ],
  dinner: [
    { name: 'Grilled fish + vegetables', protein: 45, carbs: 40, fat: 10, prepTime: '25 mins' },
    { name: 'Chicken stir-fry', protein: 38, carbs: 45, fat: 9, prepTime: '20 mins' },
    { name: 'Lean ground turkey pasta', protein: 35, carbs: 50, fat: 8, prepTime: '25 mins' },
    { name: 'Sirloin steak + broccoli', protein: 50, carbs: 25, fat: 12, prepTime: '30 mins' },
    { name: 'Tofu + brown rice', protein: 20, carbs: 50, fat: 8, prepTime: '20 mins' },
  ],
};

// Recovery Tips
const RecoveryTips = {
  sleep: '7-9 hours per night is crucial for muscle recovery and weight management',
  activeRecovery: 'Light walking, yoga, or swimming on rest days improves circulation',
  stretching: 'Spend 10-15 mins stretching major muscle groups post-workout',
  foam: 'Use a foam roller to reduce muscle soreness and improve flexibility',
  hydration: 'Drink water consistently throughout the day, not just during workouts',
};

// Pre/Post Workout Nutrition
const WorkoutNutrition = {
  preWorkout: {
    timing: '15-30 minutes before',
    options: [
      'Banana with honey (quick energy)',
      'Rice cakes with almond butter',
      'Sports drink with carbs',
      'Apple with almonds',
    ],
  },
  postWorkout: {
    timing: '30-60 minutes after',
    options: [
      'Protein shake with banana',
      'Chicken with rice',
      'Greek yogurt with berries',
      'Whey protein + carbs',
    ],
  },
};

const CommonFoods = {
  breakfast: [
    { name: 'Pandesal with Butter', calories: 180, protein: 5, carbs: 24, fat: 7 },
    { name: 'Sinangag (Garlic Rice)', calories: 250, protein: 4, carbs: 35, fat: 10 },
    { name: 'Tapa (80g)', calories: 200, protein: 26, carbs: 2, fat: 10 },
    { name: 'Balut (1 egg)', calories: 180, protein: 16, carbs: 1, fat: 13 },
    { name: 'Lugaw (1 bowl)', calories: 150, protein: 6, carbs: 28, fat: 2 },
    { name: 'Tuyo (Dried Fish, 2 pcs)', calories: 120, protein: 18, carbs: 0, fat: 5 },
  ],
  lunch: [
    { name: 'Chicken Adobo (150g)', calories: 280, protein: 28, carbs: 4, fat: 15 },
    { name: 'Jasmine Rice (1 cup)', calories: 205, protein: 4, carbs: 45, fat: 0 },
    { name: 'Sinigang (250g)', calories: 180, protein: 18, carbs: 12, fat: 7 },
    { name: 'Kare-kare (200g)', calories: 320, protein: 25, carbs: 15, fat: 18 },
    { name: 'Tinola (250g)', calories: 150, protein: 16, carbs: 8, fat: 5 },
    { name: 'Bangus (Fried, 100g)', calories: 200, protein: 20, carbs: 3, fat: 12 },
  ],
  snack: [
    { name: 'Lumpia (3 pieces)', calories: 200, protein: 8, carbs: 18, fat: 10 },
    { name: 'Bibingka (1 piece)', calories: 180, protein: 3, carbs: 25, fat: 8 },
    { name: 'Chicharon (1 oz)', calories: 180, protein: 12, carbs: 0, fat: 15 },
    { name: 'Ube Halaya (2 tbsp)', calories: 150, protein: 2, carbs: 28, fat: 3 },
    { name: 'Empanada (1 piece)', calories: 220, protein: 6, carbs: 22, fat: 12 },
    { name: 'Turon (1 piece)', calories: 140, protein: 1, carbs: 24, fat: 4 },
  ],
  dinner: [
    { name: 'Lapu-lapu (Steamed, 120g)', calories: 130, protein: 25, carbs: 0, fat: 3 },
    { name: 'Fried Chicken (100g)', calories: 250, protein: 22, carbs: 6, fat: 15 },
    { name: 'Pinakbet (250g)', calories: 140, protein: 8, carbs: 18, fat: 5 },
    { name: 'Pork Adobo (150g)', calories: 300, protein: 26, carbs: 3, fat: 20 },
    { name: 'Sinigang Pork (200g)', calories: 220, protein: 20, carbs: 10, fat: 12 },
    { name: 'Caldereta (250g)', calories: 280, protein: 24, carbs: 12, fat: 14 },
  ],
};

export default function App() {
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('Male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('Moderate');
  const [goal, setGoal] = useState('Maintain');
  const [results, setResults] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [error, setError] = useState('');
  const [errorTimeout, setErrorTimeout] = useState(null);
  
  // Daily tracking state
  const [dailyMeals, setDailyMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customFoodCalories, setCustomFoodCalories] = useState('');
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [weeklyData, setWeeklyData] = useState({});
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const calculateBMI = (weightKg, heightCm) => {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: COLORS.underweight };
    if (bmi < 25) return { category: 'Normal', color: COLORS.normal };
    if (bmi < 30) return { category: 'Overweight', color: COLORS.overweight };
    return { category: 'Obese', color: COLORS.obese };
  };

  const calculateBMR = (weightKg, heightCm, ageYears, sexValue) => {
    if (sexValue === 'Male') {
      return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
    } else {
      return 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
    }
  };

  const calculateTDEE = (bmr, activityLevelValue) => {
    return bmr * ActivityMultipliers[activityLevelValue];
  };

  const getTargetCalories = (tdee, goalValue) => {
    if (goalValue === 'Lose weight') return tdee - 500;
    if (goalValue === 'Gain muscle') return tdee + 300;
    return tdee;
  };

  const calculateMacros = (targetCalories, goalValue) => {
    const split = MacroSplits[goalValue];
    const proteinCalories = targetCalories * split.protein;
    const carbsCalories = targetCalories * split.carbs;
    const fatCalories = targetCalories * split.fat;

    return {
      protein: Math.round(proteinCalories / 4),
      carbs: Math.round(carbsCalories / 4),
      fat: Math.round(fatCalories / 9),
    };
  };

  const calculateWaterIntake = (weightKg, activityLevelValue) => {
    let baseWater = Math.round(weightKg * 35); // 35ml per kg
    const activityMultiplier = {
      Sedentary: 1,
      Light: 1.2,
      Moderate: 1.4,
      Active: 1.6,
      'Very Active': 1.8,
    };
    return Math.round(baseWater * activityMultiplier[activityLevelValue]);
  };

  const calculateTimeline = (weightNum, targetCalories, tdee, goalValue) => {
    if (goalValue === 'Lose weight') {
      const deficit = tdee - targetCalories;
      const weeksToReach = Math.round((weightNum * 0.05) / (deficit / 7 / 3500)); // 5% of body weight
      return { weeks: weeksToReach, message: `5% weight loss (~${Math.round(weightNum * 0.05)}kg)` };
    } else if (goalValue === 'Gain muscle') {
      const surplus = targetCalories - tdee;
      const weeksToGain = Math.round((weightNum * 0.1) / (surplus / 7 / 7700)); // 10% muscle gain
      return { weeks: Math.max(weeksToGain, 8), message: `10% muscle gain (~${Math.round(weightNum * 0.1)}kg)` };
    } else {
      return { weeks: 0, message: 'Maintaining current weight' };
    }
  };

  const getMealSuggestions = (macros) => {
    const randomMeal = (category) => category[Math.floor(Math.random() * category.length)];
    return {
      breakfast: randomMeal(MealExamples.breakfast),
      lunch: randomMeal(MealExamples.lunch),
      snack: randomMeal(MealExamples.snack),
      dinner: randomMeal(MealExamples.dinner),
    };
  };

  // Daily tracking functions
  const addMeal = (food, mealTypeSelected) => {
    const newMeal = {
      id: Date.now(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      mealType: mealTypeSelected,
      timestamp: new Date(),
    };
    setDailyMeals([...dailyMeals, newMeal]);
    setShowFoodPicker(false);
  };

  const addCustomMeal = () => {
    if (!customFoodName || !customFoodCalories) {
      if (errorTimeout) clearTimeout(errorTimeout);
      setError('⚠️ Enter food name and calories');
      setErrorTimeout(setTimeout(() => setError(''), 3000));
      return;
    }
    const customFood = {
      name: customFoodName,
      calories: parseInt(customFoodCalories),
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    addMeal(customFood, mealType);
    setCustomFoodName('');
    setCustomFoodCalories('');
  };

  const removeMeal = (mealId) => {
    setDailyMeals(dailyMeals.filter(m => m.id !== mealId));
  };

  const calculateDailyTotals = () => {
    return dailyMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + meal.protein,
        carbs: totals.carbs + meal.carbs,
        fat: totals.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const saveDailyRecord = () => {
    const totals = calculateDailyTotals();
    const newWeeklyData = { ...weeklyData };
    const dateKey = getTodayDate();
    newWeeklyData[dateKey] = { meals: dailyMeals, totals };
    setWeeklyData(newWeeklyData);
    
    if (errorTimeout) clearTimeout(errorTimeout);
    setError('✅ Daily record saved!');
    setErrorTimeout(setTimeout(() => setError(''), 2000));
  };

  const resetDaily = () => {
    setDailyMeals([]);
    setCustomFoodName('');
    setCustomFoodCalories('');
  };

  const handleCalculate = () => {
    if (!age || !height || !weight) {
      if (errorTimeout) clearTimeout(errorTimeout);
      setError('⚠️ Please fill in all fields');
      setErrorTimeout(setTimeout(() => setError(''), 3000));
      return;
    }

    const ageNum = parseInt(age);
    const heightNum = parseInt(height);
    const weightNum = parseInt(weight);

    if (ageNum <= 0 || heightNum <= 0 || weightNum <= 0) {
      if (errorTimeout) clearTimeout(errorTimeout);
      setError('⚠️ Please enter positive numbers');
      setErrorTimeout(setTimeout(() => setError(''), 3000));
      return;
    }

    const bmi = calculateBMI(weightNum, heightNum);
    const bmiInfo = getBMICategory(bmi);
    const bmr = calculateBMR(weightNum, heightNum, ageNum, sex);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = getTargetCalories(tdee, goal);
    const macros = calculateMacros(targetCalories, goal);
    const waterIntake = calculateWaterIntake(weightNum, activityLevel);
    const timeline = calculateTimeline(weightNum, targetCalories, tdee, goal);
    const meals = getMealSuggestions(macros);

    setResults({
      bmi: bmi.toFixed(1),
      bmiCategory: bmiInfo.category,
      bmiColor: bmiInfo.color,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      macros,
      waterIntake,
      timeline,
      meals,
      weightNum,
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💪 BMI & Macro</Text>
          <Text style={styles.subtitle}>Calculate your perfect nutrition plan</Text>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Metrics</Text>

          {error ? (
            <View style={styles.errorMessage}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Age (years)</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Sex</Text>
              <View style={styles.sexToggle}>
                <TouchableOpacity
                  style={[
                    styles.sexButton,
                    sex === 'Male' && {
                      backgroundColor: COLORS.accent,
                      borderColor: COLORS.accent,
                      shadowColor: COLORS.accent,
                      shadowOpacity: 0.3,
                      elevation: 4,
                    },
                  ]}
                  onPress={() => setSex('Male')}
                >
                  <Text
                    style={[
                      styles.sexButtonText,
                      sex === 'Male' && { color: '#06070C', fontWeight: '900' },
                    ]}
                  >
                    ♂ Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sexButton,
                    sex === 'Female' && {
                      backgroundColor: COLORS.accent,
                      borderColor: COLORS.accent,
                      shadowColor: COLORS.accent,
                      shadowOpacity: 0.3,
                      elevation: 4,
                    },
                  ]}
                  onPress={() => setSex('Female')}
                >
                  <Text
                    style={[
                      styles.sexButtonText,
                      sex === 'Female' && { color: '#06070C', fontWeight: '900' },
                    ]}
                  >
                    ♀ Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="175"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="number-pad"
                value={height}
                onChangeText={setHeight}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="75"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="number-pad"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>

          <Text style={styles.label}>Activity Level</Text>
          <View style={styles.activityGrid}>
            {Object.keys(ActivityMultipliers).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.activityButton,
                  activityLevel === level && {
                    backgroundColor: COLORS.accent,
                    borderColor: COLORS.accent,
                    shadowColor: COLORS.accent,
                    shadowOpacity: 0.3,
                    elevation: 4,
                  },
                ]}
                onPress={() => setActivityLevel(level)}
              >
                <Text
                  style={[
                    styles.activityText,
                    activityLevel === level && { color: '#06070C', fontWeight: '900' },
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Your Goal</Text>
          <View style={styles.goalGroup}>
            {['Lose weight', 'Maintain', 'Gain muscle'].map((goalOption) => (
              <TouchableOpacity
                key={goalOption}
                style={[
                  styles.goalButton,
                  goal === goalOption && {
                    backgroundColor: COLORS.accent,
                    borderColor: COLORS.accent,
                    shadowColor: COLORS.accent,
                    shadowOpacity: 0.3,
                    elevation: 4,
                  },
                ]}
                onPress={() => setGoal(goalOption)}
              >
                <Text
                  style={[
                    styles.goalButtonText,
                    goal === goalOption && { color: '#06070C', fontWeight: '900' },
                  ]}
                >
                  {goalOption === 'Lose weight' ? '📉 Lose' : goalOption === 'Maintain' ? '⚖️ Maintain' : '🎯 Gain'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.calculateButton, { backgroundColor: COLORS.accent }]}
            onPress={handleCalculate}
          >
            <Text style={styles.calculateButtonText}>📊 Calculate Results</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Calorie Tracker */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 Daily Tracker</Text>

          <View style={styles.trackerControls}>
            <TouchableOpacity
              style={[styles.mealTypeButton, mealType === 'breakfast' && { backgroundColor: COLORS.accent }]}
              onPress={() => setMealType('breakfast')}
            >
              <Text style={[styles.mealTypeText, mealType === 'breakfast' && { color: '#06070C' }]}>🌅 Breakfast</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mealTypeButton, mealType === 'lunch' && { backgroundColor: COLORS.accent }]}
              onPress={() => setMealType('lunch')}
            >
              <Text style={[styles.mealTypeText, mealType === 'lunch' && { color: '#06070C' }]}>🍽️ Lunch</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mealTypeButton, mealType === 'snack' && { backgroundColor: COLORS.accent }]}
              onPress={() => setMealType('snack')}
            >
              <Text style={[styles.mealTypeText, mealType === 'snack' && { color: '#06070C' }]}>🍎 Snack</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mealTypeButton, mealType === 'dinner' && { backgroundColor: COLORS.accent }]}
              onPress={() => setMealType('dinner')}
            >
              <Text style={[styles.mealTypeText, mealType === 'dinner' && { color: '#06070C' }]}>🍽️ Dinner</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.trackerButton, { marginBottom: 12 }]}
            onPress={() => setShowFoodPicker(!showFoodPicker)}
          >
            <Text style={styles.trackerButtonText}>+ Select from Database</Text>
          </TouchableOpacity>

          {showFoodPicker && (
            <View style={styles.foodPickerContainer}>
              <ScrollView style={styles.foodList} horizontal={false} nestedScrollEnabled>
                {CommonFoods[mealType].map((food) => (
                  <TouchableOpacity
                    key={food.name}
                    style={styles.foodItem}
                    onPress={() => addMeal(food, mealType)}
                  >
                    <View>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodInfo}>{food.calories} cal | P: {food.protein}g C: {food.carbs}g F: {food.fat}g</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.customMealContainer}>
            <Text style={styles.label}>Or Add Custom Food</Text>
            <TextInput
              style={styles.input}
              placeholder="Food name..."
              placeholderTextColor={COLORS.textSecondary}
              value={customFoodName}
              onChangeText={setCustomFoodName}
            />
            <TextInput
              style={styles.input}
              placeholder="Calories..."
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="number-pad"
              value={customFoodCalories}
              onChangeText={setCustomFoodCalories}
            />
            <TouchableOpacity
              style={[styles.trackerButton, { backgroundColor: COLORS.success }]}
              onPress={addCustomMeal}
            >
              <Text style={styles.trackerButtonText}>Add Custom Food</Text>
            </TouchableOpacity>
          </View>

          {/* Daily Summary */}
          {dailyMeals.length > 0 && (
            <>
              <Text style={[styles.label, { marginTop: 24 }]}>Today's Summary</Text>
              <View style={styles.dailySummary}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Total Calories</Text>
                  <Text style={styles.summaryValue}>{calculateDailyTotals().calories}</Text>
                  <Text style={styles.summaryUnit}>kcal</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Protein</Text>
                  <Text style={styles.summaryValue}>{calculateDailyTotals().protein}</Text>
                  <Text style={styles.summaryUnit}>g</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Carbs</Text>
                  <Text style={styles.summaryValue}>{calculateDailyTotals().carbs}</Text>
                  <Text style={styles.summaryUnit}>g</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Fat</Text>
                  <Text style={styles.summaryValue}>{calculateDailyTotals().fat}</Text>
                  <Text style={styles.summaryUnit}>g</Text>
                </View>
              </View>

              <Text style={[styles.label, { marginTop: 20 }]}>Logged Meals</Text>
              {dailyMeals.map((meal) => (
                <View key={meal.id} style={styles.mealLog}>
                  <View style={styles.mealLogInfo}>
                    <Text style={styles.mealLogName}>{meal.name}</Text>
                    <Text style={styles.mealLogDetail}>{meal.calories} cal | P: {meal.protein}g C: {meal.carbs}g F: {meal.fat}g</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeMeal(meal.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.trackerButtonGroup}>
                <TouchableOpacity
                  style={[styles.trackerButton, { backgroundColor: COLORS.success }]}
                  onPress={saveDailyRecord}
                >
                  <Text style={styles.trackerButtonText}>💾 Save Daily Record</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.trackerButton, { backgroundColor: '#EF4444' }]}
                  onPress={resetDaily}
                >
                  <Text style={styles.trackerButtonText}>🔄 Reset</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Results */}
        {results && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* BMI Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Your Results</Text>

              <View style={styles.bmiContainer}>
                <View style={[styles.bmiCircle, { borderColor: results.bmiColor }]}>
                  <Text style={styles.bmiValue}>{results.bmi}</Text>
                  <Text style={styles.bmiLabel}>BMI</Text>
                </View>
                <View style={styles.bmiInfo}>
                  <Text style={[styles.bmiCategory, { color: results.bmiColor }]}>
                    {results.bmiCategory}
                  </Text>
                  <Text style={styles.bmiMessage}>
                    {results.bmiCategory === 'Underweight' && 'Consider gaining weight healthily'}
                    {results.bmiCategory === 'Normal' && 'Great! You\'re at a healthy weight'}
                    {results.bmiCategory === 'Overweight' && 'Slight caloric deficit recommended'}
                    {results.bmiCategory === 'Obese' && 'Consider consulting a healthcare provider'}
                  </Text>
                </View>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>BMR</Text>
                  <Text style={styles.metricValue}>{results.bmr}</Text>
                  <Text style={styles.metricUnit}>kcal/day</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>TDEE</Text>
                  <Text style={styles.metricValue}>{results.tdee}</Text>
                  <Text style={styles.metricUnit}>kcal/day</Text>
                </View>
              </View>

              <View style={[styles.calorieBox, { borderLeftColor: COLORS.accent }]}>
                <Text style={styles.calorieLabel}>Target Daily Calories</Text>
                <Text style={styles.calorieValue}>{results.targetCalories}</Text>
                <Text style={styles.calorieSubtitle}>
                  {goal === 'Lose weight' ? '−500 cal' : goal === 'Gain muscle' ? '+300 cal' : '= Maintenance'} for your {goal.toLowerCase()} goal
                </Text>
              </View>
            </View>

            {/* Macros Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Daily Macros</Text>

              <View style={styles.macroCardsContainer}>
                <MacroCard
                  label="Protein"
                  value={results.macros.protein}
                  unit="g"
                  color={COLORS.protein}
                  icon="🥚"
                />
                <MacroCard
                  label="Carbs"
                  value={results.macros.carbs}
                  unit="g"
                  color={COLORS.carbs}
                  icon="🌾"
                />
                <MacroCard
                  label="Fat"
                  value={results.macros.fat}
                  unit="g"
                  color={COLORS.fat}
                  icon="🧈"
                />
              </View>

              <View style={styles.chartContainer}>
                <VictoryPie
                  data={[
                    { x: `Protein`, y: results.macros.protein, color: COLORS.protein },
                    { x: `Carbs`, y: results.macros.carbs, color: COLORS.carbs },
                    { x: `Fat`, y: results.macros.fat, color: COLORS.fat },
                  ]}
                  colorScale={[COLORS.protein, COLORS.carbs, COLORS.fat]}
                  labels={({ datum }) => `${datum.x}\n${datum.y}g`}
                  labelRadius={({ innerRadius }) => innerRadius + 45}
                  radius={100}
                  innerRadius={50}
                  style={{
                    labels: {
                      fill: COLORS.text,
                      fontSize: 12,
                      fontWeight: '600',
                    },
                  }}
                />
              </View>

              <View style={styles.macroTips}>
                <Text style={styles.tipsTitle}>💡 Nutrition Tips</Text>
                <Text style={styles.tipText}>• Spread macros evenly across 4-5 meals</Text>
                <Text style={styles.tipText}>• Prioritize whole foods and stay hydrated</Text>
                <Text style={styles.tipText}>• Adjust calories based on progress weekly</Text>
              </View>
            </View>

            {/* Workout Program Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>💪 Recommended Workout Plan</Text>

              {(() => {
                const workoutProgram = WorkoutPrograms[goal][results.bmiCategory];
                return (
                  <>
                    <View style={styles.workoutHeader}>
                      <Text style={styles.workoutType}>{workoutProgram.type}</Text>
                      <View style={styles.workoutBadges}>
                        <View style={styles.workoutBadge}>
                          <Text style={styles.badgeText}>{workoutProgram.frequency}</Text>
                        </View>
                        <View style={styles.workoutBadge}>
                          <Text style={styles.badgeText}>{workoutProgram.duration}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.workoutTips}>
                      <Text style={styles.workoutTipsTitle}>📋 Your Plan:</Text>
                      {workoutProgram.tips.map((tip, index) => (
                        <Text key={index} style={styles.workoutTipText}>
                          ✓ {tip}
                        </Text>
                      ))}
                    </View>

                    <View style={styles.workoutNote}>
                      <Text style={styles.noteText}>
                        {goal === 'Lose weight' && '🔥 Combine this workout with your caloric deficit for best results!'}
                        {goal === 'Maintain' && '⚖️ This plan will help maintain your current fitness level.'}
                        {goal === 'Gain muscle' && '🎯 Ensure you\'re eating in a caloric surplus for muscle growth!'}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>

            {/* Water Intake Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>💧 Daily Water Intake</Text>
              <View style={styles.waterContainer}>
                <Text style={styles.waterValue}>{results.waterIntake} ml</Text>
                <Text style={styles.waterSubtext}>~{Math.round(results.waterIntake / 250)} glasses per day</Text>
                <Text style={styles.waterTip}>💡 Tip: Drink 250ml (1 glass) every 30-45 mins during activity</Text>
              </View>
            </View>

            {/* Goal Timeline Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>⏱️ Goal Timeline</Text>
              <View style={styles.timelineContainer}>
                {results.timeline.weeks > 0 ? (
                  <>
                    <Text style={styles.timelineWeeks}>{results.timeline.weeks} weeks</Text>
                    <Text style={styles.timelineTarget}>to reach {results.timeline.message}</Text>
                    <Text style={styles.timelineNote}>
                      {goal === 'Lose weight' && '📊 Losing ~0.5-1kg per week is healthy and sustainable'}
                      {goal === 'Gain muscle' && '💪 Gaining muscle takes time - be patient and consistent!'}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.timelineTarget}>You\'re maintaining your current weight!</Text>
                )}
              </View>
            </View>

            {/* Sample Meals Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>🍽️ Sample Daily Meals</Text>
              <View style={styles.mealsContainer}>
                <MealItem meal={results.meals.breakfast} title="🌅 Breakfast" />
                <MealItem meal={results.meals.lunch} title="🍲 Lunch" />
                <MealItem meal={results.meals.snack} title="🥜 Snack" />
                <MealItem meal={results.meals.dinner} title="🍗 Dinner" />
              </View>
              <Text style={styles.mealNote}>💡 Refresh the app to get different meal suggestions!</Text>
            </View>

            {/* Pre/Post Workout Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>⚡ Workout Nutrition Timing</Text>
              
              <View style={styles.workoutNutritionContainer}>
                <View style={styles.nutritionBox}>
                  <Text style={styles.nutritionLabel}>Before Workout ({WorkoutNutrition.preWorkout.timing})</Text>
                  {WorkoutNutrition.preWorkout.options.map((option, idx) => (
                    <Text key={idx} style={styles.nutritionOption}>• {option}</Text>
                  ))}
                </View>
                
                <View style={styles.nutritionBox}>
                  <Text style={styles.nutritionLabel}>After Workout ({WorkoutNutrition.postWorkout.timing})</Text>
                  {WorkoutNutrition.postWorkout.options.map((option, idx) => (
                    <Text key={idx} style={styles.nutritionOption}>• {option}</Text>
                  ))}
                </View>
              </View>
            </View>

            {/* Recovery Tips Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>😴 Recovery & Wellness</Text>
              
              <View style={styles.recoveryTipsContainer}>
                <TipBox icon="😴" title="Sleep" text={RecoveryTips.sleep} />
                <TipBox icon="🚶" title="Active Recovery" text={RecoveryTips.activeRecovery} />
                <TipBox icon="🧘" title="Stretching" text={RecoveryTips.stretching} />
                <TipBox icon="🪵" title="Foam Rolling" text={RecoveryTips.foam} />
                <TipBox icon="💧" title="Hydration" text={RecoveryTips.hydration} />
              </View>
            </View>

            {/* Quick Summary Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>📋 Your Daily Summary</Text>
              <View style={styles.summaryGrid}>
                <SummaryItem label="Target Calories" value={`${results.targetCalories} kcal`} icon="🔥" />
                <SummaryItem label="Total Water" value={`${results.waterIntake} ml`} icon="💧" />
                <SummaryItem label="Total Protein" value={`${results.macros.protein}g`} icon="🥚" />
                <SummaryItem label="Total Carbs" value={`${results.macros.carbs}g`} icon="🌾" />
                <SummaryItem label="Total Fat" value={`${results.macros.fat}g`} icon="🧈" />
                <SummaryItem label="Sleep Target" value="7-9 hours" icon="😴" />
              </View>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MealItem({ meal, title }) {
  return (
    <View style={styles.mealItem}>
      <Text style={styles.mealItemTitle}>{title}</Text>
      <Text style={styles.mealItemName}>{meal.name}</Text>
      <View style={styles.mealMacros}>
        <Text style={styles.mealMacroText}>P: {meal.protein}g</Text>
        <Text style={styles.mealMacroText}>C: {meal.carbs}g</Text>
        <Text style={styles.mealMacroText}>F: {meal.fat}g</Text>
      </View>
      <Text style={styles.mealTime}>⏱️ {meal.prepTime}</Text>
    </View>
  );
}

function TipBox({ icon, title, text }) {
  return (
    <View style={styles.tipBox}>
      <Text style={styles.tipIcon}>{icon}</Text>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipTextSmall}>{text}</Text>
      </View>
    </View>
  );
}

function SummaryItem({ label, value, icon }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function MacroCard({ label, value, unit, color, icon }) {
  return (
    <View style={[styles.macroCard, { borderTopColor: color }]}>
      <Text style={styles.macroCardIcon}>{icon}</Text>
      <Text style={styles.macroCardLabel}>{label}</Text>
      <Text style={[styles.macroCardValue, { color }]}>{value}</Text>
      <Text style={styles.macroCardUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    marginHorizontal: -4,
    marginBottom: 28,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.label,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: 'rgba(15, 20, 25, 0.8)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    ...Platform.select({
      native: {
        shadowColor: '#00D4FF',
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 12,
      },
    }),
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 22,
    letterSpacing: 0.8,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.label,
    marginBottom: 8,
    marginTop: 14,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: 'rgba(22, 29, 41, 0.6)',
    fontWeight: '700',
  },
  sexToggle: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: 'rgba(22, 29, 41, 0.4)',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  sexButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 29, 41, 0.6)',
    ...Platform.select({
      native: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
    transitionDuration: 200,
  },
  sexButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.label,
    letterSpacing: 0.3,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    ...Platform.select({
      native: {
        shadowColor: '#00D4FF',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.label,
  },
  activityContainer: {
    gap: 10,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  activityButton: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    ...Platform.select({
      native: {
        shadowColor: '#00D4FF',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  activityText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.label,
    letterSpacing: 0.3,
  },
  goalGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  goalButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    ...Platform.select({
      native: {
        shadowColor: '#00D4FF',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  goalButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.label,
    letterSpacing: 0.3,
  },
  calculateButton: {
    marginTop: 28,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    ...Platform.select({
      native: {
        shadowColor: '#00D4FF',
        shadowOpacity: 0.45,
        shadowRadius: 22,
        elevation: 15,
      },
    }),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  calculateButtonText: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: COLORS.white,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.label,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resultUnit: {
    fontSize: 11,
    color: COLORS.label,
    marginTop: 2,
  },
  resultCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  calorieBox: {
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    borderLeftColor: COLORS.accent,
    borderLeftWidth: 6,
    ...Platform.select({
      native: {
        shadowColor: COLORS.accent,
        shadowOpacity: 0.3,
        shadowRadius: 18,
        elevation: 10,
      },
    }),
  },
  calorieLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.label,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: -1,
  },
  calorieSubtitle: {
    fontSize: 14,
    color: COLORS.label,
    marginTop: 12,
    fontWeight: '700',
    lineHeight: 20,
  },
  macroCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  macroCard: {
    flex: 1,
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    ...Platform.select({
      native: {
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 7,
      },
    }),
  },
  macroCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  macroCardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.label,
    marginBottom: 6,
  },
  macroCardValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: COLORS.text,
  },
  macroCardUnit: {
    fontSize: 11,
    color: COLORS.label,
    marginTop: 2,
    fontWeight: '700',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
  },
  macroTips: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    ...Platform.select({
      native: {
        shadowColor: '#10B981',
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 7,
      },
    }),
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.protein,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.label,
    lineHeight: 18,
    marginBottom: 6,
    fontWeight: '600',
  },
  workoutHeader: {
    marginBottom: 18,
  },
  workoutType: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 10,
  },
  workoutBadges: {
    flexDirection: 'row',
    gap: 10,
  },
  workoutBadge: {
    backgroundColor: '#161B22',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.label,
  },
  workoutTips: {
    backgroundColor: 'rgba(88, 166, 255, 0.08)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workoutTipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 10,
  },
  workoutTipText: {
    fontSize: 12,
    color: COLORS.label,
    lineHeight: 18,
    marginBottom: 6,
  },
  workoutNote: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  noteText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.protein,
    lineHeight: 18,
  },
  waterContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    ...Platform.select({
      native: {
        shadowColor: '#00D4FF',
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  waterValue: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.accent,
    marginBottom: 4,
    letterSpacing: -1,
  },
  waterSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    fontWeight: '600',
  },
  waterTip: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  timelineContainer: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.15)',
    ...Platform.select({
      native: {
        shadowColor: '#7C3AED',
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  timelineWeeks: {
    fontSize: 56,
    fontWeight: '900',
    color: COLORS.accentSecondary,
    marginBottom: 4,
    letterSpacing: -1.5,
  },
  timelineTarget: {
    fontSize: 14,
    color: COLORS.label,
    marginBottom: 10,
    fontWeight: '600',
  },
  timelineNote: {
    fontSize: 12,
    color: COLORS.label,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '600',
  },
  mealsContainer: {
    gap: 12,
    marginBottom: 12,
  },
  mealItem: {
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    ...Platform.select({
      native: {
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  mealItemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  mealItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  mealMacros: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  mealMacroText: {
    fontSize: 11,
    color: COLORS.label,
    fontWeight: '700',
  },
  mealTime: {
    fontSize: 11,
    color: COLORS.label,
    fontWeight: '600',
  },
  mealNote: {
    fontSize: 12,
    color: COLORS.label,
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '600',
  },
  workoutNutritionContainer: {
    gap: 12,
  },
  nutritionBox: {
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    ...Platform.select({
      native: {
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  nutritionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  nutritionOption: {
    fontSize: 12,
    color: COLORS.label,
    lineHeight: 18,
    marginBottom: 4,
  },
  recoveryTipsContainer: {
    gap: 10,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    gap: 12,
    ...Platform.select({
      native: {
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  tipIcon: {
    fontSize: 26,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  tipTextSmall: {
    fontSize: 11,
    color: COLORS.label,
    lineHeight: 15,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryItem: {
    width: '48%',
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    ...Platform.select({
      native: {
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  summaryIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.label,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '800',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.accent,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 28,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  bmiCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    ...Platform.select({
      native: {
        shadowColor: '#00D4FF',
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 12,
      },
    }),
    flexShrink: 0,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: -1,
  },
  bmiLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.label,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  bmiInfo: {
    flex: 1,
  },
  bmiCategory: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  bmiMessage: {
    fontSize: 14,
    color: COLORS.label,
    lineHeight: 20,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    ...Platform.select({
      native: {
        shadowColor: '#00D4FF',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.label,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontSize: 12,
    color: COLORS.label,
    marginTop: 6,
    fontWeight: '700',
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FCA5A5',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  trackerControls: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.label,
    letterSpacing: 0.2,
  },
  trackerButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  trackerButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#06070C',
    letterSpacing: 0.3,
  },
  trackerButtonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  foodPickerContainer: {
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    maxHeight: 250,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  foodList: {
    maxHeight: 220,
  },
  foodItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  foodName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.label,
    marginBottom: 4,
  },
  foodInfo: {
    fontSize: 11,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  customMealContainer: {
    backgroundColor: 'rgba(22, 29, 41, 0.4)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  dailySummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.label,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: -0.5,
  },
  summaryUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.label,
    marginTop: 4,
  },
  mealLog: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  mealLogInfo: {
    flex: 1,
  },
  mealLogName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.label,
    marginBottom: 4,
  },
  mealLogDetail: {
    fontSize: 11,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FCA5A5',
  },
});

