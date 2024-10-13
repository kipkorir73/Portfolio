const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('active');
});

const contactForm = document.querySelector('.contact-form');
const contactFormInputs = contactForm.querySelectorAll('input, textarea');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    fetch('/contact', {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
});

contactFormInputs.forEach((input) => {
    input.addEventListener('focus', () => {
        input.classList.add('focused');
    });

    input.addEventListener('blur', () => {
        input.classList.remove('focused');
    });
});
