// Fitness Tracker Dashboard - JavaScript
// Authentication check - Add this at the TOP of script.js
(function() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
    }
})();

// Add logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Data storage
let workouts = [];
let measurements = [];

// Tab switching
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked tab
    const activeTab = event.target;
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Update displays when switching tabs
    if (tabName === 'dashboard') {
        updateDashboard();
    } else if (tabName === 'progress') {
        updateProgress();
    }
}

// Workout form submission
document.getElementById('workoutForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const workout = {
        id: Date.now(),
        type: document.getElementById('workoutType').value,
        duration: parseInt(document.getElementById('duration').value),
        intensity: document.getElementById('intensity').value,
        notes: document.getElementById('notes').value,
        date: new Date().toISOString()
    };

    workouts.push(workout);
    displayWorkouts();
    updateDashboard();
    this.reset();

    // Show success message
    alert('Workout logged successfully! 💪');
});

// Display workouts
function displayWorkouts() {
    const allWorkoutsList = document.getElementById('allWorkoutsList');
    const recentWorkoutsList = document.getElementById('recentWorkoutsList');

    if (workouts.length === 0) {
        allWorkoutsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No workouts yet. Start logging!</p>
            </div>
        `;
        recentWorkoutsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏋️</div>
                <p>No workouts logged yet. Add your first workout!</p>
            </div>
        `;
        return;
    }

    // Display all workouts
    allWorkoutsList.innerHTML = workouts.map(workout => `
        <li class="workout-item">
            <div class="workout-info">
                <h4>${workout.type}</h4>
                <div class="workout-details">
                    ${workout.duration} minutes • ${workout.intensity} intensity
                    ${workout.notes ? `<br><em>"${workout.notes}"</em>` : ''}
                    <br><small>${new Date(workout.date).toLocaleDateString()}</small>
                </div>
            </div>
            <div class="workout-actions">
                <button class="btn btn-secondary btn-small" onclick="deleteWorkout(${workout.id})">Delete</button>
            </div>
        </li>
    `).reverse().join('');

    // Display recent workouts (last 5)
    const recentWorkouts = workouts.slice(-5).reverse();
    recentWorkoutsList.innerHTML = recentWorkouts.map(workout => `
        <li class="workout-item">
            <div class="workout-info">
                <h4>${workout.type}</h4>
                <div class="workout-details">
                    ${workout.duration} minutes • ${workout.intensity} intensity
                    <br><small>${new Date(workout.date).toLocaleDateString()}</small>
                </div>
            </div>
        </li>
    `).join('');
}

// Delete workout
function deleteWorkout(id) {
    if (confirm('Are you sure you want to delete this workout?')) {
        workouts = workouts.filter(w => w.id !== id);
        displayWorkouts();
        updateDashboard();
    }
}

// Update dashboard
function updateDashboard() {
    // Calculate weekly workouts (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo);

    document.getElementById('weeklyWorkouts').textContent = weeklyWorkouts.length;
    document.getElementById('totalWorkouts').textContent = workouts.length;

    // Calculate streak (consecutive days with workouts)
    const streak = calculateStreak();
    document.getElementById('currentStreak').textContent = streak;

    // Update weekly progress (target: 5 workouts per week)
    const progressPercentage = Math.min((weeklyWorkouts.length / 5) * 100, 100);
    const progressFill = document.getElementById('weeklyProgress');
    progressFill.style.width = progressPercentage + '%';
    progressFill.textContent = Math.round(progressPercentage) + '%';
}

// Calculate workout streak
function calculateStreak() {
    if (workouts.length === 0) return 0;

    const sortedWorkouts = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let workout of sortedWorkouts) {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === streak) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (daysDiff > streak) {
            break;
        }
    }

    return streak;
}

// Measurement form submission
document.getElementById('measurementForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const measurement = {
        id: Date.now(),
        weight: parseFloat(document.getElementById('weight').value),
        bodyFat: document.getElementById('bodyFat').value ? parseFloat(document.getElementById('bodyFat').value) : null,
        chest: document.getElementById('chest').value ? parseFloat(document.getElementById('chest').value) : null,
        waist: document.getElementById('waist').value ? parseFloat(document.getElementById('waist').value) : null,
        arms: document.getElementById('arms').value ? parseFloat(document.getElementById('arms').value) : null,
        date: new Date().toISOString()
    };

    measurements.push(measurement);
    displayMeasurements();
    this.reset();

    alert('Measurements saved successfully! 📏');
});

// Display measurements
function displayMeasurements() {
    const measurementDisplay = document.getElementById('measurementDisplay');

    if (measurements.length === 0) {
        measurementDisplay.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📏</div>
                <p>No measurements recorded yet.</p>
            </div>
        `;
        return;
    }

    const latest = measurements[measurements.length - 1];
    measurementDisplay.innerHTML = `
        <div class="result">
            <h3>Latest Measurements</h3>
            <div class="result-row">
                <span>Weight</span>
                <strong>${latest.weight} kg</strong>
            </div>
            ${latest.bodyFat ? `
                <div class="result-row">
                    <span>Body Fat</span>
                    <strong>${latest.bodyFat}%</strong>
                </div>
            ` : ''}
            ${latest.chest ? `
                <div class="result-row">
                    <span>Chest</span>
                    <strong>${latest.chest} cm</strong>
                </div>
            ` : ''}
            ${latest.waist ? `
                <div class="result-row">
                    <span>Waist</span>
                    <strong>${latest.waist} cm</strong>
                </div>
            ` : ''}
            ${latest.arms ? `
                <div class="result-row">
                    <span>Arms</span>
                    <strong>${latest.arms} cm</strong>
                </div>
            ` : ''}
            <div class="result-row">
                <span>Date</span>
                <strong>${new Date(latest.date).toLocaleDateString()}</strong>
            </div>
        </div>
    `;
}

// Update progress stats
function updateProgress() {
    // Count workouts by type
    const chestCount = workouts.filter(w => w.type === 'Chest').length;
    const backCount = workouts.filter(w => w.type === 'Back').length;
    const legsCount = workouts.filter(w => w.type === 'Legs').length;
    const cardioCount = workouts.filter(w => w.type === 'Cardio').length;

    document.getElementById('chestCount').textContent = chestCount;
    document.getElementById('backCount').textContent = backCount;
    document.getElementById('legsCount').textContent = legsCount;
    document.getElementById('cardioCount').textContent = cardioCount;
}

// BMI Calculator
document.getElementById('bmiForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const height = parseFloat(document.getElementById('bmiHeight').value) / 100; // convert to meters
    const weight = parseFloat(document.getElementById('bmiWeight').value);
    const bmi = (weight / (height * height)).toFixed(1);

    let category = '';
    let color = '';

    if (bmi < 18.5) {
        category = 'Underweight';
        color = 'var(--color-info)';
    } else if (bmi >= 18.5 && bmi < 25) {
        category = 'Normal weight';
        color = 'var(--color-success)';
    } else if (bmi >= 25 && bmi < 30) {
        category = 'Overweight';
        color = 'var(--color-warning)';
    } else {
        category = 'Obese';
        color = 'var(--color-error)';
    }

    document.getElementById('bmiResult').innerHTML = `
        <div class="result">
            <h3>Your BMI Result</h3>
            <div class="result-row">
                <span>BMI</span>
                <strong style="color: ${color}">${bmi}</strong>
            </div>
            <div class="result-row">
                <span>Category</span>
                <strong style="color: ${color}">${category}</strong>
            </div>
        </div>
    `;
});

// Calorie Calculator (Mifflin-St Jeor Equation)
document.getElementById('calorieForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const height = parseFloat(document.getElementById('calHeight').value);
    const weight = parseFloat(document.getElementById('calWeight').value);
    const activityLevel = parseFloat(document.getElementById('activityLevel').value);

    let bmr;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    const tdee = Math.round(bmr * activityLevel);
    const cutting = Math.round(tdee - 500);
    const bulking = Math.round(tdee + 300);

    document.getElementById('calorieResult').innerHTML = `
        <div class="result">
            <h3>Your Calorie Needs</h3>
            <div class="result-row">
                <span>Maintenance (TDEE)</span>
                <strong>${tdee} kcal/day</strong>
            </div>
            <div class="result-row">
                <span>Weight Loss</span>
                <strong>${cutting} kcal/day</strong>
            </div>
            <div class="result-row">
                <span>Muscle Gain</span>
                <strong>${bulking} kcal/day</strong>
            </div>
        </div>
    `;
});

// Macro Calculator
document.getElementById('macroForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const calories = parseInt(document.getElementById('macroCalories').value);
    const goal = document.getElementById('macroGoal').value;

    let carbPercent, proteinPercent, fatPercent;

    switch(goal) {
        case 'balanced':
            carbPercent = 40;
            proteinPercent = 30;
            fatPercent = 30;
            break;
        case 'bulking':
            carbPercent = 40;
            proteinPercent = 30;
            fatPercent = 30;
            break;
        case 'cutting':
            carbPercent = 40;
            proteinPercent = 40;
            fatPercent = 20;
            break;
        case 'highprotein':
            carbPercent = 30;
            proteinPercent = 40;
            fatPercent = 30;
            break;
    }

    const carbCalories = Math.round(calories * (carbPercent / 100));
    const proteinCalories = Math.round(calories * (proteinPercent / 100));
    const fatCalories = Math.round(calories * (fatPercent / 100));

    const carbGrams = Math.round(carbCalories / 4);
    const proteinGrams = Math.round(proteinCalories / 4);
    const fatGrams = Math.round(fatCalories / 9);

    document.getElementById('macroResult').innerHTML = `
        <div class="result">
            <h3>Your Macro Breakdown</h3>
            <div class="result-row">
                <span>Carbs (${carbPercent}%)</span>
                <strong>${carbGrams}g (${carbCalories} kcal)</strong>
            </div>
            <div class="result-row">
                <span>Protein (${proteinPercent}%)</span>
                <strong>${proteinGrams}g (${proteinCalories} kcal)</strong>
            </div>
            <div class="result-row">
                <span>Fats (${fatPercent}%)</span>
                <strong>${fatGrams}g (${fatCalories} kcal)</strong>
            </div>
        </div>
    `;
});

// Exercise Library
const exercises = [
    // Chest
    { name: 'Bench Press', muscle: 'chest', sets: '3-4', reps: '8-12' },
    { name: 'Incline Dumbbell Press', muscle: 'chest', sets: '3-4', reps: '8-12' },
    { name: 'Cable Flyes', muscle: 'chest', sets: '3', reps: '12-15' },
    { name: 'Push-ups', muscle: 'chest', sets: '3', reps: '15-20' },
    
    // Back
    { name: 'Deadlift', muscle: 'back', sets: '3-4', reps: '6-10' },
    { name: 'Pull-ups', muscle: 'back', sets: '3-4', reps: '8-12' },
    { name: 'Barbell Rows', muscle: 'back', sets: '3-4', reps: '8-12' },
    { name: 'Lat Pulldown', muscle: 'back', sets: '3', reps: '10-15' },
    
    // Legs
    { name: 'Squats', muscle: 'legs', sets: '3-4', reps: '8-12' },
    { name: 'Romanian Deadlift', muscle: 'legs', sets: '3-4', reps: '8-12' },
    { name: 'Leg Press', muscle: 'legs', sets: '3', reps: '10-15' },
    { name: 'Leg Curls', muscle: 'legs', sets: '3', reps: '12-15' },
    { name: 'Calf Raises', muscle: 'legs', sets: '4', reps: '15-20' },
    
    // Shoulders
    { name: 'Overhead Press', muscle: 'shoulders', sets: '3-4', reps: '8-12' },
    { name: 'Lateral Raises', muscle: 'shoulders', sets: '3', reps: '12-15' },
    { name: 'Face Pulls', muscle: 'shoulders', sets: '3', reps: '15-20' },
    { name: 'Arnold Press', muscle: 'shoulders', sets: '3', reps: '10-12' },
    
    // Arms
    { name: 'Barbell Curls', muscle: 'arms', sets: '3', reps: '10-12' },
    { name: 'Hammer Curls', muscle: 'arms', sets: '3', reps: '10-12' },
    { name: 'Tricep Dips', muscle: 'arms', sets: '3', reps: '10-15' },
    { name: 'Skull Crushers', muscle: 'arms', sets: '3', reps: '10-12' },
    
    // Core
    { name: 'Planks', muscle: 'core', sets: '3', reps: '30-60s' },
    { name: 'Hanging Leg Raises', muscle: 'core', sets: '3', reps: '10-15' },
    { name: 'Russian Twists', muscle: 'core', sets: '3', reps: '20-30' },
    { name: 'Cable Crunches', muscle: 'core', sets: '3', reps: '15-20' }
];

// Display exercise library
function displayExercises(filter = 'all') {
    const exerciseLibrary = document.getElementById('exerciseLibrary');
    
    const filteredExercises = filter === 'all' 
        ? exercises 
        : exercises.filter(ex => ex.muscle === filter);

    if (filteredExercises.length === 0) {
        exerciseLibrary.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No exercises found.</p>';
        return;
    }

    exerciseLibrary.innerHTML = filteredExercises.map(exercise => `
        <div class="exercise-card">
            <h4>${exercise.name}</h4>
            <p>${exercise.sets} sets × ${exercise.reps} reps</p>
            <p style="text-transform: capitalize; color: var(--color-primary); font-weight: var(--font-weight-medium);">
                ${exercise.muscle}
            </p>
        </div>
    `).join('');
}

// Filter exercises
function filterExercises() {
    const filter = document.getElementById('exerciseFilter').value;
    displayExercises(filter);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayWorkouts();
    displayMeasurements();
    displayExercises();
    updateDashboard();
    updateProgress();
});
