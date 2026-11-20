/**
 * ====================================================================
 * SUN YOGA STUDIO — APPLE-INSPIRED PWA & DESKTOP APPLICATION CORE
 * ====================================================================
 */

// Application State
const state = {
  students: [],
  filteredStudents: [],
  payments: [],
  activeFilter: 'all', // 'all', 'active', 'expiring', 'overdue'
  sortOrder: 'expiry-asc', // 'expiry-asc', 'expiry-desc', 'name-asc', 'newest'
  searchQuery: '',
  activeTab: 'tab-students',
  revenueVisible: true,
  settings: {
    googleSheetUrl: '',
    packages: [
      { name: 'Gói 1 Tháng', fee: 800000, durationMonths: 1 },
      { name: 'Gói 3 Tháng', fee: 2200000, durationMonths: 3 },
      { name: 'Gói 6 Tháng', fee: 4000000, durationMonths: 6 }
    ],
    classes: [
      { name: 'Lớp Sáng (06:00 - 07:15)' },
      { name: 'Lớp Trưa (11:45 - 12:45)' },
      { name: 'Lớp Chiều (17:30 - 18:45)' }
    ],
    notificationsEnabled: false,
    wallpaper: {
      enabled: false,
      image: 'default',
      opacity: 50
    }
  },
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selectedStudent: null
};

// LocalStorage Keys
const STORAGE_KEYS = {
  STUDENTS: 'sun_yoga_warm_pastel_members_v3',
  SETTINGS: 'sun_yoga_mobile_settings',
  PAYMENTS: 'sun_yoga_mobile_payments'
};

function getRelativeDateString(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Default Initial Sample Students (Exact Warm Pastel Zen Mockup)
const SAMPLE_STUDENTS = [
  {
    id: 'mem-1',
    name: 'Phạm Phương Linh',
    phone: '0934556789',
    className: 'Lớp Trưa',
    classTime: '11:45 - 12:45',
    classStartDate: '2026-10-10',
    expiryDate: getRelativeDateString(-5), // Quá hạn 5 ngày
    totalDays: 30,
    package: 'Gói 1 Tháng',
    feePaid: 800000,
    notes: 'Quá hạn thẻ 5 ngày cần nhắc thanh toán',
    createdAt: '2026-10-10T11:45:00.000Z'
  },
  {
    id: 'mem-2',
    name: 'Lê Hoàng Yến',
    phone: '0905112233',
    className: 'Lớp Sáng',
    classTime: '06:00 - 07:15',
    classStartDate: '2026-10-27',
    expiryDate: getRelativeDateString(12), // Còn 12 ngày
    totalDays: 30,
    package: 'Gói 1 Tháng',
    feePaid: 800000,
    notes: 'Học viên chăm chỉ',
    createdAt: '2026-10-27T06:00:00.000Z'
  },
  {
    id: 'mem-3',
    name: 'Nguyễn Thu Trang',
    phone: '0912345678',
    className: 'Lớp Sáng',
    classTime: '06:00 - 07:15',
    classStartDate: '2026-09-01',
    expiryDate: getRelativeDateString(23), // Còn 23 ngày
    totalDays: 60,
    package: 'Gói 2 Tháng',
    feePaid: 1500000,
    notes: 'Tập Vinyasa Flow đều đặn',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'mem-4',
    name: 'Trần Minh Đức',
    phone: '0988776554',
    className: 'Lớp Chiều',
    classTime: '17:30 - 18:45',
    classStartDate: '2026-08-25',
    expiryDate: getRelativeDateString(23), // Còn 23 ngày
    totalDays: 90,
    package: 'Gói 3 Tháng',
    feePaid: 2200000,
    notes: 'HLV Thanh Tâm hướng dẫn',
    createdAt: '2026-08-25T17:30:00.000Z'
  },
  {
    id: 'mem-5',
    name: 'Vũ Minh Khôi',
    phone: '0977889900',
    className: 'Lớp Tối',
    classTime: '19:00 - 20:15',
    classStartDate: '2026-09-15',
    expiryDate: getRelativeDateString(45), // Còn 45 ngày
    totalDays: 90,
    package: 'Gói 3 Tháng',
    feePaid: 2200000,
    notes: 'Lớp Relax & Yin Yoga',
    createdAt: '2026-09-15T19:00:00.000Z'
  }
];

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadLocalData();
  registerServiceWorker();
  bindUIEvents();
  renderAll();
  checkExpiringAndNotify();

  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    switchTab(hash);
  } else {
    switchTab('tab-students');
  }

  if (state.settings.googleSheetUrl) {
    syncWithGoogleSheet();
  }
});

// PWA Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=3.4')
      .then((reg) => {
        console.log('Service Worker registered:', reg.scope);
        reg.update().catch(() => {});
      })
      .catch((err) => console.warn('Service Worker registration failed:', err));
  }
}

// Load data from LocalStorage
function loadLocalData() {
  try {
    document.body.classList.remove('has-custom-bg');
    document.body.style.removeProperty('--app-bg-url');
    document.body.style.removeProperty('--app-overlay-opacity');
    document.body.style.removeProperty('--app-bg-blur');

    const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (rawStudents) {
      state.students = JSON.parse(rawStudents);
    } else {
      state.students = SAMPLE_STUDENTS;
      saveLocalStudents();
    }

    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) {
      state.settings = { ...state.settings, ...JSON.parse(rawSettings) };
    }

    const rawPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (rawPayments) {
      try {
        state.payments = JSON.parse(rawPayments);
      } catch (err) {
        state.payments = [];
      }
    } else {
      state.payments = [];
    }

    // Initialize payments from sample/existing students with feePaid if empty
    if (!Array.isArray(state.payments) || state.payments.length === 0) {
      state.payments = [];
      state.students.forEach((s) => {
        if (s.feePaid && Number(s.feePaid) > 0) {
          state.payments.push({
            id: 'pay_' + s.id,
            studentId: s.id,
            studentName: s.name,
            amount: Number(s.feePaid),
            package: s.package || 'Gói chuẩn',
            date: s.classStartDate || (s.createdAt ? s.createdAt.slice(0, 10) : getTodayDateString()),
            notes: 'Học phí ghi nhận',
            createdAt: s.createdAt || new Date().toISOString()
          });
        }
      });
      if (state.payments.length > 0) {
        saveLocalPayments();
      }
    }
  } catch (e) {
    console.error('Error loading local data:', e);
  }
}

function saveLocalStudents() {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(state.students));
}

function saveLocalPayments() {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(state.payments || []));
}

function saveLocalSettings() {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
}

// UI Event Bindings
function bindUIEvents() {
  // Desktop Sidebar Links
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Mobile Bottom Tabs
  document.querySelectorAll('.tab-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Filter Segmented Controls (Unified Metric Strip & Pills)
  document.querySelectorAll('.filter-pill, .metric-segment').forEach((control) => {
    control.addEventListener('click', () => {
      const filter = control.getAttribute('data-filter') || 'all';
      document.querySelectorAll('.filter-pill, .metric-segment').forEach((c) => {
        const isMatch = c.getAttribute('data-filter') === filter;
        c.classList.toggle('active', isMatch);
        if (c.hasAttribute('aria-selected')) {
          c.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        }
      });
      state.activeFilter = filter;
      filterAndRenderStudents();
    });
  });

  // Search Inputs (Desktop and Mobile)
  const desktopSearch = document.getElementById('search-students');
  const mobileSearch = document.getElementById('mobile-search-students');
  const btnClearMobileSearch = document.getElementById('btn-clear-mobile-search');

  const updateClearSearchBtn = () => {
    if (btnClearMobileSearch && mobileSearch) {
      btnClearMobileSearch.style.display = mobileSearch.value.trim() ? 'flex' : 'none';
    }
  };

  const handleSearch = (val) => {
    state.searchQuery = (val || '').trim().toLowerCase();
    if (desktopSearch && desktopSearch.value !== val) desktopSearch.value = val;
    if (mobileSearch && mobileSearch.value !== val) mobileSearch.value = val;
    updateClearSearchBtn();
    filterAndRenderStudents();
  };

  if (desktopSearch) {
    desktopSearch.addEventListener('input', (e) => handleSearch(e.target.value));
    desktopSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') handleSearch('');
    });
  }
  if (mobileSearch) {
    mobileSearch.addEventListener('input', (e) => handleSearch(e.target.value));
    mobileSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') handleSearch('');
    });
  }
  if (btnClearMobileSearch && mobileSearch) {
    btnClearMobileSearch.addEventListener('click', () => {
      handleSearch('');
      mobileSearch.focus();
    });
  }

  // Sort Selectors (Mobile & Desktop)
  const mobileSort = document.getElementById('sort-students-select');
  const desktopSort = document.getElementById('desktop-sort-students-select');
  const sortLabelEl = document.getElementById('mobile-sort-current-label');

  const updateSortLabel = (val) => {
    if (!sortLabelEl) return;
    const labelMap = {
      'expiry-asc': 'Hạn gần',
      'expiry-desc': 'Hạn xa',
      'name-asc': 'Tên A-Z',
      'newest': 'Mới thêm'
    };
    sortLabelEl.textContent = labelMap[val] || 'Hạn gần';
  };

  const handleSortChange = (val) => {
    state.sortOrder = val;
    if (mobileSort && mobileSort.value !== val) mobileSort.value = val;
    if (desktopSort && desktopSort.value !== val) desktopSort.value = val;
    updateSortLabel(val);
    filterAndRenderStudents();
  };

  if (mobileSort) {
    mobileSort.value = state.sortOrder;
    updateSortLabel(state.sortOrder);
    mobileSort.addEventListener('change', (e) => handleSortChange(e.target.value));
  }
  if (desktopSort) {
    desktopSort.value = state.sortOrder;
    desktopSort.addEventListener('change', (e) => handleSortChange(e.target.value));
  }

  // Add Student Buttons (Sidebar, Desktop Header, Mobile Top)
  const btnSidebarAdd = document.getElementById('sidebar-btn-add');
  if (btnSidebarAdd) {
    btnSidebarAdd.addEventListener('click', () => openStudentSheet(null));
  }
  const btnDesktopAdd = document.getElementById('btn-desktop-add');
  if (btnDesktopAdd) {
    btnDesktopAdd.addEventListener('click', () => openStudentSheet(null));
  }
  const btnMobileAdd = document.getElementById('btn-mobile-add');
  if (btnMobileAdd) {
    btnMobileAdd.addEventListener('click', () => openStudentSheet(null));
  }

  // Sync Buttons
  document.querySelectorAll('#btn-sync-now').forEach((btn) => {
    btn.addEventListener('click', syncWithGoogleSheet);
  });

  // Toggle Revenue Visibility
  const btnToggleRev = document.getElementById('btn-toggle-revenue');
  if (btnToggleRev) {
    btnToggleRev.addEventListener('click', () => {
      state.revenueVisible = !state.revenueVisible;
      renderRevenue();
    });
  }

  // Package selection change: auto update fee & duration
  const pkgSelectEl = document.getElementById('input-student-package');
  if (pkgSelectEl) {
    pkgSelectEl.addEventListener('change', (e) => {
      const selectedPkg = state.settings.packages.find((p) => p.name === e.target.value);
      if (selectedPkg) {
        const feeInput = document.getElementById('input-student-fee');
        if (feeInput && selectedPkg.fee) feeInput.value = selectedPkg.fee;
      }
    });
  }

  // Form Submit
  const studentForm = document.getElementById('student-form');
  if (studentForm) {
    studentForm.addEventListener('submit', handleStudentFormSubmit);
  }

  // Delete Student Button
  const btnDelete = document.getElementById('btn-delete-student');
  if (btnDelete) {
    btnDelete.addEventListener('click', handleDeleteStudent);
  }

  // Wallpaper Toggle Switch
  const toggleWp = document.getElementById('toggle-wallpaper-switch');
  if (toggleWp) {
    toggleWp.addEventListener('change', (e) => {
      if (!state.settings.wallpaper) state.settings.wallpaper = { enabled: true, image: 'default', opacity: 50 };
      state.settings.wallpaper.enabled = e.target.checked;
      saveLocalSettings();
      applyWallpaper();
      showToast(e.target.checked ? 'Đã bật hình nền Studio' : 'Đã tắt hình nền, chuyển sang nền sáng phẳng');
    });
  }

  // Bind Settings Segmented Hub & Lucian UX/UI Dynamic Menu Navigation
  bindSettingsHub();

  // Bind Lucian UX/UI #208 App Dock Navigation
  bindAppDockNavigation();

  // Bind Lucian UX/UI #011 Radial Floating Action Button
  initLucian011Radial();

  // Initialize May Bichon Mascot Companion System
  initMayMascot();

  // Initialize Lucian UX/UI #228 Cursor-Lit Liquid Glass Edge Spotlight (Desktop pointer only)
  initGlassSpotlight();
}

/* ====================================================================
   LUCIAN UX/UI PROMPT #228 ADAPTATION: CURSOR-LIT LIQUID GLASS EDGE
   MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#228
   ==================================================================== */
function initGlassSpotlight() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const container = document.querySelector('.content-scroll-area');
  if (!container) return;

  const SELECTOR = [
    '.kpi-wellness-card',
    '.wellness-student-directory',
    '.calendar-widget-card',
    '.today-schedule-card',
    '.revenue-hero-card',
    '.payment-history-card',
    '.settings-card',
    '.u037-trigger-chip'
  ].join(',');

  let pointerX = -9999;
  let pointerY = -9999;
  let active = false;
  let rafId = 0;

  function paint() {
    rafId = 0;
    const cards = container.querySelectorAll(SELECTOR);
    cards.forEach((card) => {
      if (!active || card.offsetParent === null) {
        card.style.setProperty('--go', '0');
        return;
      }
      const rect = card.getBoundingClientRect();
      const lx = pointerX - rect.left;
      const ly = pointerY - rect.top;
      const near = lx >= -48 && lx <= rect.width + 48 && ly >= -48 && ly <= rect.height + 48;
      if (near) {
        card.style.setProperty('--gx', lx.toFixed(1) + 'px');
        card.style.setProperty('--gy', ly.toFixed(1) + 'px');
        card.style.setProperty('--go', '1');
      } else {
        card.style.setProperty('--go', '0');
      }
    });
  }

  function schedule() {
    if (!rafId) rafId = requestAnimationFrame(paint);
  }

  container.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    pointerX = e.clientX;
    pointerY = e.clientY;
    active = true;
    schedule();
  }, { passive: true });

  container.addEventListener('pointerleave', () => {
    active = false;
    schedule();
  }, { passive: true });
}

// Bind Settings Interactive Dynamic Menu (Lucian UX/UI #037 Spring Flow & Highlight Bar)
function bindSettingsHub() {
  const root = document.getElementById('u037-root');
  const trigger = document.getElementById('u037-menu-trigger');
  const menu = document.getElementById('u037-dropdown-menu');
  const items = Array.from(document.querySelectorAll('.u037-menu-item'));
  const hlBar = document.querySelector('.u037-sliding-highlight');
  const panels = document.querySelectorAll('.settings-panel');
  const currentTitle = document.getElementById('u037-current-title');
  const currentSub = document.getElementById('u037-current-sub');
  const currentIcon = document.getElementById('u037-current-icon');

  // Fallback for legacy segmented buttons if present
  const legacyHubBtns = document.querySelectorAll('.settings-hub-btn');
  if (legacyHubBtns.length) {
    legacyHubBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetPanelId = btn.getAttribute('data-settings-panel');
        if (!targetPanelId) return;
        legacyHubBtns.forEach(b => b.classList.toggle('active', b === btn));
        panels.forEach(p => p.classList.toggle('active', p.id === targetPanelId));
      });
    });
  }

  if (!root || !trigger || !menu || !items.length) return;

  function setOpen(isOpen, focusFirst) {
    root.classList.toggle('is-open', isOpen);
    trigger.setAttribute('aria-expanded', String(isOpen));
    items.forEach(it => { it.tabIndex = isOpen ? 0 : -1; });
    if (isOpen && focusFirst) {
      setTimeout(() => { items[0].focus(); }, 60);
    }
  }

  function highlightItem(it) {
    if (!hlBar) return;
    const parent = it.closest('li');
    if (!parent) return;
    hlBar.style.setProperty('--y', parent.offsetTop + 'px');
    hlBar.style.setProperty('--h', parent.offsetHeight + 'px');
    hlBar.style.opacity = '1';
  }

  function selectPanel(item) {
    const targetPanelId = item.getAttribute('data-panel');
    const title = item.getAttribute('data-title');
    const sub = item.getAttribute('data-sub');
    const gradient = item.getAttribute('data-gradient');
    const iconBox = item.querySelector('.u037-item-icon-box');

    // Update active item styles
    items.forEach(it => {
      const isMatch = it === item;
      it.classList.toggle('active', isMatch);
      it.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    });

    // Update trigger UI
    if (currentTitle && title) currentTitle.textContent = title;
    if (currentSub && sub) currentSub.textContent = sub;
    if (currentIcon) {
      if (gradient) currentIcon.style.setProperty('--c', gradient);
      if (iconBox) currentIcon.innerHTML = iconBox.innerHTML;
      if (currentIcon.animate) {
        currentIcon.animate(
          [{ transform: 'scale(0.7) rotate(-15deg)' }, { transform: 'scale(1) rotate(0deg)' }],
          { duration: 420, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
        );
      }
    }

    // Switch panels with smooth fade
    panels.forEach(panel => {
      const isTarget = panel.id === targetPanelId;
      panel.classList.toggle('active', isTarget);
      if (isTarget) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // Close menu smoothly
    setOpen(false, false);
    trigger.focus({ preventScroll: true });
  }

  // Bind trigger click
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !root.classList.contains('is-open');
    setOpen(willOpen, false);
  });

  // Keyboard navigation & Hover highlight
  items.forEach((item, idx) => {
    item.addEventListener('pointerenter', () => highlightItem(item));
    item.addEventListener('focus', () => highlightItem(item));
    
    item.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
      if (dir) {
        e.preventDefault();
        items[(idx + dir + items.length) % items.length].focus();
      }
    });

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      selectPanel(item);
    });
  });

  menu.addEventListener('pointerleave', () => {
    if (hlBar) hlBar.style.opacity = '0';
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (root.classList.contains('is-open') && !root.contains(e.target)) {
      setOpen(false, false);
    }
  });

  // Escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) {
      e.preventDefault();
      setOpen(false, false);
      trigger.focus();
    }
  });
}

// ====================================================================
// LUCIAN UX/UI #208: CURSOR-MAGNIFIED APP DOCK NAVIGATION CONTROLLER
// ====================================================================
function bindAppDockNavigation() {
  const root = document.getElementById('u208-app-dock');
  if (!root) return;
  const dk = root.querySelector('.u208-dk');
  const tip = root.querySelector('.u208-tip');
  if (!dk || !tip) return;

  const buttons = Array.from(dk.querySelectorAll('.u208-a'));
  const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let mx = null;
  let fi = -1;
  let raf = 0;
  const BASE = window.innerWidth <= 767 ? 38 : 44;
  const MAX = window.innerWidth <= 767 ? 58 : 68;
  const SPREAD = window.innerWidth <= 767 ? 60 : 75;
  const GAP = 8;

  const items = buttons.map((btn, idx) => ({
    el: btn,
    name: btn.getAttribute('data-name') || btn.getAttribute('aria-label') || '',
    s: BASE
  }));

  function frame() {
    raf = 0;
    if (!root.isConnected) return;
    let busy = false;
    let best = -1;
    let bestS = 0;

    items.forEach((item, i) => {
      const c = (i - (items.length - 1) / 2) * (BASE + GAP);
      let tg = BASE;
      if (mx !== null) {
        const d = (mx - c) / SPREAD;
        tg = BASE + (MAX - BASE) * Math.exp(-d * d * 1.5);
      } else if (fi === i) {
        tg = MAX * 0.85;
      }

      item.s += (tg - item.s) * (rm ? 1 : 0.3);
      if (Math.abs(tg - item.s) > 0.1) {
        busy = true;
      } else {
        item.s = tg;
      }

      item.el.style.setProperty('--s', item.s.toFixed(2) + 'px');
      item.el.style.setProperty('--lift', ((item.s - BASE) * 0.3).toFixed(2) + 'px');

      if (item.s > bestS) {
        bestS = item.s;
        best = i;
      }
    });

    if ((mx !== null || fi >= 0) && bestS > BASE + 6 && best >= 0) {
      const el = items[best].el;
      const er = el.getBoundingClientRect();
      const rr = root.getBoundingClientRect();
      tip.textContent = items[best].name;
      tip.style.left = (er.left + er.width / 2 - rr.left).toFixed(1) + 'px';
      tip.style.bottom = (rr.bottom - er.top + 8).toFixed(1) + 'px';
      tip.classList.add('is-on');
    } else {
      tip.classList.remove('is-on');
    }

    if (busy) raf = requestAnimationFrame(frame);
  }

  function run() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  // Pointer move calculation over dock
  root.addEventListener('pointermove', (e) => {
    const rr = root.getBoundingClientRect();
    const dr = dk.getBoundingClientRect();
    const y = e.clientY - dr.bottom;
    // Activate magnification when cursor is within vertical vicinity
    mx = y > -140 && y < 15 ? e.clientX - rr.left - root.offsetWidth / 2 : null;
    run();
  });

  root.addEventListener('pointerleave', () => {
    mx = null;
    run();
  });

  // Button clicks & Hop Bounce animation
  buttons.forEach((btn, idx) => {
    btn.addEventListener('focus', () => {
      mx = null;
      fi = idx;
      run();
    });
    btn.addEventListener('blur', () => {
      fi = -1;
      run();
    });

    btn.addEventListener('click', () => {
      // Bounce Hop Animation
      btn.classList.remove('is-hop');
      void btn.offsetWidth; // force reflow
      btn.classList.add('is-hop');

      // Check if it's the Add action button (delegated to Lucian UX/UI #011 Radial FAB)
      if (btn.id === 'u208-btn-add') {
        return;
      }

      // Tab navigation
      const targetTab = btn.getAttribute('data-tab');
      if (targetTab) {
        switchTab(targetTab);
      }
    });
  });

  // Initial sizing run
  run();
}

// ====================================================================
// LUCIAN UX/UI #011: RADIAL FLOATING BUTTON (011, BUTTONS)
// MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#011
// ====================================================================
function initLucian011Radial() {
  const root = document.getElementById('u011-dock-menu');
  if (!root) return;
  const fab = root.querySelector('.u011-fab');
  const items = Array.prototype.slice.call(root.querySelectorAll('.u011-it'));
  const note = root.querySelector('.u011-note');
  const noteT = root.querySelector('.u011-note span');
  const backdrop = document.getElementById('u011-backdrop');
  const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = 0;

  function setOpen(v) {
    root.classList.toggle('is-open', v);
    if (backdrop) backdrop.classList.toggle('is-open', v);
    if (fab) {
      fab.setAttribute('aria-expanded', String(v));
      fab.setAttribute('aria-label', v ? 'Đóng menu thêm' : 'Thêm mới chức năng');
    }
    items.forEach((it) => { it.tabIndex = v ? 0 : -1; });
    if (v && note) note.classList.remove('is-on');
  }

  setOpen(false);

  if (fab) {
    fab.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!root.classList.contains('is-open'));
      if (typeof window.triggerZenRipple === 'function') {
        window.triggerZenRipple(e.clientX, e.clientY);
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => setOpen(false));
  }

  items.forEach((it, i) => {
    it.addEventListener('click', (e) => {
      e.stopPropagation();
      it.classList.remove('is-picked');
      void it.offsetWidth;
      it.classList.add('is-picked');
      clearTimeout(t);

      const action = it.getAttribute('data-action');
      const doneMsg = it.getAttribute('data-done');

      t = setTimeout(() => {
        if (!root.isConnected) return;
        setOpen(false);

        // Execute function based on action
        if (action === 'add-student') {
          openStudentSheet(null);
        } else if (action === 'add-class') {
          switchTab('tab-settings');
          const classBtn = document.querySelector('.u037-menu-item[data-panel="settings-classes-card"]') ||
                           document.querySelector('[data-settings-panel="settings-classes-card"]');
          if (classBtn) classBtn.click();
          setTimeout(() => {
            showAddClassForm();
            const formEl = document.getElementById('form-class-editor');
            if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
        } else if (action === 'add-package') {
          switchTab('tab-settings');
          const pkgBtn = document.querySelector('.u037-menu-item[data-panel="settings-packages-card"]') ||
                         document.querySelector('[data-settings-panel="settings-packages-card"]');
          if (pkgBtn) pkgBtn.click();
          setTimeout(() => {
            showAddPackageForm();
            const formEl = document.getElementById('form-package-editor');
            if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
        }

        if (note && noteT && doneMsg) {
          noteT.textContent = doneMsg;
          note.classList.add('is-on');
          t = setTimeout(() => {
            if (root.isConnected) note.classList.remove('is-on');
          }, 2000);
        }
      }, rm ? 0 : 260);
    });

    it.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (d) {
        e.preventDefault();
        items[(i + d + items.length) % items.length].focus();
      }
    });
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) {
      e.preventDefault();
      setOpen(false);
      fab?.focus();
    }
  });

  document.addEventListener('pointerdown', (e) => {
    if (root.isConnected && root.classList.contains('is-open') && !root.contains(e.target) && (!backdrop || !backdrop.contains(e.target))) {
      setOpen(false);
    }
  });
}

// ============================================================================
// BƠ: BROWN TOY POODLE MASCOT COMPANION SYSTEM
// ============================================================================
const MAY_QUOTES = [
  'Gâu! Bơ chào bạn đến Sun Yoga 🐾🤎',
  'Hôm nay lớp Sáng & Chiều đông vui quá! 🧘‍♀️',
  'Cún Poodle Bơ chúc bạn một ngày an yên ✨',
  'Chạm vào Bơ để cưng nựng nhé! 🐾',
  'Nhấn Thu phí để Bơ ghi sổ giúp nha! 🦴',
  'Yếm gấu của Bơ có xinh không nè? 🧸',
  'Hít vào bình an, thở ra nhẹ nhõm nha! 🌿',
  'Sun Yoga Studio ngập tràn năng lượng tích cực! ☀️'
];

let mayState = {
  roam: true,
  bubble: true,
  pose: 'walk', // 'walk' | 'sit' | 'jump' | 'sleep'
  bib: 'bear-bib', // 'bear-bib' | 'terracotta' | 'sage'
  facing: 'right', // 'right' | 'left'
  posX: 25, // %
  speed: 0.22,
  minX: 12,
  maxX: 74,
  jumpTimeout: null,
  sitTimeout: null,
  walkTicks: 0,
  isPanting: false
};

function initMayMascot() {
  const runner = document.getElementById('may-mascot-runner');
  const avatar = document.getElementById('may-svg-avatar');
  const svg = document.getElementById('may-bichon-svg');
  if (!runner || !svg) return;

  // Set initial position
  runner.style.left = mayState.posX + '%';
  setMayBubbleText('Gâu! Bơ chào bạn 🐾🤎', 4500);

  // 1. Walking Loop & Panting Cycle (Đi một lát đưa lưỡi ra thở phì phò)
  setInterval(() => {
    if (!mayState.roam || mayState.pose === 'sleep' || mayState.pose === 'jump' || mayState.pose === 'sit') {
      if (mayState.isPanting) {
        mayState.isPanting = false;
        if (svg) svg.classList.remove('is-panting');
      }
      return;
    }

    mayState.walkTicks++;
    // Sau khi đi ~3.2 giây (50 ticks x 65ms), cún May đưa lưỡi ra thở phì phò trong 2.6 giây (40 ticks)
    if (mayState.walkTicks >= 50 && mayState.walkTicks < 90) {
      if (!mayState.isPanting) {
        mayState.isPanting = true;
        if (svg) svg.classList.add('is-panting');
      }
    } else if (mayState.walkTicks >= 90) {
      if (mayState.isPanting) {
        mayState.isPanting = false;
        if (svg) svg.classList.remove('is-panting');
      }
      mayState.walkTicks = 0;
    }

    const step = mayState.facing === 'right' ? mayState.speed : -mayState.speed;
    mayState.posX += step;

    if (mayState.posX >= mayState.maxX) {
      mayState.facing = 'left';
      mayState.posX = mayState.maxX;
    } else if (mayState.posX <= mayState.minX) {
      mayState.facing = 'right';
      mayState.posX = mayState.minX;
    }

    runner.style.left = mayState.posX + '%';
    if (avatar) {
      avatar.classList.toggle('facing-left', mayState.facing === 'left');
      avatar.classList.toggle('facing-right', mayState.facing === 'right');
    }
  }, 65);

  // 2. Spontaneous Natural Sitting & Tail Wagging
  setInterval(() => {
    if (!mayState.roam || mayState.pose === 'sleep' || mayState.pose === 'jump') return;
    if (Math.random() > 0.65) {
      setMayPose('sit');
      clearTimeout(mayState.sitTimeout);
      mayState.sitTimeout = setTimeout(() => {
        if (mayState.pose === 'sit') {
          setMayPose('walk');
        }
      }, 3500);
    }
  }, 7000);

  // 3. Gentle Periodic Quote Refresh
  setInterval(() => {
    if (!mayState.bubble || mayState.pose === 'jump') return;
    const randomQuote = MAY_QUOTES[Math.floor(Math.random() * MAY_QUOTES.length)];
    setMayBubbleText(randomQuote);
  }, 16000);
}

function setMayPose(pose) {
  mayState.pose = pose;
  const svg = document.getElementById('may-bichon-svg');
  if (!svg) return;
  svg.classList.remove('pose-walk', 'pose-sit', 'pose-jump', 'pose-sleep');
  svg.classList.add('pose-' + pose);
  if (pose !== 'walk') {
    mayState.isPanting = false;
    mayState.walkTicks = 0;
    svg.classList.remove('is-panting');
  }
}

let bubbleHideTimer = null;

function setMayBubbleText(text, autoHideMs = 4500) {
  if (!mayState.bubble) return;
  const bubbleText = document.getElementById('may-bubble-text');
  const bubble = document.getElementById('may-speech-bubble');
  if (bubbleText && text) {
    bubbleText.textContent = text;
  }
  if (bubble) {
    bubble.classList.remove('is-hidden');
    bubble.style.transform = 'translateX(-50%) scale(1.08)';
    setTimeout(() => {
      bubble.style.transform = 'translateX(-50%) scale(1)';
    }, 220);

    clearTimeout(bubbleHideTimer);
    if (autoHideMs > 0) {
      bubbleHideTimer = setTimeout(() => {
        bubble.classList.add('is-hidden');
      }, autoHideMs);
    }
  }
}

function emitMayHearts() {
  const emitter = document.getElementById('may-hearts-emitter');
  if (!emitter) return;
  const particles = ['❤️', '✨', '🐾', '☁️'];
  for (let i = 0; i < 2; i++) {
    const p = document.createElement('span');
    p.className = 'may-heart-particle';
    p.textContent = particles[Math.floor(Math.random() * particles.length)];
    p.style.left = (40 + Math.random() * 20) + '%';
    p.style.animationDelay = (i * 0.15) + 's';
    emitter.appendChild(p);
    setTimeout(() => {
      if (p.parentNode) p.parentNode.removeChild(p);
    }, 1200);
  }
}

// Petting interaction
function petMayMascot(e) {
  if (e) e.stopPropagation();
  setMayPose('jump');
  clearTimeout(mayState.jumpTimeout);
  mayState.jumpTimeout = setTimeout(() => {
    setMayPose(mayState.roam ? 'walk' : 'sit');
  }, 1500);

  const quote = MAY_QUOTES[Math.floor(Math.random() * MAY_QUOTES.length)];
  setMayBubbleText(quote);
  emitMayHearts();

  if (e && typeof window.triggerZenRipple === 'function') {
    window.triggerZenRipple(e.clientX, e.clientY);
  }
}

// Cheer when actions complete (fee collection, add student, etc.)
window.mayCheer = function(type, name) {
  setMayPose('jump');
  clearTimeout(mayState.jumpTimeout);
  mayState.jumpTimeout = setTimeout(() => {
    setMayPose(mayState.roam ? 'walk' : 'sit');
  }, 2400);

  if (type === 'fee') {
    setMayBubbleText(`Yay! Bơ đã ghi sổ thu phí cho ${name || 'học viên'} rồi nha! 🐾🎉`);
  } else if (type === 'add-student') {
    setMayBubbleText(`Gâu! Bơ chào mừng ${name || 'học viên mới'} đến Sun Yoga! 🤎✨`);
  }
  emitMayHearts();
};

// Mascot Settings Handlers
function handleTreatMay() {
  mayState.roam = true;
  const roamToggle = document.getElementById('toggle-mascot-roam');
  if (roamToggle) roamToggle.checked = true;

  setMayPose('jump');
  clearTimeout(mayState.jumpTimeout);
  mayState.jumpTimeout = setTimeout(() => {
    setMayPose('walk');
  }, 2000);

  setMayBubbleText('Ngon quá! Cảm ơn bạn đã thưởng bánh cho Bơ nha 🦴✨');
  emitMayHearts();
  showToast('🦴 Đã thưởng bánh cho Bơ!');
}

function handleToggleMayRoam(checked) {
  mayState.roam = Boolean(checked);
  if (!mayState.roam) {
    setMayPose('sit');
    showToast('Bơ đang ngồi ngoan nghỉ ngơi 🧘‍♀️');
  } else {
    setMayPose('walk');
    showToast('Bơ đã tiếp tục đi dạo quanh phòng tập 🐾');
  }
}

function handleToggleMayBubble(checked) {
  mayState.bubble = Boolean(checked);
  const bubble = document.getElementById('may-speech-bubble');
  if (bubble) {
    bubble.classList.toggle('is-hidden', !mayState.bubble);
  }
  showToast(mayState.bubble ? 'Đã bật lời thoại của Bơ' : 'Đã ẩn lời thoại của Bơ');
}

function handleSelectMayBib(bibType) {
  mayState.bib = bibType;
  const bibOutline = document.getElementById('may-bib-outline');
  if (bibOutline) {
    if (bibType === 'bear-bib') {
      bibOutline.setAttribute('stroke', '#A5C4D4');
    } else if (bibType === 'terracotta') {
      bibOutline.setAttribute('stroke', '#D4846A');
    } else if (bibType === 'sage') {
      bibOutline.setAttribute('stroke', '#8FA893');
    }
  }

  // Update active pill button
  document.querySelectorAll('#mascot-bib-picker .bib-pill-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-bib') === bibType);
  });

  setMayPose('jump');
  clearTimeout(mayState.jumpTimeout);
  mayState.jumpTimeout = setTimeout(() => {
    setMayPose(mayState.roam ? 'walk' : 'sit');
  }, 1400);

  setMayBubbleText('Yếm mới của Bơ xinh quá nè! Cảm ơn bạn 🧸✨');
  emitMayHearts();
}

window.petMayMascot = petMayMascot;
window.handleTreatMay = handleTreatMay;
window.handleToggleMayRoam = handleToggleMayRoam;
window.handleToggleMayBubble = handleToggleMayBubble;
window.handleSelectMayBib = handleSelectMayBib;

// Switch Active Tab (Sidebar + Mobile Tabs)
function switchTab(tabId) {
  state.activeTab = tabId;

  // Sync Desktop Sidebar
  document.querySelectorAll('.sidebar-link').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  // Sync Mobile Tabs & Lucian UX/UI #208 App Dock
  document.querySelectorAll('.tab-button').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.u208-a[data-tab]').forEach((btn) => {
    btn.classList.toggle('is-run', btn.getAttribute('data-tab') === tabId);
  });

  // Sync Content Panes
  document.querySelectorAll('.tab-pane').forEach((pane) => {
    pane.classList.toggle('active', pane.id === tabId);
  });

  // Change Titles
  const tabTitles = {
    'tab-students': 'Học viên',
    'tab-calendar': 'Lịch tập & Âm lịch',
    'tab-revenue': 'Thu phí & Doanh thu',
    'tab-settings': 'Cài đặt hệ thống'
  };
  const titleText = tabTitles[tabId] || 'Học viên';

  const desktopTitle = document.getElementById('navbar-page-title');
  if (desktopTitle) desktopTitle.textContent = titleText;

  const mobileTitle = document.getElementById('mobile-page-title');
  if (mobileTitle) mobileTitle.textContent = titleText;

  // Show/Hide Add button on desktop/mobile
  const btnDesktopAdd = document.getElementById('btn-desktop-add');
  if (btnDesktopAdd) {
    btnDesktopAdd.style.display = tabId === 'tab-students' ? 'inline-flex' : 'none';
  }
  const btnMobileAdd = document.getElementById('btn-mobile-add');
  if (btnMobileAdd) {
    btnMobileAdd.style.display = tabId === 'tab-students' ? 'inline-flex' : 'none';
  }
  const mobileSearchSortRow = document.getElementById('mobile-search-sort-row');
  if (mobileSearchSortRow) {
    mobileSearchSortRow.style.display = tabId === 'tab-students' ? 'flex' : 'none';
  }
  const mobileTopBar = document.querySelector('.mobile-top-bar');
  if (mobileTopBar) {
    mobileTopBar.classList.toggle('hide-search', tabId !== 'tab-students');
  }

  if (tabId === 'tab-students') {
    filterAndRenderStudents();
  }
  if (tabId === 'tab-calendar') renderCalendar();
  if (tabId === 'tab-revenue') renderRevenue();
  if (tabId === 'tab-settings') {
    applyWallpaper();
    renderSettingsClasses();
    renderSettingsPackages();
  }
  try {
    history.replaceState(null, '', '#' + tabId);
  } catch (e) {}
}

// Calculate Student Expiration Status
function getStudentStatus(expiryDateStr) {
  if (!expiryDateStr) return { status: 'active', label: 'Hoạt động', days: 0 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'danger', label: `Quá hạn ${Math.abs(diffDays)} ngày`, days: diffDays };
  } else if (diffDays <= 7) {
    return { status: 'warning', label: `Còn ${diffDays} ngày`, days: diffDays };
  } else {
    return { status: 'active', label: `Còn ${diffDays} ngày`, days: diffDays };
  }
}

function getInitials(name) {
  if (!name) return 'HV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Number Counter Animation Helper (UI-UX-Pro-Max Delight Pattern)
function animateValue(element, targetValue, duration = 300) {
  if (!element) return;
  const startValue = parseInt(element.textContent, 10) || 0;
  if (startValue === targetValue) return;

  const steps = 10;
  const stepTime = Math.max(20, Math.floor(duration / steps));
  let step = 0;

  const timer = setInterval(() => {
    step++;
    const progress = Math.min(step / steps, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startValue + (targetValue - startValue) * easeProgress);
    element.textContent = current;

    if (step >= steps) {
      clearInterval(timer);
      element.textContent = targetValue;
    }
  }, stepTime);
}

// Filter and Render Student List
function filterAndRenderStudents() {
  const query = state.searchQuery;
  const filter = state.activeFilter;

  // Calculate 3 KPI Metrics from real data (no double-counting)
  const total = state.students.length;
  let activeCount = 0;
  let expiringCount = 0;
  let overdueCount = 0;

  state.students.forEach((s) => {
    const st = getStudentStatus(s.expiryDate);
    if (st.status === 'danger') {
      overdueCount++;
    } else if (st.status === 'warning') {
      expiringCount++;
    } else {
      activeCount++;
    }
  });

  // Update 3 KPI Card Numbers with Smooth Counter
  const totalEl = document.getElementById('metric-total-students');
  if (totalEl) animateValue(totalEl, total);
  const expiringEl = document.getElementById('metric-expiring-students');
  if (expiringEl) animateValue(expiringEl, expiringCount);
  const overdueEl = document.getElementById('metric-overdue-students');
  if (overdueEl) animateValue(overdueEl, overdueCount);

  // Update Sidebar Badge
  const sidebarBadge = document.getElementById('sidebar-badge-students');
  if (sidebarBadge) animateValue(sidebarBadge, total);

  // Update 4 Filter Pill Counts
  const countAll = document.getElementById('count-all');
  if (countAll) countAll.textContent = total;
  const countActive = document.getElementById('count-active');
  if (countActive) countActive.textContent = activeCount;
  const countExpiring = document.getElementById('count-expiring');
  if (countExpiring) countExpiring.textContent = expiringCount;
  const countOverdue = document.getElementById('count-overdue');
  if (countOverdue) countOverdue.textContent = overdueCount;

  // Filter students based on search query and active tab filter
  state.filteredStudents = state.students.filter((s) => {
    // Search match
    const matchSearch =
      !query ||
      s.name.toLowerCase().includes(query) ||
      (s.phone && s.phone.includes(query)) ||
      (s.className && s.className.toLowerCase().includes(query)) ||
      (s.notes && s.notes.toLowerCase().includes(query));

    if (!matchSearch) return false;

    // Filter category match
    const info = getStudentStatus(s.expiryDate);
    if (filter === 'active') return info.status === 'active';
    if (filter === 'expiring') return info.status === 'warning';
    if (filter === 'overdue') return info.status === 'danger';
    return true;
  });

  // Sort students according to selected sort order
  state.filteredStudents.sort((a, b) => {
    if (state.sortOrder === 'expiry-asc') {
      return new Date(a.expiryDate || '9999-12-31') - new Date(b.expiryDate || '9999-12-31');
    }
    if (state.sortOrder === 'expiry-desc') {
      return new Date(b.expiryDate || '1970-01-01') - new Date(a.expiryDate || '1970-01-01');
    }
    if (state.sortOrder === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '', 'vi');
    }
    if (state.sortOrder === 'newest') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    return 0;
  });

  // Update visible count in list header
  const listCountEl = document.getElementById('student-visible-count');
  if (listCountEl) {
    listCountEl.textContent = `${state.filteredStudents.length} học viên`;
  }

  // Render List
  const listEl = document.getElementById('student-list-container');
  if (!listEl) return;

  if (state.filteredStudents.length === 0) {
    listEl.innerHTML = `
      <div class="empty-list-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <circle cx="11" cy="11" r="7"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p class="empty-title">${query ? 'Không tìm thấy học viên nào phù hợp' : 'Không có học viên trong danh mục này'}</p>
        <p class="empty-sub">${query ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc' : 'Học viên thuộc nhóm này sẽ hiển thị tại đây'}</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = state.filteredStudents
    .map((s) => {
      const info = getStudentStatus(s.expiryDate);
      const initials = getInitials(s.name);
      const formattedStartDate = formatDateDisplay(s.classStartDate || s.createdAt);
      const formattedExpiryDate = formatDateDisplay(s.expiryDate);
      const feeFormatted = formatCurrency(s.feePaid || 800000);
      const packageName = s.package || 'Gói chuẩn';
      const className = s.className || 'Chưa xếp lớp';

      // Warm Pastel Progress calculation
      const isOverdue = info.status === 'danger';
      const totalDays = s.totalDays || (s.package && s.package.includes('2') ? 60 : s.package && s.package.includes('3') ? 90 : 30);
      const daysRem = info.days !== undefined ? info.days : 30;
      const progressPercent = isOverdue
        ? 100
        : Math.min(100, Math.max(15, Math.round((Math.max(0, daysRem) / totalDays) * 100)));
      const classTime = s.classTime || (className.includes('Sáng') ? '06:00 - 07:15' : className.includes('Trưa') ? '11:45 - 12:45' : className.includes('Tối') ? '19:00 - 20:15' : '17:30 - 18:45');

      return `
        <div class="wellness-student-row mobile-student-item ${info.status}" data-id="${s.id}" onclick="openStudentSheet('${s.id}')">
          
          <!-- ============================================== -->
          <!-- DESKTOP VIEW: ELEGANT DIRECTORY ROW (>= 768px) -->
          <!-- ============================================== -->
          <div class="dir-col dir-col-info student-col student-col-info">
            <div class="student-avatar-wrap student-item-avatar ${info.status}">
              <span class="avatar-initials avatar-text">${escapeHtml(initials)}</span>
              <span class="status-dot-indicator status-indicator-dot ${info.status}"></span>
            </div>
            <div class="student-meta-block student-info-meta">
              <span class="student-full-name student-item-name" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</span>
              <span class="student-joined-date desktop-only-sub">Tham gia: ${formattedStartDate}</span>
            </div>
          </div>

          <!-- Col 2: Phone -->
          <div class="dir-col dir-col-phone student-col student-col-phone desktop-only-col">
            ${
              s.phone
                ? `<a href="tel:${s.phone}" class="student-phone-pill student-phone-link" onclick="event.stopPropagation()" title="Gọi điện cho ${escapeHtml(s.name)}">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>${escapeHtml(s.phone)}</span>
                  </a>`
                : '<span class="student-empty-pill student-empty-col">—</span>'
            }
          </div>

          <!-- Col 3: Class & Shift -->
          <div class="dir-col dir-col-class student-col student-col-class desktop-only-col">
            <span class="wellness-class-tag student-class-pill" title="${escapeHtml(className)}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${escapeHtml(className)}</span>
            </span>
          </div>

          <!-- Col 4: Package & Fee -->
          <div class="dir-col dir-col-package student-col student-col-package desktop-only-col">
            <span class="pkg-name-text student-pkg-title">${escapeHtml(packageName)}</span>
            <span class="pkg-fee-text student-fee-title">${feeFormatted}</span>
          </div>

          <!-- Col 5: Expiry Date -->
          <div class="dir-col dir-col-expiry student-col student-col-expiry desktop-only-col">
            <span class="expiry-date-tag student-expiry-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>${formattedExpiryDate}</span>
            </span>
          </div>

          <!-- Col 6: Status -->
          <div class="dir-col dir-col-status student-col student-col-status desktop-only-col">
            <span class="wellness-status-badge student-status-badge ${info.status}">
              <span class="badge-pulse-dot badge-dot ${info.status}"></span>
              <span>${escapeHtml(info.label)}</span>
            </span>
          </div>

          <!-- Col 7: Actions (Desktop) -->
          <div class="dir-col dir-col-actions student-col student-col-actions desktop-only-actions" onclick="event.stopPropagation()">
            <button type="button" class="btn-wellness-collect btn-quick-collect" onclick="collectFeeDirect('${s.id}')" title="Thu học phí">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
              <span>Thu phí</span>
            </button>
            <button type="button" class="btn-action-icon btn-edit-icon desktop-only-action" onclick="openStudentSheet('${s.id}')" title="Chỉnh sửa hồ sơ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button type="button" class="btn-action-icon btn-delete-icon desktop-only-action" onclick="deleteStudentDirect('${s.id}')" title="Xóa học viên">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>

          <!-- ============================================== -->
          <!-- MOBILE VIEW: PURPOSE-BUILT CARD (< 768px)      -->
          <!-- ============================================== -->
          <div class="mobile-card-content">
            <!-- Mobile Row 1: Header (Avatar + Name & Class + Status Badge) -->
            <div class="mobile-card-header">
              <div class="mobile-card-identity">
                <div class="student-avatar-wrap ${info.status}">
                  <span class="avatar-initials">${escapeHtml(initials)}</span>
                  <span class="status-dot-indicator ${info.status}"></span>
                </div>
                <div class="mobile-identity-meta">
                  <span class="mobile-student-name" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</span>
                  <span class="mobile-class-hint">${escapeHtml(className)} (${escapeHtml(classTime)})</span>
                </div>
              </div>
              <span class="wellness-status-badge ${info.status}">
                <span class="badge-pulse-dot ${info.status}"></span>
                <span>${escapeHtml(info.label)}</span>
              </span>
            </div>

            <!-- Mobile Row 2: Metadata Details Box with Warm Progress Bar -->
            <div class="mobile-card-details">
              <div class="mobile-details-row">
                <div class="mobile-detail-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                  <span>${escapeHtml(packageName)}</span>
                  <span class="detail-sep">•</span>
                  <span class="detail-fee-amount">${feeFormatted}</span>
                </div>
                <div class="mobile-detail-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Hạn: ${formattedExpiryDate}</span>
                </div>
              </div>
            </div>

            <!-- Mobile Row 3: Action Toolbar (Phone + Thu phí) -->
            <div class="mobile-card-actions" onclick="event.stopPropagation()">
              ${
                s.phone
                  ? `<a href="tel:${s.phone}" class="btn-mobile-call" onclick="event.stopPropagation()" title="Gọi điện">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <span>${escapeHtml(s.phone)}</span>
                    </a>`
                  : `<span class="btn-mobile-call-disabled">Không có SĐT</span>`
              }
              <button type="button" class="btn-mobile-collect btn-quick-collect" onclick="collectFeeDirect('${s.id}')" title="Thu học phí">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                <span>Thu phí</span>
              </button>
            </div>
          </div>

        </div>
      `;
    })
    .join('');
}

// Direct Action: Collect Fee
function collectFeeDirect(studentId) {
  const student = state.students.find((s) => s.id === studentId);
  if (!student) return;

  const pkg = state.settings.packages.find((p) => p.name === student.package);
  const durationMonths = pkg ? (pkg.durationMonths || 1) : 1;
  const currentFee = pkg ? (pkg.fee || student.feePaid || 800000) : (student.feePaid || 800000);

  // Calculate new expiry date based on package duration
  let baseDate = new Date();
  if (student.expiryDate) {
    const expDate = new Date(student.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expDate.setHours(0, 0, 0, 0);
    if (expDate >= today) {
      baseDate = expDate;
    }
  }
  const targetDate = new Date(baseDate);
  targetDate.setMonth(targetDate.getMonth() + durationMonths);
  const newDate = formatDateToISO(targetDate);

  if (confirm(`Xác nhận thu học phí cho học viên ${student.name}?\n• Gói tập: ${student.package || 'Gói chuẩn'}\n• Số tiền: ${formatCurrency(currentFee)}\n• Hạn mới: ${formatDateDisplay(newDate)}`)) {
    student.expiryDate = newDate;
    if (!student.classStartDate) {
      student.classStartDate = getTodayDateString();
    }
    student.feePaid = currentFee;

    // Record new payment transaction
    const paymentRecord = {
      id: 'pay_' + Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      amount: currentFee,
      package: student.package || 'Gói chuẩn',
      date: getTodayDateString(),
      notes: `Thu học phí - Hạn mới: ${formatDateDisplay(newDate)}`,
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(state.payments)) {
      state.payments = [];
    }
    state.payments.unshift(paymentRecord);
    saveLocalPayments();

    if (!Array.isArray(student.paymentHistory)) {
      student.paymentHistory = [];
    }
    student.paymentHistory.push(paymentRecord);

    saveLocalStudents();
    filterAndRenderStudents();
    renderRevenue();
    
    // Trigger Zen water ripple celebration
    if (typeof window.triggerZenRipple === 'function') {
      window.triggerZenRipple(window.innerWidth * 0.5, window.innerHeight * 0.35);
    }

    // May Mascot Cheers
    if (typeof window.mayCheer === 'function') {
      window.mayCheer('fee', student.name);
    }

    showToast(`✓ Đã thu ${formatCurrency(currentFee)} cho ${student.name}! Hạn mới: ${formatDateDisplay(newDate)}`);

    if (state.settings.googleSheetUrl) {
      sendToGoogleSheet('saveStudent', { student });
    }
  }
}

// Direct Action: Delete Student
function deleteStudentDirect(studentId) {
  const student = state.students.find((s) => s.id === studentId);
  if (!student) return;

  if (confirm(`Bạn có chắc chắn muốn xóa học viên ${student.name}? Hành động này không thể hoàn tác.`)) {
    const deletedName = student.name;
    state.students = state.students.filter((s) => s.id !== studentId);
    saveLocalStudents();
    filterAndRenderStudents();
    renderRevenue();
    showToast(`Đã xóa học viên: ${deletedName}`);

    if (state.settings.googleSheetUrl) {
      sendToGoogleSheet('deleteStudent', { id: studentId });
    }
  }
}

// Modal / Bottom Sheet Handling
function openStudentSheet(studentId) {
  state.selectedStudent = studentId ? state.students.find((s) => s.id === studentId) : null;
  const isEdit = Boolean(state.selectedStudent);

  document.getElementById('sheet-title').textContent = isEdit ? 'Cập nhật học viên' : 'Thêm học viên mới';
  document.getElementById('input-student-id').value = isEdit ? state.selectedStudent.id : '';
  document.getElementById('input-student-name').value = isEdit ? state.selectedStudent.name : '';
  document.getElementById('input-student-phone').value = isEdit ? state.selectedStudent.phone || '' : '';
  document.getElementById('input-student-start-date').value = isEdit && state.selectedStudent.classStartDate ? state.selectedStudent.classStartDate : getTodayDateString();
  document.getElementById('input-student-expiry-date').value = isEdit && state.selectedStudent.expiryDate ? state.selectedStudent.expiryDate : getRelativeDateString(30);
  document.getElementById('input-student-fee').value = isEdit && state.selectedStudent.feePaid ? state.selectedStudent.feePaid : 800000;
  document.getElementById('input-student-notes').value = isEdit ? state.selectedStudent.notes || '' : '';

  // Render Class select options
  const classSelect = document.getElementById('input-student-class');
  classSelect.innerHTML = state.settings.classes
    .map((c) => `<option value="${escapeHtml(c.name)}" ${isEdit && state.selectedStudent.className === c.name ? 'selected' : ''}>${escapeHtml(c.name)}</option>`)
    .join('');

  // Render Package select options
  const pkgSelect = document.getElementById('input-student-package');
  pkgSelect.innerHTML = state.settings.packages
    .map((p) => `<option value="${escapeHtml(p.name)}" ${isEdit && state.selectedStudent.package === p.name ? 'selected' : ''}>${escapeHtml(p.name)} (${formatCurrency(p.fee)})</option>`)
    .join('');

  // Show/Hide Delete Button
  const btnDelete = document.getElementById('btn-delete-student');
  btnDelete.style.display = isEdit ? 'block' : 'none';

  // Open Sheet
  document.getElementById('sheet-overlay').classList.add('open');
}

function closeStudentSheet() {
  document.getElementById('sheet-overlay').classList.remove('open');
  state.selectedStudent = null;
}

function handleStudentFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('input-student-id').value || Date.now().toString();
  const name = document.getElementById('input-student-name').value.trim();
  const phone = document.getElementById('input-student-phone').value.trim();
  const className = document.getElementById('input-student-class').value;
  const pkg = document.getElementById('input-student-package').value;
  const classStartDate = document.getElementById('input-student-start-date').value;
  const expiryDate = document.getElementById('input-student-expiry-date').value;
  const feePaid = Number(document.getElementById('input-student-fee').value) || 0;
  const notes = document.getElementById('input-student-notes').value.trim();

  if (!name) {
    alert('Vui lòng nhập họ và tên học viên');
    return;
  }

  const existingIdx = state.students.findIndex((s) => s.id === id);
  const studentData = {
    id,
    name,
    phone,
    className,
    package: pkg,
    classStartDate,
    expiryDate,
    feePaid,
    notes,
    createdAt: existingIdx >= 0 ? state.students[existingIdx].createdAt : new Date().toISOString()
  };

  if (existingIdx >= 0) {
    state.students[existingIdx] = studentData;
  } else {
    state.students.unshift(studentData);
    if (feePaid > 0) {
      if (!Array.isArray(state.payments)) state.payments = [];
      state.payments.unshift({
        id: 'pay_' + id + '_' + Date.now().toString(),
        studentId: id,
        studentName: name,
        amount: feePaid,
        package: pkg || 'Gói chuẩn',
        date: classStartDate || getTodayDateString(),
        notes: 'Đăng ký học viên mới',
        createdAt: new Date().toISOString()
      });
      saveLocalPayments();
    }
  }

  saveLocalStudents();
  filterAndRenderStudents();
  renderRevenue();
  closeStudentSheet();

  if (existingIdx < 0 && typeof window.mayCheer === 'function') {
    window.mayCheer('add-student', name);
  }

  // Push to Google Sheets in background
  if (state.settings.googleSheetUrl) {
    sendToGoogleSheet('saveStudent', { student: studentData });
  }
}

function handleDeleteStudent() {
  if (!state.selectedStudent) return;
  if (!confirm(`Bạn có chắc chắn muốn xóa học viên ${state.selectedStudent.name}?`)) return;

  const id = state.selectedStudent.id;
  state.students = state.students.filter((s) => s.id !== id);
  saveLocalStudents();
  filterAndRenderStudents();
  renderRevenue();
  closeStudentSheet();

  // Delete from Google Sheet
  if (state.settings.googleSheetUrl) {
    sendToGoogleSheet('deleteStudent', { id });
  }
}

// Google Sheets Sync
async function syncWithGoogleSheet() {
  const url = state.settings.googleSheetUrl;
  const statusEl = document.getElementById('sync-status-text');
  const dotEl = document.getElementById('sync-dot');

  if (!url) {
    if (statusEl) statusEl.textContent = 'Chưa cấu hình Google Sheet';
    if (dotEl) dotEl.className = 'sync-dot offline';
    return;
  }

  if (statusEl) statusEl.textContent = 'Đang đồng bộ...';
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.success && Array.isArray(json.students)) {
      state.students = json.students;
      saveLocalStudents();
      filterAndRenderStudents();
      renderRevenue();
      if (statusEl) statusEl.textContent = `Đã đồng bộ (${new Date().toLocaleTimeString('vi-VN')})`;
      if (dotEl) dotEl.className = 'sync-dot';
    } else {
      throw new Error(json.error || 'Dữ liệu không đúng định dạng');
    }
  } catch (err) {
    console.error('Google Sheet Sync Error:', err);
    if (statusEl) statusEl.textContent = 'Lỗi kết nối Sheet (Dùng offline)';
    if (dotEl) dotEl.className = 'sync-dot offline';
  }
}

async function sendToGoogleSheet(action, payload) {
  const url = state.settings.googleSheetUrl;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
  } catch (err) {
    console.warn('Error sending to Google Sheet:', err);
  }
}

// Push Notification Logic
function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('Trình duyệt này không hỗ trợ Notification.');
    return;
  }
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      state.settings.notificationsEnabled = true;
      saveLocalSettings();
      alert('Đã bật quyền thông báo! Ứng dụng sẽ tự động nhắc nhở khi có học viên sắp hết hạn.');
      checkExpiringAndNotify(true);
    } else {
      alert('Bạn đã từ chối quyền thông báo.');
    }
  });
}

function checkExpiringAndNotify(force = false) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const expiring = state.students.filter((s) => {
    const st = getStudentStatus(s.expiryDate);
    return st.status === 'warning' || st.status === 'danger';
  });

  if (expiring.length > 0 && (force || shouldNotifyToday())) {
    const names = expiring.slice(0, 3).map((s) => s.name).join(', ');
    const more = expiring.length > 3 ? ` và ${expiring.length - 3} học viên khác` : '';
    new Notification('Sun Yoga — Nhắc hạn học phí', {
      body: `Có ${expiring.length} học viên cần thu học phí: ${names}${more}.`,
      icon: './manifest.json'
    });
    localStorage.setItem('sun_yoga_last_notified', new Date().toDateString());
  }
}

function shouldNotifyToday() {
  const last = localStorage.getItem('sun_yoga_last_notified');
  return last !== new Date().toDateString();
}

// Tab 2: Calendar Rendering
function renderCalendar() {
  const container = document.getElementById('calendar-grid-container');
  if (!container) return;

  const monthYearLabel = document.getElementById('calendar-month-year-label');
  if (monthYearLabel) {
    monthYearLabel.textContent = `Tháng ${state.currentMonth + 1}, ${state.currentYear}`;
  }

  const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
  // Adjust Monday as first day (0 = Monday, 6 = Sunday)
  const startCol = (firstDay + 6) % 7;
  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getMonth() === state.currentMonth && today.getFullYear() === state.currentYear;
  const todayDate = today.getDate();

  let html = `
    <div class="cal-col-header">T2</div>
    <div class="cal-col-header">T3</div>
    <div class="cal-col-header">T4</div>
    <div class="cal-col-header">T5</div>
    <div class="cal-col-header">T6</div>
    <div class="cal-col-header">T7</div>
    <div class="cal-col-header">CN</div>
  `;

  // Empty leading days
  for (let i = 0; i < startCol; i++) {
    html += `<div class="cal-day-item" style="opacity: 0.15; cursor: default;"></div>`;
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isCurrentMonth && day === todayDate;
    const lunarDay = ((day + 13) % 30) + 1; // Approximate lunar calculation
    html += `
      <div class="cal-day-item ${isToday ? 'today' : ''}">
        <span>${day}</span>
        <span class="cal-lunar-sub">${lunarDay} Âl</span>
      </div>
    `;
  }

  container.innerHTML = html;
}

function changeMonth(offset) {
  state.currentMonth += offset;
  if (state.currentMonth > 11) {
    state.currentMonth = 0;
    state.currentYear++;
  } else if (state.currentMonth < 0) {
    state.currentMonth = 11;
    state.currentYear--;
  }
  renderCalendar();
}

// Tab 3: Revenue Rendering
function renderRevenue() {
  let totalRevenue = 0;
  if (Array.isArray(state.payments) && state.payments.length > 0) {
    state.payments.forEach((p) => {
      totalRevenue += Number(p.amount) || 0;
    });
  } else {
    state.students.forEach((s) => {
      totalRevenue += Number(s.feePaid) || 0;
    });
  }

  const totalEl = document.getElementById('total-revenue-display');
  const eyeBtn = document.getElementById('btn-toggle-revenue');

  if (totalEl) {
    if (state.revenueVisible) {
      animateRevenueCounter(totalEl, totalRevenue);
      if (eyeBtn) {
        eyeBtn.innerHTML = typeof Icons !== 'undefined' ? Icons.eye(16) : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      }
    } else {
      totalEl.textContent = '•••••••• VND';
      totalEl.setAttribute('data-raw-value', totalRevenue);
      if (eyeBtn) {
        eyeBtn.innerHTML = typeof Icons !== 'undefined' ? Icons.eyeOff(16) : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path></svg>';
      }
    }
  }

  const listEl = document.getElementById('payment-history-list');
  const historyCount = document.getElementById('history-count');
  if (!listEl) return;

  const payments = Array.isArray(state.payments) ? state.payments : [];
  if (historyCount) historyCount.textContent = `${payments.length} giao dịch`;

  if (payments.length === 0) {
    listEl.innerHTML = `<div style="padding: 32px; text-align: center; color: var(--text-secondary);">Chưa có khoản thu nào.</div>`;
    return;
  }

  listEl.innerHTML = payments
    .map(
      (p) => `
      <div class="payment-transaction-row">
        <div class="pay-tx-left">
          <div class="student-avatar-badge active" style="width: 34px; height: 34px; font-size: 11px;">
            ${escapeHtml(getInitials(p.studentName))}
          </div>
          <div>
            <div class="pay-tx-name">${escapeHtml(p.studentName)}</div>
            <div class="pay-tx-sub">${escapeHtml(p.package || 'Học phí')} • Ngày thu: ${formatDateDisplay(p.date)}</div>
          </div>
        </div>
        <div class="pay-tx-right">
          <div style="text-align: right;">
            <div class="pay-tx-amount">
              +${formatCurrency(p.amount)}
            </div>
            <div class="pay-tx-status">Thành công</div>
          </div>
          <button type="button" class="btn-del-payment" onclick="deletePaymentDirect('${p.id}')" title="Xóa giao dịch này" style="background: transparent; border: none; cursor: pointer; color: var(--text-tertiary); padding: 4px; border-radius: 999px; display: flex; align-items: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `
    )
    .join('');
}

function deletePaymentDirect(paymentId) {
  if (!confirm('Bạn có chắc muốn xóa bản ghi giao dịch này khỏi lịch sử thu phí?')) return;
  state.payments = (state.payments || []).filter((p) => p.id !== paymentId);
  saveLocalPayments();
  renderRevenue();
  showToast('Đã xóa giao dịch thu phí');
}

// Rolling counter animation for luxury metrics
function animateRevenueCounter(element, targetAmount) {
  if (!element) return;
  const currentVal = Number(element.getAttribute('data-raw-value')) || 0;
  element.setAttribute('data-raw-value', targetAmount);

  if (currentVal === targetAmount) {
    element.textContent = formatCurrency(targetAmount);
    return;
  }

  const duration = 460;
  const startTime = performance.now();

  function updateFrame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const interpolated = Math.round(currentVal + (targetAmount - currentVal) * ease);

    element.textContent = formatCurrency(interpolated);

    if (progress < 1) {
      requestAnimationFrame(updateFrame);
    } else {
      element.textContent = formatCurrency(targetAmount);
    }
  }

  requestAnimationFrame(updateFrame);
}

// Tab 4: Settings Functions
function saveGoogleSheetUrl() {
  const url = document.getElementById('setting-sheet-url').value.trim();
  state.settings.googleSheetUrl = url;
  saveLocalSettings();
  alert('Đã lưu cấu hình Google Sheet URL!');
  syncWithGoogleSheet();
}

function exportDataBackup() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.students, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', dataStr);
  dlAnchor.setAttribute('download', `sun_yoga_students_${new Date().toISOString().slice(0, 10)}.json`);
  dlAnchor.click();
}

function importDataBackup(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        state.students = data;
        saveLocalStudents();
        filterAndRenderStudents();
        renderRevenue();
        alert(`Đã nhập thành công ${data.length} học viên!`);
      } else {
        alert('File không hợp lệ');
      }
    } catch (err) {
      alert('Lỗi đọc file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// Helpers
function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateToISO(d) {
  if (!d || isNaN(d.getTime())) return getTodayDateString();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString('vi-VN') + ' VND';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ====================================================================
// UI-UX-PRO-MAX THEME CONTROLLER
// ====================================================================
function selectTheme(themeId) {
  // Theme selector removed from settings; default to unified Quiet Luxury system
}

function applyTheme() {
  // Ensure unified Quiet Luxury Glass theme
  document.body.classList.remove('theme-apple-glass', 'theme-zen-warm', 'theme-midnight-pro');
  document.documentElement.removeAttribute('data-theme');
}

// Apply Wallpaper to DOM (Liquid Glass Studio Wallpaper or Clean Apple Canvas)
function applyWallpaper() {
  const wp = state.settings.wallpaper || { enabled: false, image: 'default', opacity: 50 };
  const layer = document.getElementById('app-wallpaper-layer');
  const overlay = document.getElementById('app-wallpaper-overlay');
  const toggle = document.getElementById('toggle-wallpaper-switch');
  const controls = document.getElementById('wallpaper-controls-body');
  const slider = document.getElementById('wallpaper-opacity-range');
  const opacityText = document.getElementById('wallpaper-opacity-text');
  const thumbPreview = document.getElementById('wallpaper-thumb-preview');
  const badgeType = document.getElementById('wallpaper-type-badge');

  const currentOpacity = (wp.opacity !== undefined && wp.opacity !== null) ? Number(wp.opacity) : 50;

  if (toggle) toggle.checked = !!wp.enabled;
  if (controls) controls.style.display = wp.enabled ? 'block' : 'none';
  if (slider) slider.value = currentOpacity;
  if (opacityText) opacityText.textContent = currentOpacity + '%';

  const imgSrc = (wp.image && wp.image !== 'default') ? wp.image : './background.jpg';
  if (thumbPreview) thumbPreview.src = imgSrc;
  if (badgeType) badgeType.textContent = (wp.image && wp.image !== 'default') ? 'Tự tải lên' : 'Mặc định Studio';

  if (wp.enabled) {
    document.documentElement.classList.add('has-custom-bg');
    document.body.classList.add('has-custom-bg');
    if (layer) {
      layer.style.backgroundImage = `url("${imgSrc}")`;
      layer.style.opacity = '1';
    }
    if (overlay) {
      overlay.style.backgroundColor = `rgba(247, 246, 242, ${currentOpacity / 100})`;
      overlay.style.opacity = '1';
    }
  } else {
    document.documentElement.classList.remove('has-custom-bg');
    document.body.classList.remove('has-custom-bg');
    if (layer) {
      layer.style.backgroundImage = 'none';
      layer.style.opacity = '0';
    }
    if (overlay) {
      overlay.style.opacity = '0';
    }
  }
}

function handleWallpaperOpacitySlider(val) {
  if (!state.settings.wallpaper) {
    state.settings.wallpaper = { enabled: true, image: 'default', opacity: 50 };
  }
  state.settings.wallpaper.opacity = parseInt(val, 10);
  const opacityText = document.getElementById('wallpaper-opacity-text');
  if (opacityText) opacityText.textContent = val + '%';
  const overlay = document.getElementById('app-wallpaper-overlay');
  if (overlay) {
    overlay.style.backgroundColor = `rgba(247, 246, 242, ${val / 100})`;
  }
  saveLocalSettings();
}

function handleWallpaperUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('Vui lòng chọn hình ảnh có dung lượng dưới 5MB để đảm bảo hiệu năng tải trang mượt mà.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    if (!state.settings.wallpaper) {
      state.settings.wallpaper = { enabled: true, image: 'default', opacity: 50 };
    }
    state.settings.wallpaper.image = e.target.result;
    state.settings.wallpaper.enabled = true;
    saveLocalSettings();
    applyWallpaper();
    showToast('Đã tải và áp dụng hình nền mới');
  };
  reader.readAsDataURL(file);
}

function resetToDefaultWallpaper() {
  if (!state.settings.wallpaper) {
    state.settings.wallpaper = { enabled: true, image: 'default', opacity: 50 };
  }
  state.settings.wallpaper.image = 'default';
  saveLocalSettings();
  applyWallpaper();
  showToast('Đã đặt lại hình nền Studio mặc định');
}

// ====================================================================
// SETTINGS: CLASSES MANAGEMENT
// ====================================================================
function renderSettingsClasses() {
  const container = document.getElementById('settings-classes-list');
  if (!container) return;

  if (!state.settings.classes || state.settings.classes.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); font-size: 13px; padding: 12px;">Chưa có ca học nào được cấu hình.</div>`;
    return;
  }

  container.innerHTML = state.settings.classes.map((cls, idx) => `
    <div class="config-item-row">
      <div class="config-item-info">
        <span class="config-item-badge">Ca học</span>
        <span class="config-item-name">${escapeHtml(cls.name)}</span>
      </div>
      <div class="config-item-actions">
        <button type="button" class="btn-config-action" onclick="editClass(${idx})" title="Chỉnh sửa ca học">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <span>Sửa</span>
        </button>
        <button type="button" class="btn-config-action danger" onclick="deleteClass(${idx})" title="Xóa ca học">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>Xóa</span>
        </button>
      </div>
    </div>
  `).join('');
}

function showAddClassForm() {
  const form = document.getElementById('form-class-editor');
  const indexInput = document.getElementById('input-edit-class-index');
  const nameInput = document.getElementById('input-class-name');
  if (!form || !nameInput) return;

  indexInput.value = '-1';
  nameInput.value = '';
  form.style.display = 'block';
  nameInput.focus();
}

function hideClassForm() {
  const form = document.getElementById('form-class-editor');
  if (form) form.style.display = 'none';
}

function editClass(idx) {
  const form = document.getElementById('form-class-editor');
  const indexInput = document.getElementById('input-edit-class-index');
  const nameInput = document.getElementById('input-class-name');
  if (!form || !nameInput || !state.settings.classes[idx]) return;

  indexInput.value = idx;
  nameInput.value = state.settings.classes[idx].name;
  form.style.display = 'block';
  nameInput.focus();
}

function saveClassConfig() {
  const indexInput = document.getElementById('input-edit-class-index');
  const nameInput = document.getElementById('input-class-name');
  if (!indexInput || !nameInput) return;

  const name = nameInput.value.trim();
  if (!name) {
    showToast('Vui lòng nhập tên ca học và khung giờ');
    return;
  }

  const idx = Number(indexInput.value);
  if (!state.settings.classes) state.settings.classes = [];

  if (idx >= 0 && idx < state.settings.classes.length) {
    state.settings.classes[idx].name = name;
    showToast('Đã cập nhật ca học');
  } else {
    state.settings.classes.push({ name });
    showToast('Đã thêm ca học mới');
  }

  saveLocalSettings();
  renderSettingsClasses();
  hideClassForm();
}

function deleteClass(idx) {
  if (!state.settings.classes || !state.settings.classes[idx]) return;
  const clsName = state.settings.classes[idx].name;
  if (!confirm(`Bạn có chắc chắn muốn xóa "${clsName}" khỏi danh sách lớp học?`)) {
    return;
  }

  state.settings.classes.splice(idx, 1);
  saveLocalSettings();
  renderSettingsClasses();
  showToast('Đã xóa ca học thành công');
}

// ====================================================================
// SETTINGS: PACKAGES MANAGEMENT
// ====================================================================
function renderSettingsPackages() {
  const container = document.getElementById('settings-packages-list');
  if (!container) return;

  if (!state.settings.packages || state.settings.packages.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); font-size: 13px; padding: 12px;">Chưa có gói tập nào được cấu hình.</div>`;
    return;
  }

  container.innerHTML = state.settings.packages.map((pkg, idx) => `
    <div class="config-item-row">
      <div class="config-item-info">
        <span class="config-item-badge badge-green">Gói tập</span>
        <span class="config-item-name">${escapeHtml(pkg.name)}</span>
        <span class="config-item-sub">${pkg.durationMonths} tháng • ${formatCurrency(pkg.fee)}</span>
      </div>
      <div class="config-item-actions">
        <button type="button" class="btn-config-action" onclick="editPackage(${idx})" title="Chỉnh sửa gói tập">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <span>Sửa</span>
        </button>
        <button type="button" class="btn-config-action danger" onclick="deletePackage(${idx})" title="Xóa gói tập">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>Xóa</span>
        </button>
      </div>
    </div>
  `).join('');
}

function showAddPackageForm() {
  const form = document.getElementById('form-package-editor');
  const indexInput = document.getElementById('input-edit-package-index');
  const nameInput = document.getElementById('input-pkg-name');
  const durationInput = document.getElementById('input-pkg-duration');
  const feeInput = document.getElementById('input-pkg-fee');
  if (!form || !nameInput) return;

  indexInput.value = '-1';
  nameInput.value = '';
  if (durationInput) durationInput.value = '1';
  if (feeInput) feeInput.value = '800000';
  form.style.display = 'block';
  nameInput.focus();
}

function hidePackageForm() {
  const form = document.getElementById('form-package-editor');
  if (form) form.style.display = 'none';
}

function editPackage(idx) {
  const form = document.getElementById('form-package-editor');
  const indexInput = document.getElementById('input-edit-package-index');
  const nameInput = document.getElementById('input-pkg-name');
  const durationInput = document.getElementById('input-pkg-duration');
  const feeInput = document.getElementById('input-pkg-fee');
  if (!form || !nameInput || !state.settings.packages[idx]) return;

  const pkg = state.settings.packages[idx];
  indexInput.value = idx;
  nameInput.value = pkg.name;
  if (durationInput) durationInput.value = pkg.durationMonths || 1;
  if (feeInput) feeInput.value = pkg.fee || 0;
  form.style.display = 'block';
  nameInput.focus();
}

function savePackageConfig() {
  const indexInput = document.getElementById('input-edit-package-index');
  const nameInput = document.getElementById('input-pkg-name');
  const durationInput = document.getElementById('input-pkg-duration');
  const feeInput = document.getElementById('input-pkg-fee');
  if (!indexInput || !nameInput) return;

  const name = nameInput.value.trim();
  const durationMonths = Number(durationInput ? durationInput.value : 1) || 1;
  const fee = Number(feeInput ? feeInput.value : 0) || 0;

  if (!name) {
    showToast('Vui lòng nhập tên gói tập');
    return;
  }

  const idx = Number(indexInput.value);
  if (!state.settings.packages) state.settings.packages = [];

  if (idx >= 0 && idx < state.settings.packages.length) {
    state.settings.packages[idx] = { name, durationMonths, fee };
    showToast('Đã cập nhật gói tập');
  } else {
    state.settings.packages.push({ name, durationMonths, fee });
    showToast('Đã thêm gói tập mới');
  }

  saveLocalSettings();
  renderSettingsPackages();
  hidePackageForm();
}

function deletePackage(idx) {
  if (!state.settings.packages || !state.settings.packages[idx]) return;
  const pkgName = state.settings.packages[idx].name;
  if (!confirm(`Bạn có chắc chắn muốn xóa "${pkgName}" khỏi danh sách gói tập?`)) {
    return;
  }

  state.settings.packages.splice(idx, 1);
  saveLocalSettings();
  renderSettingsPackages();
  showToast('Đã xóa gói tập thành công');
}

function renderAll() {
  applyTheme();
  filterAndRenderStudents();
  renderRevenue();
  applyWallpaper();
  renderSettingsClasses();
  renderSettingsPackages();
  const sheetInput = document.getElementById('setting-sheet-url');
  if (sheetInput && state.settings.googleSheetUrl) {
    sheetInput.value = state.settings.googleSheetUrl;
  }
}

// Apple Toast Notification
function showToast(message) {
  let toast = document.getElementById('apple-toast-container');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'apple-toast-container';
    toast.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%) translateY(-10px);z-index:99999;background:rgba(29,29,31,0.88);color:#fff;padding:10px 22px;border-radius:9999px;font-size:13px;font-weight:500;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 10px 30px rgba(0,0,0,0.2);display:flex;align-items:center;gap:8px;pointer-events:none;opacity:0;transition:all 0.28s cubic-bezier(0.16,1,0.3,1);';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-10px)';
  }, 2600);
}


