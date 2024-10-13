/* Animation styles */
.main-content {
    opacity: 0; /* Start hidden */
    transform: translateY(50px); /* Slide in from below */
    transition: opacity 0.6s ease, transform 0.6s ease; /* Smooth transition */
}

.main-content.animate {
    opacity: 1; /* Fully visible */
    transform: translateY(0); /* Original position */
}

/* Responsive styles for smaller devices */
@media (max-width: 768px) {
    .navbar {
        flex-direction: column; /* Stack items in navbar */
    }

    .profile-pic img {
        width: 80%; /* Make profile image smaller */
    }

    .project-card img {
        width: 100%; /* Full width for project images */
    }
}

