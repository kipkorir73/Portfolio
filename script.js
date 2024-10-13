document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    // Menu toggle functionality
    menuToggle.addEventListener('click', function () {
        menu.classList.toggle('open');
        this.setAttribute('aria-expanded', menu.classList.contains('open'));
    });

    // Contact form submission event listener
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate and sanitize user input
        const formData = new FormData(contactForm);
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const message = formData.get('message').trim();

        // Check if all fields are filled
        if (name && email && message) {
            // Submit the form
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
        } else {
            // Display an error message if any field is empty
            successMessage.style.display = 'none';
            errorMessage.style.display = 'block';
        }
    });
});
