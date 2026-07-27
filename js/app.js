/** Application shell bootstrap — Sprint 2 UI foundation */

/**
 * Initialize the dashboard application shell.
 */
export function initApp() {
  setupSidebar();
  setupKeyboardNavigation();
  setupFocusManagement();
  setupPlaceholderNav();
}

/**
 * Prevent placeholder navigation links from scrolling the page.
 */
function setupPlaceholderNav() {
  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
}

/**
 * Mobile sidebar toggle and overlay dismiss.
 */
function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggle = document.getElementById('sidebar-toggle');

  if (!sidebar || !overlay || !toggle) return;

  const openSidebar = () => {
    sidebar.classList.add('sidebar--open');
    overlay.classList.add('sidebar-overlay--visible');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    sidebar.classList.remove('sidebar--open');
    overlay.classList.remove('sidebar-overlay--visible');
    overlay.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.contains('sidebar--open');
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);

  sidebar.querySelectorAll('.nav-list__link').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 1023px)').matches) {
        closeSidebar();
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar.classList.contains('sidebar--open')) {
      closeSidebar();
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
    if (event.matches) closeSidebar();
  });
}

/**
 * Arrow-key navigation within the sidebar nav list.
 */
function setupKeyboardNavigation() {
  const nav = document.querySelector('.sidebar__nav .nav-list');
  if (!nav) return;

  nav.addEventListener('keydown', (event) => {
    const links = [...nav.querySelectorAll('.nav-list__link')];
    const currentIndex = links.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % links.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + links.length) % links.length;
    } else if (event.key === 'Home') {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      nextIndex = links.length - 1;
    } else {
      return;
    }

    links[nextIndex].focus();
  });
}

/**
 * Move focus to main content when skip link is activated.
 */
function setupFocusManagement() {
  const skipLink = document.querySelector('.skip-link');
  const main = document.getElementById('main-content');

  if (!skipLink || !main) return;

  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    main.focus({ preventScroll: false });
  });
}

document.addEventListener('DOMContentLoaded', initApp);
