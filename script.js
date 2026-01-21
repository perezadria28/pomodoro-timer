const timerDisplay = document.getElementById('timer-display');
const modeText = document.getElementById('mode-text');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const updateBtn = document.getElementById('update-btn');
const sessionCount = document.getElementById('session-count');
const workTimeInput = document.getElementById('working-time');
const breakTimeInput = document.getElementById('break-time');


const alarmSound = new Audio('./alarm.mp3');

let work_time = 25 * 60;
let break_time = 5 * 60;
let timeLeft = work_time;
let isRunning = false;
let currentMode = 'work';
let completedSessions = 0;
let intervalId = null;

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedMinutes = `${minutes}`.padStart(2, '0');
    const formattedSeconds = `${seconds}`.padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

function updateDisplay() {
    const newTime = formatTime(timeLeft);
    timerDisplay.textContent = newTime;
}

function startTimer() {
    if (isRunning) {
        return;
    }

    isRunning = true;

    intervalId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        saveToLocalStorage();

        if (timeLeft === 0) {
            clearInterval(intervalId);
            isRunning = false;
            switchMode();
        }
    }, 1000);

}

function pauseTimer() {
    if (!isRunning) {
        return;
    }

    isRunning = false;

    clearInterval(intervalId);
}

function resetTimer() {
    clearInterval(intervalId);
    currentMode = 'work';
    timeLeft = work_time;
    isRunning = false;
    modeText.textContent = 'Work Time';
    updateDisplay();
    startBtn.textContent = "START";
    saveToLocalStorage();
}

function switchMode() {

    playAlarm();

    if (currentMode === 'work') {
        showNotification('Break time!', 'Working session was completed, time to rest.');
        completedSessions++;
        currentMode = 'break';
        timeLeft = break_time;
        modeText.textContent = 'Break Time';
        sessionCount.textContent = `Completed sessions: ${completedSessions}`;
    } else if (currentMode === 'break') {
        showNotification('Break time ended!', 'Time to work!');
        currentMode = 'work';
        timeLeft = work_time;
        modeText.textContent = 'Work Time';
    }

    updateDisplay();
    isRunning = false;
    startBtn.textContent = "START";
    saveToLocalStorage();
}

function saveToLocalStorage() {
    const state = {
        completedSessions: completedSessions,
        timeLeft: timeLeft,
        currentMode: currentMode
    };

    const stateToString = JSON.stringify(state);

    localStorage.setItem('pomodoroTimer', stateToString);
}

function loadFromLocalStorage() {
    const savedState = localStorage.getItem('pomodoroTimer');

    if (savedState === null) {
        return;
    }

    const state = JSON.parse(savedState);

    completedSessions = state.completedSessions;
    timeLeft = state.timeLeft;
    currentMode = state.currentMode;

    updateDisplay();
    modeText.textContent = currentMode === 'work' ? 'Work Time' : 'Break Time';
    sessionCount.textContent = `Completed sessions: ${completedSessions}`;
}

function playAlarm() {
    alarmSound.play().catch(error => {
        console.log('No se pudo reproducir el sonido:', error);
    });
}

function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Notifications not supported by the explorer.');
        return;
    }
    if (Notification.permission === 'granted') {
        return;
    }
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    };

}

function showNotification(title, message) {

    if (Notification.permission === 'granted') {
        try {
            const notif = new Notification(title, {
                body: message
            });
            console.log('✅ Notificación creada:', notif);
        } catch (error) {
            console.error('❌ Error al crear notificación:', error);
        }
    }
}

function updateTimerConfig() {
    let newWorkTime = workTimeInput.value * 60;
    let newBreakTime = breakTimeInput.value * 60;
    work_time = newWorkTime;
    break_time = newBreakTime;

    if(!isRunning){
        currentMode === 'work' ? timeLeft = work_time : timeLeft = break_time;
        updateDisplay();
        saveToLocalStorage();
    }
 
}

updateBtn.addEventListener('click', () => {
    updateTimerConfig();

})

startBtn.addEventListener('click', () => {
    if (isRunning) {
        pauseTimer();
        startBtn.textContent = "START";

    } else {
        startTimer();
        startBtn.textContent = "PAUSE";
    }

});

resetBtn.addEventListener('click', () => {
    resetTimer();
});



loadFromLocalStorage();
requestNotificationPermission();
workTimeInput.value = work_time / 60;
breakTimeInput.value = break_time / 60;




