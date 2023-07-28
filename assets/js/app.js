import updateAllSegments from './count-down.js';
import Validator from './validate.js';

const app = (() => {
   const validator = Validator({
      form: '.form',
      formGoup: '.form-group',
      formMessage: '.form-message',
      invalidFormGroupClass: 'invalid',
      rules: [
         Validator.minNumberValue(
            '#pomodoro-hours',
            0,
            'Value must be greater than or equal to 0'
         ),
         Validator.minNumberValue(
            '#pomodoro-minutes',
            0,
            'Value must be greater than or equal to 0'
         ),
         Validator.maxNumberValue(
            '#pomodoro-minutes',
            60,
            'Value must be less than or equal to 60'
         ),
         Validator.isRequired('#pomodoro-seconds', 'Please enter this field'),
         Validator.minNumberValue(
            '#pomodoro-seconds',
            0,
            'Value must be greater than or equal to 0'
         ),
         Validator.maxNumberValue(
            '#pomodoro-seconds',
            60,
            'Value must be less than or equal to 60'
         ),

         Validator.minNumberValue(
            '#short-break-hours',
            0,
            'Value must be greater than or equal to 0'
         ),
         Validator.minNumberValue(
            '#short-break-minutes',
            0,
            'Value must be greater than or equal to 0'
         ),
         Validator.maxNumberValue(
            '#short-break-minutes',
            60,
            'Value must be less than or equal to 60'
         ),
         Validator.isRequired(
            '#short-break-seconds',
            'Please enter this field'
         ),
         Validator.minNumberValue(
            '#short-break-seconds',
            0,
            'Value must be greater than or equal to 0'
         ),
         Validator.maxNumberValue(
            '#short-break-seconds',
            60,
            'Value must be less than or equal to 60'
         ),

         Validator.minNumberValue(
            '#long-break-hours',
            0,
            'Value must be greater than or equal to 0'
         ),
         Validator.minNumberValue(
            '#long-break-minutes',
            0,
            'Value must be greater than or equal to 0'
         ),
         Validator.maxNumberValue(
            '#long-break-minutes',
            60,
            'Value must be less than or equal to 60'
         ),
         Validator.isRequired('#long-break-seconds', 'Please enter this field'),
         Validator.minNumberValue(
            '#long-break-seconds',
            0,
            'Value must be greater than or equal to 0'
         ),
         Validator.maxNumberValue(
            '#long-break-seconds',
            60,
            'Value must be less than or equal to 60'
         ),

         Validator.isRequired('#number-pomodoros', 'Please enter this field'),
         Validator.minNumberValue(
            '#number-pomodoros',
            1,
            'Value must be greater than or equal to 1'
         ),
      ],
   });

   const settingFormElement = document.querySelector('.setting-form');
   const infoLogger = createLogger('Info');
   let countDownTimer;

   function createLogger(namespace) {
      return (message) => {
         console.log(`[${namespace}] ${message}`);
      }
   }

   function startCountDownTimer(targetDate) {
      return new Promise((resolve) => {
         infoLogger('Count down timer running...')
         updateAllSegments(targetDate);
         countDownTimer = setInterval(() => {
            const isComplete = updateAllSegments(targetDate);
            if (isComplete) {
               clearInterval(countDownTimer);
               infoLogger('Count down timer ends')
               const audioElement = document.querySelector('audio');
               audioElement.src = './assets/audio/ring.mp3';
               resolve(countDownTimer);
            }
         }, 1000);
      });
   }

   function startCountDownOnePomodoro(
      pomodoroHours = 0,
      pomodoroMinutes = 0,
      pomodoroSeconds = 0
   ) {
      const targetDate = new Date();
      targetDate.setHours(targetDate.getHours() + pomodoroHours);
      targetDate.setMinutes(targetDate.getMinutes() + pomodoroMinutes);
      targetDate.setSeconds(targetDate.getSeconds() + pomodoroSeconds);

      return startCountDownTimer(targetDate);
   }

   function startCountDownShortBreak(
      shortBreakHours = 0,
      shortBreakMinutes = 0,
      shortBreakSeconds = 0
   ) {
      const targetDate = new Date();
      targetDate.setHours(targetDate.getHours() + shortBreakHours);
      targetDate.setMinutes(targetDate.getMinutes() + shortBreakMinutes);
      targetDate.setSeconds(targetDate.getSeconds() + shortBreakSeconds);
      return startCountDownTimer(targetDate);
   }

   function startCountDownLongBreak(
      longBreakHours = 0,
      longBreakMinutes = 0,
      longBreakSeconds = 0
   ) {
      const targetDate = new Date();
      targetDate.setHours(targetDate.getHours() + longBreakHours);
      targetDate.setMinutes(targetDate.getMinutes() + longBreakMinutes);
      targetDate.setSeconds(targetDate.getSeconds() + longBreakSeconds);
      return startCountDownTimer(targetDate);
   }

   async function handleStartPomodoro(timeData) {
      settingFormElement.classList.remove('active');

      let pomodoroHours = Number(timeData.pomodoroHours),
         pomodoroMinutes = Number(timeData.pomodoroMinutes),
         pomodoroSeconds = Number(timeData.pomodoroSeconds),
         shortBreakHours = Number(timeData.shortBreakHours),
         shortBreakMinutes = Number(timeData.shortBreakMinutes),
         shortBreakSeconds = Number(timeData.shortBreakSeconds),
         longBreakHours = Number(timeData.longBreakHours),
         longBreakMinutes = Number(timeData.longBreakMinutes),
         longBreakSeconds = Number(timeData.longBreakSeconds),
         numberPomodoros = Number(timeData.numberPomodoros);

      const bodyElement = document.querySelector('body');
      for (let countPomodoro = 1; countPomodoro <= numberPomodoros; countPomodoro++) {
         bodyElement.classList.remove('short-breaking');
         bodyElement.classList.remove('long-breaking');
         await startCountDownOnePomodoro(pomodoroHours, pomodoroMinutes, pomodoroSeconds);
         if (countPomodoro % 4 === 0) {
            bodyElement.classList.add('long-breaking');
            await startCountDownLongBreak(longBreakHours, longBreakMinutes, longBreakSeconds);
         } else {
            bodyElement.classList.add('short-breaking');
            await startCountDownShortBreak(shortBreakHours, shortBreakMinutes, shortBreakSeconds);
         }
      }
   }

   function handleEvent() {
      window.onkeyup = (e) => {
         if (e.keyCode === 27 && countDownTimer) {
            clearInterval(countDownTimer);
            infoLogger('Count down timer ends')
            settingFormElement.classList.add('active');
         }
      };
      window.ondblclick = (e) => {
         if (countDownTimer) {
            clearInterval(countDownTimer);
            infoLogger('Count down timer ends')
            settingFormElement.classList.add('active');
         }
      }
   }

   return {
      start: () => {
         validator.validate((data) => {
            handleStartPomodoro(data);
         });
         handleEvent();
      },
   };
})();

app.start();
