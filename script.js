// Function to animate testimonials
const animateTestimonials = () => {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const windowHeight = window.innerHeight;

    testimonialCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < windowHeight - 50) {
            card.style.opacity = '1'; // Fade in
            card.style.transform = 'translateY(0)'; // Move to original position
        }
    });
};

// Function to animate experience section
const animateExperience = () => {
    const experienceCards = document.querySelectorAll('.experience-card');
    const windowHeight = window.innerHeight;

    experienceCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < windowHeight - 50) {
            card.style.opacity = '1'; // Fade in
            card.style.transform = 'translateY(0)'; // Move to original position
        }
    });
};

// Submit contact form
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    const formMessage = document.querySelector('.form-message');
    formMessage.innerText = "Thank you for your message! I'll get back to you soon.";
    contactForm.reset(); // Reset the form
});

// Add scroll event listener for animations
window.addEventListener('scroll', () => {
    animateTestimonials();
    animateExperience();
});

// Initial animation on page load
window.addEventListener('load', () => {
    animateTestimonials();
    animateExperience();
});
