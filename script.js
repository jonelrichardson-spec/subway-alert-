/*
  File: script.js
  Purpose: Application logic for Task Manager app.
  Structure:
    - Storage: localStorage wrapper
    - TaskModel: task data operations
    - UI: DOM rendering and event handling
    - App: initialization and orchestration
  Notes:
    - Uses ES6+ features and modular functions
    - No inline event handlers in HTML
*/

/* -------------------- Storage -------------------- */
const Storage = (() => {
  const TASKS_KEY = 'task_manager_tasks_v1';
  const LANG_KEY = 'task_manager_lang';

  function loadTasks() {
    try {
      const raw = localStorage.getItem(TASKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load tasks', e);
      return [];
    }
  }

  function saveTasks(tasks) {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }

  function getLanguage() {
    return localStorage.getItem(LANG_KEY) || 'en';
  }

  function saveLanguage(lang) {
    localStorage.setItem(LANG_KEY, lang);
  }

  return { loadTasks, saveTasks, getLanguage, saveLanguage };
})();

/* -------------------- I18n -------------------- */
const I18n = (() => {
  let currentLanguage = Storage.getLanguage();

  async function init() {
    try {
      const module = await import('./languages.js');
      return module.languages;
    } catch (e) {
      console.error('Failed to load language configurations', e);
      return null;
    }
  }

  function getCurrentLang() {
    return currentLanguage;
  }

  async function setLanguage(lang) {
    const languages = await init();
    if (languages && languages[lang]) {
      currentLanguage = lang;
      Storage.saveLanguage(lang);
      return translatePage(languages[lang].translations);
    }
    return false;
  }

  function translatePage(translations) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });

    // Update placeholders
    document.getElementById('task-input').placeholder = translations.taskPlaceholder;

    // Update buttons
    document.querySelectorAll('[data-action="remove"]').forEach(btn => {
      btn.textContent = translations.deleteBtn;
    });

    document.getElementById('clear-completed').textContent = translations.clearCompleted;
    document.getElementById('toggle-all').textContent = translations.toggleAll;

    return true;
  }

  return { init, getCurrentLang, setLanguage };
})();

/* -------------------- TaskModel -------------------- */
const TaskModel = (() => {
  let tasks = Storage.loadTasks();

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

  function all() { return [...tasks]; }

  function add(title) {
    const t = { id: uid(), title: title.trim(), completed: false, createdAt: new Date().toISOString() };
    tasks.unshift(t);
    Storage.save(tasks);
    return t;
  }

  function toggle(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    Storage.saveTasks(tasks);
  }

  function remove(id) {
    tasks = tasks.filter(t => t.id !== id);
    Storage.saveTasks(tasks);
  }

  function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    Storage.saveTasks(tasks);
  }

  function toggleAll() {
    const anyNot = tasks.some(t => !t.completed);
    tasks = tasks.map(t => ({ ...t, completed: anyNot }));
    Storage.saveTasks(tasks);
  }

  function loadInitial(data = []) {
    tasks = Array.isArray(data) ? data : [];
    Storage.save(tasks);
  }

  return { all, add, toggle, remove, clearCompleted, toggleAll, loadInitial };
})();

/* -------------------- UI -------------------- */
const UI = (() => {
  // cached selectors
  const refs = {
    form: document.getElementById('task-form'),
    input: document.getElementById('task-input'),
    list: document.getElementById('tasks'),
    clearCompletedBtn: document.getElementById('clear-completed'),
    toggleAllBtn: document.getElementById('toggle-all'),
    count: document.getElementById('task-count')
  };

  async function formatCount(n) {
    const languages = await I18n.init();
    const currentLang = I18n.getCurrentLang();
    const translations = languages[currentLang].translations;
    return n === 1 ? translations.taskCountSingular : translations.taskCount.replace('{0}', n);
  }

  function bindEvents() {
    // Language selector event
    document.getElementById('language-select').addEventListener('change', async (e) => {
      await I18n.setLanguage(e.target.value);
      render(); // Re-render to update all text
    });

    refs.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = refs.input.value.trim();
      if (!v) return;
      const task = TaskModel.add(v);
      refs.input.value = '';
      render();
      // optional focus
      refs.input.focus();
    });

    refs.clearCompletedBtn.addEventListener('click', () => {
      TaskModel.clearCompleted();
      render();
    });

    refs.toggleAllBtn.addEventListener('click', () => {
      TaskModel.toggleAll();
      render();
    });

    // delegate list events
    refs.list.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.closest('[data-id]').dataset.id;
      const action = btn.dataset.action;
      if (action === 'toggle') TaskModel.toggle(id);
      if (action === 'remove') TaskModel.remove(id);
      render();
    });
  }

  async function render() {
    const tasks = TaskModel.all();
    refs.list.innerHTML = tasks.map(t => renderItem(t)).join('');
    refs.count.textContent = await formatCount(tasks.length);
    
    // Re-translate dynamic content
    const languages = await I18n.init();
    const currentLang = I18n.getCurrentLang();
    const translations = languages[currentLang].translations;
    
    // Update delete buttons
    document.querySelectorAll('[data-action="remove"]').forEach(btn => {
      btn.textContent = translations.deleteBtn;
    });
  }

  function renderItem(t) {
    // use data attributes for event delegation
    return `
      <li class="task-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
        <label class="content"><input type="checkbox" ${t.completed ? 'checked' : ''} data-action="toggle"/> <span>${escapeHtml(t.title)}</span></label>
        <div class="task-actions">
          <button class="btn" data-action="remove" aria-label="Remove task">Delete</button>
        </div>
      </li>
    `;
  }

  function escapeHtml(str = '') {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return { bindEvents, render };
})();

/* -------------------- App -------------------- */
const App = (() => {
  async function init() {
    // Initialize i18n
    await I18n.init();
    await I18n.setLanguage(Storage.getLanguage());

    // Set the language selector to the stored language
    document.getElementById('language-select').value = Storage.getLanguage();

    // load initial data if none exists (optional)
    const existing = TaskModel.all();
    if (!existing || existing.length === 0) {
      TaskModel.loadInitial([
        { id: 't1', title: 'Welcome — try adding a new task', completed: false, createdAt: new Date().toISOString() }
      ]);
    }

    UI.bindEvents();
    UI.render();
  }

  return { init };
})();

// Bootstrap
document.addEventListener('DOMContentLoaded', () => App.init());
