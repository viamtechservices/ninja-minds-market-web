const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const emailForm = document.querySelector("[data-email-form]");

if (emailForm) {
  const captchaQuestion = emailForm.querySelector("[data-captcha-question]");
  const captchaAnswer = emailForm.querySelector("[data-captcha-answer]");
  const captchaRefresh = emailForm.querySelector("[data-captcha-refresh]");
  const captchaError = emailForm.querySelector("[data-captcha-error]");
  let expectedCaptchaAnswer = 0;

  const setCaptcha = () => {
    const first = Math.floor(Math.random() * 8) + 2;
    const second = Math.floor(Math.random() * 7) + 3;
    expectedCaptchaAnswer = first + second;

    if (captchaQuestion) {
      captchaQuestion.textContent = `${first} + ${second} =`;
    }

    if (captchaAnswer) {
      captchaAnswer.value = "";
    }

    if (captchaError) {
      captchaError.textContent = "";
    }
  };

  setCaptcha();

  if (captchaRefresh) {
    captchaRefresh.addEventListener("click", setCaptcha);
  }

  emailForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (captchaAnswer && Number(captchaAnswer.value) !== expectedCaptchaAnswer) {
      if (captchaError) {
        captchaError.textContent = "Please solve the verification question correctly.";
      }
      captchaAnswer.focus();
      return;
    }

    const submitButton = emailForm.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.textContent : "";
    const ajaxAction = emailForm.dataset.ajaxAction;
    const successUrl = emailForm.dataset.successUrl || "thank-you.html";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      const response = await fetch(ajaxAction, {
        method: "POST",
        body: new FormData(emailForm),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      window.location.href = successUrl;
    } catch (error) {
      emailForm.removeAttribute("data-email-form");
      HTMLFormElement.prototype.submit.call(emailForm);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
}
