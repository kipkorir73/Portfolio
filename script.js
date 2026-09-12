// Function to toggle the sidebar visibility
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar'); // Get the sidebar element
    const navbar = document.querySelector('.navbar'); // Get the navbar element

    // Toggle the "open" class on the sidebar
    sidebar.classList.toggle('open');

    // If the sidebar is open, hide the navbar for smaller screens
    if (sidebar.classList.contains('open')) {
        navbar.style.display = 'none'; // Hide the navbar when sidebar is open
    } else {
        // When sidebar is closed, check screen size
        checkScreenSize(); // Run checkScreenSize function to handle navbar visibility
    }
}

// Function to ensure the navbar stays visible on larger screens
function checkScreenSize() {
    const sidebar = document.getElementById('sidebar');
    const navbar = document.querySelector('.navbar');

    // Check if the screen width is above a certain threshold (desktop size)
    if (window.innerWidth > 768) {
        // Ensure the sidebar is closed and the navbar is visible
        sidebar.classList.remove('open');
        navbar.style.display = 'flex'; // Display navbar for larger screens
    } else {
        // If screen size is small, hide the navbar and allow sidebar toggling
        navbar.style.display = 'none'; // Keep navbar hidden for small screens
    }
}

// Listen for screen resize events to adjust the layout
window.addEventListener('resize', checkScreenSize);

// Run checkScreenSize on page load to ensure correct visibility
window.addEventListener('load', checkScreenSize);

// Function to handle the dropdown behavior
function toggleDropdown() {
    const dropdownMenu = document.querySelector('.dropdown-menu');
    dropdownMenu.classList.toggle('show');
}

// Close the dropdown menu if the user clicks outside of it
window.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    // If the click is outside of the dropdown button, close the dropdown
    if (!dropdown.contains(event.target)) {
        dropdownMenu.classList.remove('show');
    }
});
// Function to check if an element is in the viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Function to add fade-in effect when element is in the viewport
function fadeInOnScroll() {
    const sections = document.querySelectorAll('section:not(.home)'); // Target all sections except the Home section

    sections.forEach(el => {
        // If the section is in the viewport, add the 'visible' class
        if (isElementInViewport(el)) {
            el.classList.add('visible');
        }
    });
}

// To optimize performance, debounce the scroll event handler
let isScrolling = false;
window.addEventListener('scroll', function() {
    if (!isScrolling) {
        isScrolling = true;
        window.requestAnimationFrame(function() {
            fadeInOnScroll();
            isScrolling = false;
        });
    }
});

// Also, run the fade-in check on page load to catch already visible sections
window.addEventListener('load', fadeInOnScroll);
