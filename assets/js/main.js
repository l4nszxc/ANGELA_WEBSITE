const STORAGE_KEY = 'angela_coastal_escapes_inquiries';

function readInquiries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeInquiries(inquiries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderSavedRequests() {
  const container = document.querySelector('[data-saved-requests]');
  if (!container) {
    return;
  }

  const inquiries = readInquiries();

  if (!inquiries.length) {
    container.innerHTML = '<div class="text-muted">No saved requests yet on this device.</div>';
    return;
  }

  container.innerHTML = inquiries
    .slice()
    .reverse()
    .map((entry) => `
      <div class="list-group-item rounded-4 mb-3 border-0 shadow-sm">
        <div class="d-flex justify-content-between flex-wrap gap-2 mb-2">
          <strong>${escapeHtml(entry.name)}</strong>
          <span class="badge badge-soft rounded-pill">${escapeHtml(entry.type)}</span>
        </div>
        <div class="small text-muted mb-1">${escapeHtml(entry.email)} ${entry.phone ? `| ${escapeHtml(entry.phone)}` : ''}</div>
        <div class="small mb-1"><strong>Travel date:</strong> ${escapeHtml(entry.travelDate || 'Flexible')}</div>
        <div class="small mb-1"><strong>Interest:</strong> ${escapeHtml(entry.packageName || 'General inquiry')}</div>
        <div class="small"><strong>Message:</strong> ${escapeHtml(entry.message)}</div>
      </div>
    `)
    .join('');
}

function showStatus(form, message, kind = 'success') {
  const status = form.querySelector('[data-form-status]');
  if (!status) {
    return;
  }

  status.innerHTML = `<div class="alert alert-${kind} rounded-4 mb-0">${message}</div>`;
}

function handleInquiryForm(form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const inquiry = {
      name: formData.get('name')?.toString().trim(),
      email: formData.get('email')?.toString().trim(),
      phone: formData.get('phone')?.toString().trim(),
      travelDate: formData.get('travelDate')?.toString().trim(),
      packageName: formData.get('packageName')?.toString().trim(),
      guests: formData.get('guests')?.toString().trim(),
      type: form.dataset.formType || 'Inquiry',
      message: formData.get('message')?.toString().trim(),
      createdAt: new Date().toISOString()
    };

    if (!inquiry.name || !inquiry.email || !inquiry.message) {
      showStatus(form, 'Please fill in the required fields marked with an asterisk.', 'warning');
      return;
    }

    const inquiries = readInquiries();
    inquiries.push(inquiry);
    writeInquiries(inquiries);
    form.reset();
    showStatus(form, 'Your request has been saved locally on this device. We will reply through the contact details you provided.', 'success');
    renderSavedRequests();
  });
}

function activateCurrentNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-page]').forEach((link) => {
    const isActive = link.getAttribute('data-page') === currentPath;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function setYear() {
  const year = document.querySelector('[data-year]');
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

function bindStorageControls() {
  const clearButton = document.querySelector('[data-clear-storage]');
  if (!clearButton) {
    return;
  }

  clearButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    renderSavedRequests();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  activateCurrentNavLink();
  setYear();
  document.querySelectorAll('form[data-save-inquiry]').forEach(handleInquiryForm);
  renderSavedRequests();
  bindStorageControls();
});
