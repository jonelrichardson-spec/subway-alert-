// Mock database with sample alerts for the prototype
const mockDatabase = {
  alerts: [
    { id: 1, line: 'A', status: 'good', message: 'Good service' },
    { id: 2, line: '2', status: 'delayed', message: 'Delays due to signal problems' },
    { id: 3, line: 'L', status: 'suspended', message: 'Service suspended between 8 Av and 6 Av' }
  ]
};

// Simulated API (the connector)
function getServiceAlerts() {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('API call successful! Data received.');
      resolve(mockDatabase.alerts);
    }, 1000);
  });
}

// UI helper
const $ = id => document.getElementById(id);

const alertBanner = $('alert-banner');
const alertMessage = $('alert-message');

function clearAlertClasses() {
  if (!alertBanner) return;
  alertBanner.classList.remove('alert-suspended', 'alert-delayed', 'alert-good');
}

function selectMostSevereAlert(alerts) {
  if (!Array.isArray(alerts) || alerts.length === 0) return null;
  const priority = { suspended: 3, delayed: 2, good: 1 };
  return alerts.reduce((best, a) => {
    if (!best) return a;
    return (priority[a.status] || 0) > (priority[best.status] || 0) ? a : best;
  }, null);
}

function displayAlerts(alerts) {
  if (!alertBanner || !alertMessage) return;
  const alert = selectMostSevereAlert(alerts);
  if (!alert) {
    alertBanner.classList.add('alert-hidden');
    alertMessage.textContent = '';
    return;
  }
  clearAlertClasses();
  alertBanner.classList.remove('alert-hidden');
  alertBanner.classList.add(`alert-${alert.status}`);
  alertMessage.textContent = `${alert.line} Train: ${alert.message}`;
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  getServiceAlerts()
    .then(displayAlerts)
    .catch((err) => {
      console.error('Error fetching alerts:', err);
      if (!alertBanner || !alertMessage) return;
      alertBanner.classList.remove('alert-hidden');
      clearAlertClasses();
      alertBanner.classList.add('alert-suspended');
      alertMessage.textContent = 'Could not retrieve alerts.';
    });
});