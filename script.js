document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    menuToggle.addEventListener('click', function () {
        menu.classList.toggle('open');
        this.setAttribute('aria-expanded', menu.classList.contains('open'));

        // Close the menu after 2.5 seconds of inactivity
        let timer;
        clearTimeout(timer);
        timer = setTimeout(() => {
            menu.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }, 2500);
    });

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(contactForm);

        fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';
                contactForm.reset(); // Clear the form fields
            } else {
                throw new Error('Network response was not ok.');
            }
        }).catch(error => {
            successMessage.style.display = 'none';
            errorMessage.style.display = 'block';
        });
    });
});
