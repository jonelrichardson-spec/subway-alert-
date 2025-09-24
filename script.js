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
  const KEY = 'task_manager_tasks_v1';
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load tasks', e);
      return [];
    }
  }
  function save(tasks) {
    try {
      localStorage.setItem(KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }
  return { load, save };
})();

/* -------------------- TaskModel -------------------- */
const TaskModel = (() => {
  let tasks = Storage.load();

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
    Storage.save(tasks);
  }

  function remove(id) {
    tasks = tasks.filter(t => t.id !== id);
    Storage.save(tasks);
  }

  function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    Storage.save(tasks);
  }

  function toggleAll() {
    const anyNot = tasks.some(t => !t.completed);
    tasks = tasks.map(t => ({ ...t, completed: anyNot }));
    Storage.save(tasks);
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

  function formatCount(n) { return `${n} task${n === 1 ? '' : 's'}`; }

  function bindEvents() {
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

  function render() {
    const tasks = TaskModel.all();
    refs.list.innerHTML = tasks.map(t => renderItem(t)).join('');
    refs.count.textContent = formatCount(tasks.length);
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
  function init() {
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
