// Mobile navigation drawer: toggles the global topic sidebar (#sidebar)
// open/closed on small screens via #nav-toggle, with a backdrop
// (#sidebar-backdrop) to close on outside click, Escape-to-close, and
// focus returned to the toggle button on close. Purely presentational —
// no study state, no routing.

function initMobileNav() {
  var toggle = document.getElementById('nav-toggle');
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('sidebar-backdrop');
  if (!toggle || !sidebar || !backdrop) {
    return;
  }

  function openDrawer() {
    sidebar.classList.add('is-open');
    backdrop.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    sidebar.classList.remove('is-open');
    backdrop.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    if (sidebar.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  backdrop.addEventListener('click', function () {
    closeDrawer();
    toggle.focus();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
      closeDrawer();
      toggle.focus();
    }
  });

  // Selecting a topic from the drawer should close it behind the navigation.
  sidebar.addEventListener('click', function (event) {
    if (event.target.closest('a') && sidebar.classList.contains('is-open')) {
      closeDrawer();
    }
  });
}
