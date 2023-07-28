'use strict';

function Validator(
   options = {
      form: '',
      formGoup: '',
      formMessage: '',
      invalidFormGroupClass: '',
      rules: [Validator.isRequired('', '')],
   }
) {
   const formElement = document.querySelector(options.form);
   if (!formElement) {
      throw Error('Not found form element');
   }
   const ruleTests = {};

   function validateInput(inputElement, rule) {
      const parrentElement = inputElement.closest(options.formGoup);
      if (!parrentElement) return;

      const formMessageElement = parrentElement.querySelector(
         options.formMessage
      );
      if (!formMessageElement) return;

      let errorMessage;
      const tests = ruleTests[rule.selector];
      for (const test of tests) {
         switch (inputElement.type) {
            case 'radio':
            case 'checkbox':
               const checkedInput = document.querySelector(
                  rule.selector + ':checked'
               );
               errorMessage = test(checkedInput);
               break;
            default:
               errorMessage = test(inputElement.value);
         }
         if (errorMessage) {
            break;
         }
      }

      if (!errorMessage) {
         return undefined;
      }
      formMessageElement.innerText = errorMessage;
      parrentElement.classList.add(options.invalidFormGroupClass);
      return errorMessage;
   }

   function checkValidForm() {
      let isValidForm = true;
      options.rules.forEach((rule) => {
         const inputElements = formElement.querySelectorAll(rule.selector);
         Array.from(inputElements).forEach((inputElement) => {
            const errorMessage = validateInput(inputElement, rule);
            if (errorMessage) {
               isValidForm = false;
            }
         });
      });
      return isValidForm;
   }

   function getDataFromInputs(enableInputElements) {
      const data = Array.from(enableInputElements).reduce(
         (data, inputElement) => {
            switch (inputElement.type) {
               case 'radio':
                  if (inputElement.matches(':checked')) {
                     data[inputElement.name] = inputElement.value;
                  } else {
                     data[inputElement.name] = '';
                  }
                  break;
               case 'checkbox':
                  if (inputElement.matches(':checked')) {
                     if (!Array.isArray(data[inputElement.name])) {
                        data[inputElement.name] = [];
                     }
                     data[inputElement.name].push(inputElement.value);
                  } else {
                     if (!data[inputElement.name]) {
                        data[inputElement.name] = [];
                     }
                  }
                  break;
               case 'file':
                  data[inputElement.name] = inputElement.files;
                  break;
               default:
                  data[inputElement.name] = inputElement.value;
            }
            return data;
         },
         {}
      );

      return data;
   }

   return {
      validate(onSubmit) {
         // validate when has blur or input event
         options.rules.forEach((rule) => {
            if (!Array.isArray(ruleTests[rule.selector])) {
               ruleTests[rule.selector] = [];
            }
            ruleTests[rule.selector].push(rule.test);

            const inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach((inputElement) => {
               inputElement.onblur = function () {
                  validateInput(this, rule);
               };

               inputElement.onchange = function () {
                  validateInput(this, rule);
               };

               inputElement.oninput = function () {
                  const parrentElement = this.closest(options.formGoup);
                  if (!parrentElement) return;

                  const formMessageElement = parrentElement.querySelector(
                     options.formMessage
                  );
                  if (!formMessageElement) return;

                  formMessageElement.innerText = '';
                  parrentElement.classList.remove(
                     options.invalidFormGroupClass
                  );
               };
            });
         });

         // validate and getData when click submit button
         formElement.onsubmit = function (e) {
            e.preventDefault();

            let isValidForm = checkValidForm();

            if (!isValidForm) {
               return;
            }

            const enableInputElements = this.querySelectorAll(
               '[name]:not([disabled])'
            );
            const data = getDataFromInputs(enableInputElements);

            if (typeof onSubmit === 'function') {
               onSubmit(data);
            } else {
               this.submit();
            }
         };
      },
   };
}

Validator.isRequired = (selector, message) => {
   return {
      selector,
      test(value) {
         if (typeof value === 'string') {
            return value.trim() ? undefined : message;
         }
         return value ? undefined : message;
      },
   };
};

Validator.isEmail = (selector, message) => {
   const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
   return {
      selector,
      test(value) {
         return emailRegex.test(value) ? undefined : message;
      },
   };
};

Validator.minLength = (selector, min, message) => {
   return {
      selector,
      test(value) {
         return value.trim().length >= min ? undefined : message;
      },
   };
};

Validator.maxLength = (selector, max, message) => {
   return {
      selector,
      test(value) {
         return value.trim().length <= max ? undefined : message;
      },
   };
};


Validator.minNumberValue = (selector, minValue, message, notNumberMessage) => {
   return {
      selector,
      test(value) {
         value = Number(value);
         if (value) {
            return value >= minValue ? undefined : message;
         }
         return notNumberMessage;
      },
   };
};

Validator.maxNumberValue = (selector, maxValue, message, notNumberMessage) => {
   return {
      selector,
      test(value) {
         value = Number(value);
         if (value) {
            return value <= maxValue ? undefined : message;
         }
         return notNumberMessage;
      },
   };
};

Validator.isComfirmed = (selector, message, getComfirmValue = () => {}) => {
   return {
      selector,
      test(value) {
         return value.trim() === getComfirmValue() ? undefined : message;
      },
   };
};

export default Validator;
