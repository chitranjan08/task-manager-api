// inactivityTimer.js
let timer;
const EXPIRY_TIME = 15 * 60 * 1000; // 15 mins

const resetTimer = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  }, EXPIRY_TIME);
};

const initInactivityTimer = () => {
  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keydown", resetTimer);
  resetTimer(); // start the timer
};

export default initInactivityTimer;
