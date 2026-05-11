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

// Firebase imports for authentication and database
import { auth, db } from '../firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

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

const FoodsByCountry = {
  Philippines: {
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
  },
  USA: {
    breakfast: [
      { name: 'Scrambled Eggs (2)', calories: 155, protein: 13, carbs: 1, fat: 11 },
      { name: 'Oatmeal (1 cup)', calories: 150, protein: 5, carbs: 27, fat: 3 },
      { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
      { name: 'Greek Yogurt (1 cup)', calories: 100, protein: 17, carbs: 7, fat: 0 },
      { name: 'Whole Wheat Toast', calories: 80, protein: 4, carbs: 14, fat: 1 },
      { name: 'Granola (1/2 cup)', calories: 200, protein: 5, carbs: 30, fat: 8 },
    ],
    lunch: [
      { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 4 },
      { name: 'Brown Rice (1 cup)', calories: 215, protein: 5, carbs: 45, fat: 2 },
      { name: 'Salmon (100g)', calories: 206, protein: 22, carbs: 0, fat: 13 },
      { name: 'Broccoli (1 cup)', calories: 55, protein: 4, carbs: 11, fat: 1 },
      { name: 'Sweet Potato (1)', calories: 103, protein: 2, carbs: 24, fat: 0 },
      { name: 'Beef Steak (100g)', calories: 250, protein: 26, carbs: 0, fat: 15 },
    ],
    snack: [
      { name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0 },
      { name: 'Almonds (1 oz)', calories: 164, protein: 6, carbs: 6, fat: 14 },
      { name: 'Protein Bar', calories: 200, protein: 20, carbs: 15, fat: 5 },
      { name: 'Peanut Butter (2 tbsp)', calories: 188, protein: 8, carbs: 7, fat: 16 },
      { name: 'Mixed Berries (1 cup)', calories: 85, protein: 1, carbs: 21, fat: 0 },
      { name: 'Cheese (1 oz)', calories: 113, protein: 7, carbs: 0, fat: 9 },
    ],
    dinner: [
      { name: 'Grilled Chicken (150g)', calories: 248, protein: 47, carbs: 0, fat: 5 },
      { name: 'Pasta (1 cup)', calories: 220, protein: 8, carbs: 43, fat: 1 },
      { name: 'Turkey (100g)', calories: 135, protein: 29, carbs: 0, fat: 1 },
      { name: 'Baked Cod (150g)', calories: 120, protein: 26, carbs: 0, fat: 1 },
      { name: 'Quinoa (1 cup)', calories: 222, protein: 8, carbs: 39, fat: 4 },
      { name: 'Lean Ground Beef (100g)', calories: 180, protein: 27, carbs: 0, fat: 8 },
    ],
  },
  Japan: {
    breakfast: [
      { name: 'Tamagoyaki (2 eggs)', calories: 180, protein: 14, carbs: 2, fat: 13 },
      { name: 'White Rice (1 bowl)', calories: 200, protein: 4, carbs: 45, fat: 0 },
      { name: 'Nori (Seaweed, 1 sheet)', calories: 5, protein: 1, carbs: 1, fat: 0 },
      { name: 'Umeboshi (Pickled Plum)', calories: 15, protein: 0, carbs: 3, fat: 0 },
      { name: 'Miso Soup (1 bowl)', calories: 40, protein: 3, carbs: 4, fat: 1 },
      { name: 'Onigiri (Rice Ball)', calories: 150, protein: 3, carbs: 34, fat: 1 },
    ],
    lunch: [
      { name: 'Teriyaki Chicken (120g)', calories: 280, protein: 25, carbs: 12, fat: 12 },
      { name: 'Sushi Rice (1 cup)', calories: 200, protein: 4, carbs: 44, fat: 0 },
      { name: 'Salmon Fillet (100g)', calories: 206, protein: 22, carbs: 0, fat: 13 },
      { name: 'Edamame (1 cup)', calories: 190, protein: 19, carbs: 14, fat: 8 },
      { name: 'Tempura (3 pieces)', calories: 220, protein: 8, carbs: 18, fat: 12 },
      { name: 'Tonkatsu (Breaded Pork, 100g)', calories: 280, protein: 20, carbs: 12, fat: 16 },
    ],
    snack: [
      { name: 'Dango (2 pieces)', calories: 100, protein: 2, carbs: 22, fat: 1 },
      { name: 'Green Tea Mochi', calories: 90, protein: 2, carbs: 20, fat: 1 },
      { name: 'Wasabi Peas (1 oz)', calories: 140, protein: 6, carbs: 10, fat: 8 },
      { name: 'Dried Seaweed Snack', calories: 30, protein: 2, carbs: 4, fat: 0 },
      { name: 'Kakigori (Shaved Ice)', calories: 80, protein: 0, carbs: 20, fat: 0 },
      { name: 'Persimmon', calories: 80, protein: 0, carbs: 21, fat: 0 },
    ],
    dinner: [
      { name: 'Ramen (1 bowl)', calories: 350, protein: 12, carbs: 52, fat: 12 },
      { name: 'Sukiyaki (200g)', calories: 320, protein: 24, carbs: 16, fat: 18 },
      { name: 'Gyudon (Beef Bowl, 150g)', calories: 380, protein: 22, carbs: 42, fat: 14 },
      { name: 'Katsudon (Pork Cutlet Bowl)', calories: 420, protein: 24, carbs: 48, fat: 15 },
      { name: 'Tuna Sashimi (100g)', calories: 120, protein: 26, carbs: 0, fat: 1 },
      { name: 'Okonomiyaki (Savory Pancake)', calories: 300, protein: 12, carbs: 28, fat: 14 },
    ],
  },
  India: {
    breakfast: [
      { name: 'Idli (2 pieces)', calories: 120, protein: 4, carbs: 26, fat: 1 },
      { name: 'Dosa (1 piece)', calories: 220, protein: 8, carbs: 28, fat: 8 },
      { name: 'Paratha (2 pieces)', calories: 300, protein: 6, carbs: 32, fat: 16 },
      { name: 'Poha (1 bowl)', calories: 150, protein: 3, carbs: 32, fat: 2 },
      { name: 'Chapati (2 pieces)', calories: 180, protein: 6, carbs: 28, fat: 4 },
      { name: 'Halwa (2 tbsp)', calories: 150, protein: 2, carbs: 20, fat: 7 },
    ],
    lunch: [
      { name: 'Chicken Tikka Masala (200g)', calories: 350, protein: 28, carbs: 12, fat: 20 },
      { name: 'Basmati Rice (1 cup)', calories: 210, protein: 4, carbs: 46, fat: 0 },
      { name: 'Paneer Curry (150g)', calories: 280, protein: 18, carbs: 8, fat: 20 },
      { name: 'Dal (Lentils, 1 cup)', calories: 230, protein: 18, carbs: 40, fat: 2 },
      { name: 'Biryani (1 cup)', calories: 320, protein: 12, carbs: 42, fat: 10 },
      { name: 'Tandoori Chicken (100g)', calories: 180, protein: 26, carbs: 2, fat: 7 },
    ],
    snack: [
      { name: 'Samosa (2 pieces)', calories: 260, protein: 6, carbs: 28, fat: 14 },
      { name: 'Pakora (4 pieces)', calories: 200, protein: 6, carbs: 18, fat: 10 },
      { name: 'Bhelpuri (1 cup)', calories: 180, protein: 5, carbs: 28, fat: 6 },
      { name: 'Chakli (5 pieces)', calories: 150, protein: 3, carbs: 20, fat: 7 },
      { name: 'Laddu (1 piece)', calories: 140, protein: 3, carbs: 18, fat: 6 },
      { name: 'Jaggery (1 oz)', calories: 100, protein: 0, carbs: 26, fat: 0 },
    ],
    dinner: [
      { name: 'Butter Chicken (200g)', calories: 380, protein: 26, carbs: 10, fat: 26 },
      { name: 'Korma (200g)', calories: 340, protein: 22, carbs: 12, fat: 22 },
      { name: 'Rogan Josh (200g)', calories: 320, protein: 24, carbs: 8, fat: 18 },
      { name: 'Sambar (1 cup)', calories: 140, protein: 6, carbs: 20, fat: 3 },
      { name: 'Chole Bhature (1 serving)', calories: 480, protein: 16, carbs: 68, fat: 14 },
      { name: 'Fish Curry (150g)', calories: 240, protein: 22, carbs: 6, fat: 13 },
    ],
  },
  Mexico: {
    breakfast: [
      { name: 'Huevos Rancheros (1 serving)', calories: 280, protein: 14, carbs: 20, fat: 15 },
      { name: 'Chilaquiles (1 cup)', calories: 320, protein: 12, carbs: 28, fat: 16 },
      { name: 'Tamale (2 pieces)', calories: 220, protein: 6, carbs: 28, fat: 10 },
      { name: 'Tortilla (2 pieces)', calories: 140, protein: 4, carbs: 24, fat: 2 },
      { name: 'Chorizo (50g)', calories: 170, protein: 10, carbs: 2, fat: 13 },
      { name: 'Quesadilla (1 piece)', calories: 280, protein: 12, carbs: 24, fat: 14 },
    ],
    lunch: [
      { name: 'Chicken Burrito (300g)', calories: 420, protein: 28, carbs: 42, fat: 14 },
      { name: 'Carne Asada (120g)', calories: 280, protein: 32, carbs: 0, fat: 15 },
      { name: 'Chile Relleno (1 serving)', calories: 340, protein: 16, carbs: 18, fat: 20 },
      { name: 'Enchiladas (2 pieces)', calories: 420, protein: 18, carbs: 38, fat: 20 },
      { name: 'Taco (2 tacos)', calories: 280, protein: 16, carbs: 24, fat: 12 },
      { name: 'Pozole (1 bowl)', calories: 240, protein: 18, carbs: 24, fat: 8 },
    ],
    snack: [
      { name: 'Churro (2 pieces)', calories: 200, protein: 2, carbs: 28, fat: 9 },
      { name: 'Elote (Corn on cob)', calories: 220, protein: 7, carbs: 26, fat: 10 },
      { name: 'Guacamole (1/4 cup)', calories: 90, protein: 1, carbs: 4, fat: 8 },
      { name: 'Pico de Gallo (1/2 cup)', calories: 20, protein: 1, carbs: 4, fat: 0 },
      { name: 'Churros with Chocolate', calories: 240, protein: 4, carbs: 32, fat: 10 },
      { name: 'Flan (1 piece)', calories: 160, protein: 4, carbs: 22, fat: 6 },
    ],
    dinner: [
      { name: 'Mole Chicken (200g)', calories: 380, protein: 28, carbs: 22, fat: 18 },
      { name: 'Chiles en Nogada (1 serving)', calories: 320, protein: 12, carbs: 28, fat: 16 },
      { name: 'Tamales con Rajas (2 pieces)', calories: 280, protein: 8, carbs: 32, fat: 12 },
      { name: 'Cochinita Pibil (200g)', calories: 320, protein: 32, carbs: 4, fat: 16 },
      { name: 'Fajitas (1 serving)', calories: 360, protein: 28, carbs: 24, fat: 16 },
      { name: 'Chiles Rellenos (2 pieces)', calories: 380, protein: 16, carbs: 22, fat: 24 },
    ],
  },
  Italy: {
    breakfast: [
      { name: 'Cappuccino with Cornetto', calories: 180, protein: 6, carbs: 24, fat: 6 },
      { name: 'Focaccia (1 slice)', calories: 200, protein: 6, carbs: 28, fat: 6 },
      { name: 'Panettone (1 slice)', calories: 220, protein: 4, carbs: 36, fat: 6 },
      { name: 'Espresso with Pastry', calories: 150, protein: 3, carbs: 20, fat: 5 },
      { name: 'Biscotti (2 pieces)', calories: 140, protein: 4, carbs: 20, fat: 4 },
      { name: 'Bombolone (1 piece)', calories: 180, protein: 3, carbs: 24, fat: 8 },
    ],
    lunch: [
      { name: 'Pasta Carbonara (1 cup)', calories: 420, protein: 18, carbs: 42, fat: 18 },
      { name: 'Risotto (1 cup)', calories: 380, protein: 12, carbs: 48, fat: 14 },
      { name: 'Osso Buco (120g)', calories: 280, protein: 28, carbs: 6, fat: 14 },
      { name: 'Lasagna (1 slice)', calories: 380, protein: 20, carbs: 32, fat: 16 },
      { name: 'Pizza Margherita (2 slices)', calories: 420, protein: 18, carbs: 48, fat: 14 },
      { name: 'Spaghetti Bolognese (1 cup)', calories: 380, protein: 16, carbs: 44, fat: 14 },
    ],
    snack: [
      { name: 'Bruschetta (2 pieces)', calories: 120, protein: 4, carbs: 14, fat: 5 },
      { name: 'Cantuccini (3 pieces)', calories: 160, protein: 4, carbs: 20, fat: 6 },
      { name: 'Tiramisu (1 piece)', calories: 280, protein: 6, carbs: 28, fat: 14 },
      { name: 'Gelato (1 scoop)', calories: 140, protein: 3, carbs: 18, fat: 6 },
      { name: 'Panini (1 piece)', calories: 280, protein: 14, carbs: 28, fat: 12 },
      { name: 'Amaretti (2 pieces)', calories: 100, protein: 3, carbs: 14, fat: 3 },
    ],
    dinner: [
      { name: 'Veal Piccata (120g)', calories: 260, protein: 32, carbs: 4, fat: 12 },
      { name: 'Seafood Pasta (1 cup)', calories: 380, protein: 24, carbs: 40, fat: 12 },
      { name: 'Eggplant Parmesan (200g)', calories: 320, protein: 14, carbs: 24, fat: 18 },
      { name: 'Minestrone (1 bowl)', calories: 160, protein: 8, carbs: 24, fat: 3 },
      { name: 'Polenta (1 cup)', calories: 200, protein: 6, carbs: 40, fat: 2 },
      { name: 'Saltimbocca (120g)', calories: 280, protein: 28, carbs: 6, fat: 14 },
    ],
  },
};

// Use the current country's foods
const CommonFoods = FoodsByCountry['Philippines'];

export default function App() {
  // User authentication state
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Calculator state
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
  const [country, setCountry] = useState('Philippines');
  const [weeklyData, setWeeklyData] = useState({});
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Check if user is logged in when app loads
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Check if user is admin
      if (currentUser) {
        setIsAdmin(currentUser.email === 'admin@app.com');
        await loadUserProfile(currentUser.uid);
        await loadTodaysMeals(currentUser.uid);
      }
    });
    
    // Cleanup subscription when component unmounts
    return () => unsubscribe();
  }, []);

  // ========== FIREBASE AUTHENTICATION FUNCTIONS ==========

  // Helper function to validate email format
  const isValidEmail = (emailStr) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  // Helper function to validate username format (3+ alphanumeric chars, underscores, dots allowed)
  const isValidUsername = (usernameStr) => {
    const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;
    return usernameRegex.test(usernameStr);
  };

  // Function to find email by username in Firestore
  const findEmailByUsername = async (usernameToFind) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', usernameToFind));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().email;
      }
      return null;
    } catch (err) {
      console.log('Error finding username:', err);
      return null;
    }
  };

  const handleSignUp = async () => {
    if (!email || !username || !password || !confirmPassword) {
      setError('⚠️ Please fill in all fields');
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('❌ Please enter a valid email address (e.g., user@example.com)');
      return;
    }

    if (!isValidUsername(username)) {
      setError('❌ Username must be 3-20 characters (letters, numbers, dots, underscores only)');
      return;
    }
    
    if (password.length < 6) {
      setError('❌ Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('❌ Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Creating user with email:', email, 'username:', username);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);
      
      // Create user profile in Firestore with username
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        username: username,
        createdAt: new Date(),
        country: 'Philippines'
      });
      
      console.log('User profile saved to Firestore');
      setError('✅ Account created! You are logged in.');
      setTimeout(() => setError(''), 2000);
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      console.error('Signup error:', err.message);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setError('❌ This email is already registered');
      } else if (err.code === 'auth/weak-password') {
        setError('❌ Password is too weak. Use at least 6 characters');
      } else if (err.code === 'auth/invalid-email') {
        setError('❌ Invalid email format');
      } else {
        setError('❌ ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('⚠️ Please enter email/username and password');
      return;
    }
    
    let loginEmail = email;
    
    // Check if input is a username or email
    if (!isValidEmail(email)) {
      // It's likely a username, try to find the email
      if (!isValidUsername(email)) {
        setError('❌ Invalid username or email format');
        return;
      }
      
      // Look up email by username
      console.log('Looking up email for username:', email);
      const foundEmail = await findEmailByUsername(email);
      if (!foundEmail) {
        setError('❌ Username not found');
        return;
      }
      console.log('Found email:', foundEmail);
      loginEmail = foundEmail;
    }
    
    try {
      setLoading(true);
      console.log('Attempting login with:', loginEmail);
      
      await signInWithEmailAndPassword(auth, loginEmail, password);
      console.log('Login successful!');
      
      setError('✅ Login successful!');
      setTimeout(() => setError(''), 2000);
      setEmail('');
      setPassword('');
      setShowPassword(false);
    } catch (err) {
      console.error('Login error:', err.message, err.code);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/user-not-found') {
        setError('❌ User not found. Please sign up first');
      } else if (err.code === 'auth/wrong-password') {
        setError('❌ Incorrect password');
      } else if (err.code === 'auth/invalid-email') {
        setError('❌ Invalid email format');
      } else if (err.code === 'auth/user-disabled') {
        setError('❌ This account has been disabled');
      } else {
        setError('❌ ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setDailyMeals([]);
      setWeeklyData({});
      setError('✅ Logged out successfully');
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      setError('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setError('⚠️ Please enter your email');
      return;
    }
    
    if (!isValidEmail(forgotEmail)) {
      setError('❌ Please enter a valid email address (e.g., user@example.com)');
      return;
    }
    
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, forgotEmail);
      setError('✅ Password reset email sent! Check your inbox.');
      setTimeout(() => {
        setError('');
        setIsForgotPassword(false);
        setForgotEmail('');
      }, 3000);
    } catch (err) {
      setError('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== FIREBASE FIRESTORE FUNCTIONS ==========

  const loadUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCountry(userData.country || 'Philippines');
      }
    } catch (err) {
      console.log('Error loading profile:', err);
    }
  };

  const loadTodaysMeals = async (userId) => {
    try {
      const mealsRef = collection(db, 'users', userId, 'dailyMeals');
      const q = query(mealsRef, where('date', '==', getTodayDate()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const mealData = querySnapshot.docs[0].data();
        setDailyMeals(mealData.meals || []);
      }
    } catch (err) {
      console.log('Error loading meals:', err);
    }
  };

  const saveMealsToFirebase = async () => {
    if (!user) {
      setError('⚠️ Please login to save meals');
      return;
    }
    
    try {
      const totals = calculateDailyTotals();
      const mealsRef = collection(db, 'users', user.uid, 'dailyMeals');
      
      // Check if today's record exists
      const q = query(mealsRef, where('date', '==', getTodayDate()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update existing record
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(docRef, {
          date: getTodayDate(),
          meals: dailyMeals,
          totals: totals,
          timestamp: new Date()
        });
      } else {
        // Create new record
        await addDoc(mealsRef, {
          date: getTodayDate(),
          meals: dailyMeals,
          totals: totals,
          timestamp: new Date()
        });
      }
      
      setError('✅ Meals saved to Firebase!');
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      setError('❌ Error saving meals: ' + err.message);
    }
  };

  // ========== CALCULATION FUNCTIONS ==========
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
    
    // Save to Firebase if user is logged in
    if (user) {
      saveMealsToFirebase();
    } else {
      if (errorTimeout) clearTimeout(errorTimeout);
      setError('✅ Daily record saved locally! (Login to sync to cloud)');
      setErrorTimeout(setTimeout(() => setError(''), 2000));
    }
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
      {/* Show full-screen login page if not authenticated */}
      {!user ? (
        <LoginScreen
          email={email}
          setEmail={setEmail}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          isForgotPassword={isForgotPassword}
          setIsForgotPassword={setIsForgotPassword}
          forgotEmail={forgotEmail}
          setForgotEmail={setForgotEmail}
          loading={loading}
          error={error}
          setError={setError}
          onSignUp={handleSignUp}
          onLogin={handleLogin}
          onForgotPassword={handleForgotPassword}
        />
      ) : (
        /* Main App - Only shows when user is logged in */
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>💪 BMI & Macro</Text>
            <Text style={styles.subtitle}>Calculate your perfect nutrition plan</Text>
          </View>

          {/* User Profile Card */}
          <View style={[styles.card, { marginHorizontal: 16, marginBottom: 12 }]}>
            <View style={styles.userCardHeader}>
              <View>
                <View style={styles.welcomeRow}>
                  <Text style={styles.welcomeText}>👋 Welcome, {user.email}!</Text>
                  {isAdmin && <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>⚙️ ADMIN</Text></View>}
                </View>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={loading}
              >
                <Text style={styles.logoutButtonText}>🚪 Logout</Text>
              </TouchableOpacity>
            </View>
            {isAdmin && (
              <View style={styles.adminPanelCard}>
                <Text style={styles.adminPanelTitle}>⚙️ Admin Dashboard</Text>
                <View style={styles.adminInfo}>
                  <Text style={styles.adminInfoText}>✅ Admin account active</Text>
                  <Text style={styles.adminInfoText}>📊 Full access to all features</Text>
                  <Text style={styles.adminInfoText}>🔧 Special admin capabilities enabled</Text>
                </View>
              </View>
            )}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
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

          <View style={styles.countryContainer}>
            <Text style={styles.label}>🌍 Country/Cuisine</Text>
            <View style={styles.countryGrid}>
              {Object.keys(FoodsByCountry).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.countryButton, country === c && { backgroundColor: COLORS.accent, borderColor: COLORS.accent }]}
                  onPress={() => setCountry(c)}
                >
                  <Text style={[styles.countryButtonText, country === c && { color: '#06070C', fontWeight: '900' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
                {FoodsByCountry[country][mealType].map((food) => (
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
      )}
    </SafeAreaView>
  );
}

// ========== LOGIN SCREEN COMPONENT ==========
function LoginScreen({
  email,
  setEmail,
  username,
  setUsername,
  password,
  setPassword,
  isSignUp,
  setIsSignUp,
  isForgotPassword,
  setIsForgotPassword,
  forgotEmail,
  setForgotEmail,
  loading,
  error,
  setError,
  onSignUp,
  onLogin,
  onForgotPassword,
}) {
  return (
    <ScrollView contentContainerStyle={styles.loginContainer} showsVerticalScrollIndicator={false}>
      {/* Gradient Background Container */}
      <View style={styles.loginGradientBg}>
        {/* Logo/Branding */}
        <View style={styles.loginLogoSection}>
          <Text style={styles.loginLogo}>💪</Text>
          <Text style={styles.loginAppName}>BMI & Macro</Text>
          <Text style={styles.loginAppSubtitle}>Your Personal Nutrition Coach</Text>
        </View>

        {/* Main Login Card */}
        <View style={styles.loginCard}>
          {!isForgotPassword ? (
            <>
              {/* Welcome Message */}
              <View style={styles.welcomeSection}>
                <Text style={styles.loginTitle}>
                  {isSignUp ? '🎯 Join Our Community' : '👋 Welcome Back'}
                </Text>
                <Text style={styles.loginDescription}>
                  {isSignUp
                    ? 'Create an account to track your nutrition and fitness progress across devices.'
                    : 'Sign in to continue your fitness journey and access your saved data.'}
                </Text>
              </View>

              {/* Email Input (or Email/Username Input for login) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {isSignUp ? '📧 Email Address' : '📧 Email or Username'}
                </Text>
                <TextInput
                  style={styles.loginInput}
                  placeholder={isSignUp ? 'your@email.com' : 'email@example.com or username'}
                  placeholderTextColor="#A0AEC0"
                  keyboardType={isSignUp ? 'email-address' : 'default'}
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>

              {/* Username Input (only for signup) */}
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>👤 Username</Text>
                  <TextInput
                    style={styles.loginInput}
                    placeholder="myusername"
                    placeholderTextColor="#A0AEC0"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                    editable={!loading}
                  />
                  <Text style={styles.usernameHint}>3-20 characters, letters, numbers, dots, underscores</Text>
                </View>
              )}

              {/* Password Input with Show/Hide Toggle */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🔒 Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input (only for signup) */}
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>✓ Confirm Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirm your password"
                      placeholderTextColor="#A0AEC0"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                      style={styles.eyeButton}
                    >
                      <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Error/Success Message */}
              {error && (
                <View style={styles.loginErrorContainer}>
                  <Text style={styles.loginErrorText}>{error}</Text>
                </View>
              )}

              {/* Main Auth Button */}
              <TouchableOpacity
                style={[styles.loginAuthButton, loading && styles.loginAuthButtonDisabled]}
                onPress={isSignUp ? onSignUp : onLogin}
                disabled={loading}
              >
                <Text style={styles.loginAuthButtonText}>
                  {loading ? '⏳ Please wait...' : (isSignUp ? '✨ Create Account' : '🚀 Sign In')}
                </Text>
              </TouchableOpacity>

              {/* Forgot Password Link (only on login mode) */}
              {!isSignUp && (
                <TouchableOpacity onPress={() => {
                  setIsForgotPassword(true);
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}>
                  <Text style={styles.forgotPasswordLink}>🔑 Forgot your password?</Text>
                </TouchableOpacity>
              )}

              {/* Social Login Buttons */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtonsRow}>
                <TouchableOpacity style={styles.socialButton} disabled={loading}>
                  <Text style={styles.socialButtonEmoji}>🔴</Text>
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} disabled={loading}>
                  <Text style={styles.socialButtonEmoji}>🍎</Text>
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Toggle Sign Up / Login */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleQuestion}>
                  {isSignUp ? '✅ Already have an account? ' : "📝 Don't have an account? "}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setEmail('');
                    setUsername('');
                    setPassword('');
                    setConfirmPassword('');
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                >
                  <Text style={styles.toggleLink}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sign Up Benefits */}
              {isSignUp && (
                <View style={styles.benefitsContainer}>
                  <Text style={styles.benefitsTitle}>Why Create an Account?</Text>
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>☁️</Text>
                    <Text style={styles.benefitText}>Cloud Sync - Access your data anywhere</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>📊</Text>
                    <Text style={styles.benefitText}>Track Progress - Weekly reports</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>🔄</Text>
                    <Text style={styles.benefitText}>Multi-Device - Use on phone & web</Text>
                  </View>
                </View>
              )}

              {/* Admin Account Setup */}
              <View style={styles.adminSetupContainer}>
                <Text style={styles.adminSetupLabel}>⚙️ Admin Setup (First Time Only)</Text>
                <Text style={styles.adminSetupHint}>Email: admin@app.com | Username: admin | Password: !admin</Text>
                <TouchableOpacity
                  style={styles.adminSetupButton}
                  onPress={() => {
                    setEmail('admin@app.com');
                    setUsername('admin');
                    setPassword('!admin');
                    setConfirmPassword('!admin');
                    setIsSignUp(true);
                  }}
                >
                  <Text style={styles.adminSetupButtonText}>🔧 Create Admin Account</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Forgot Password Screen */
            <>
              <Text style={styles.loginTitle}>🔐 Reset Password</Text>
              <Text style={styles.loginDescription}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>📧 Email Address</Text>
                <TextInput
                  style={styles.loginInput}
                  placeholder="your@email.com"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  editable={!loading}
                />
              </View>

              {error && (
                <View style={styles.loginErrorContainer}>
                  <Text style={styles.loginErrorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.loginAuthButton, loading && styles.loginAuthButtonDisabled]}
                onPress={onForgotPassword}
                disabled={loading}
              >
                <Text style={styles.loginAuthButtonText}>
                  {loading ? '⏳ Sending email...' : '📧 Send Reset Link'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { 
                setIsForgotPassword(false); 
                setError('');
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}>
                <Text style={styles.backLink}>← Back to Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.loginFooter}>
          <Text style={styles.footerText}>
            By signing up, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </ScrollView>
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
  countryContainer: {
    marginBottom: 18,
  },
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  countryButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(22, 29, 41, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  countryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.label,
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

  // ========== LOGIN/AUTH STYLES ==========
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.accent,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: 'rgba(15, 20, 25, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    color: COLORS.label,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justWeight: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
    ...Platform.select({
      native: {
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#06070C',
    letterSpacing: 0.3,
  },
  toggleText: {
    fontSize: 13,
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  helpText: {
    fontSize: 12,
    color: COLORS.label,
    textAlign: 'center',
    marginTop: 14,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accent,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FCA5A5',
  },

  // ========== FULL SCREEN LOGIN PAGE STYLES ==========
  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loginGradientBg: {
    width: '100%',
    alignItems: 'center',
  },
  loginLogoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginLogo: {
    fontSize: 80,
    marginBottom: 12,
  },
  loginAppName: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: -1,
    marginBottom: 8,
  },
  loginAppSubtitle: {
    fontSize: 16,
    color: COLORS.label,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(15, 20, 25, 0.95)',
    borderRadius: 24,
    padding: 28,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    ...Platform.select({
      native: {
        shadowColor: '#00D4FF',
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 15,
      },
    }),
  },
  welcomeSection: {
    marginBottom: 28,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.accent,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  loginDescription: {
    fontSize: 14,
    color: COLORS.label,
    lineHeight: 21,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.label,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  loginInput: {
    backgroundColor: 'rgba(6, 7, 12, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: COLORS.label,
    fontSize: 14,
    fontWeight: '600',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 7, 12, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    borderRadius: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: COLORS.label,
    fontSize: 14,
    fontWeight: '600',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  eyeIcon: {
    fontSize: 18,
  },
  usernameHint: {
    fontSize: 11,
    color: COLORS.label,
    marginTop: 6,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  loginErrorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  loginErrorText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FCA5A5',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  loginAuthButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: COLORS.accent,
    ...Platform.select({
      native: {
        shadowColor: '#00D4FF',
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
      },
    }),
  },
  loginAuthButtonDisabled: {
    opacity: 0.6,
  },
  loginAuthButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#06070C',
    letterSpacing: 0.4,
  },
  forgotPasswordLink: {
    fontSize: 13,
    color: COLORS.accent,
    textAlign: 'center',
    fontWeight: '700',
    textDecorationLine: 'underline',
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.label,
    marginHorizontal: 12,
    fontWeight: '700',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22, 29, 41, 0.6)',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  socialButtonEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  socialButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.label,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  toggleQuestion: {
    fontSize: 13,
    color: COLORS.label,
    fontWeight: '600',
  },
  toggleLink: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  benefitsContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 255, 0.1)',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.accentSecondary,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  benefitText: {
    fontSize: 12,
    color: COLORS.label,
    fontWeight: '600',
    flex: 1,
  },
  backLink: {
    fontSize: 13,
    color: COLORS.accent,
    textAlign: 'center',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  loginFooter: {
    marginTop: 32,
    maxWidth: 420,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.label,
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
  },

  // Admin Setup Styles
  adminSetupContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: 'rgba(124, 58, 237, 0.2)',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderRadius: 12,
    padding: 14,
  },
  adminSetupLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.accentSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  adminSetupHint: {
    fontSize: 11,
    color: COLORS.label,
    marginBottom: 10,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  adminSetupButton: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accentSecondary,
  },
  adminSetupButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.accentSecondary,
    letterSpacing: 0.2,
  },

  // Admin Badge & Panel Styles
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.accentSecondary,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accentSecondary,
    letterSpacing: 0.2,
  },
  adminPanelCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.15)',
  },
  adminPanelTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.accentSecondary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  adminInfo: {
    gap: 6,
  },
  adminInfoText: {
    fontSize: 11,
    color: COLORS.label,
    fontWeight: '600',
  },
});

