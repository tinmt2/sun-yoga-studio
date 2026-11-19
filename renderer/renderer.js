const state = {
  students: [],
  expiringStudents: [],
  overdueStudents: [],
  backgroundImage: null,
  profileAvatar: null,
  notificationsVisible: false,
  revenueVisible: false,
  studentListCollapsed: false,
  calendarNotes: {}, // Lưu ghi chú theo format "YYYY-MM-DD": "note text"
  menuVisible: false,
  notificationsDropdownVisible: false,
  paymentsDropdownVisible: false,
  dismissedNotifications: new Set(), // Lưu các thông báo đã đóng
  dismissedPayments: new Set(), // Lưu các khoản đã thu đã đóng
  studentSearchQuery: "", // Query tìm kiếm học viên
  activeFilter: "all", // "all" | "active" | "expiring" | "overdue"
  settings: {
    packages: [],
    classes: [],
  },
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  attachEvents();
  initialize();
});

function cacheElements() {
  elements.studentCount = document.getElementById("student-count");
  elements.tableBody = document.getElementById("student-table-body");
  elements.notificationPanel = document.getElementById("notification-panel");
  elements.paymentPanel = document.getElementById("payment-panel");
  elements.notificationBadge = document.getElementById("notification-count");
  elements.btnPayments = document.getElementById("btn-payments");
  elements.paymentsDropdown = document.getElementById("payments-dropdown");
  elements.paymentsDropdownContent = document.getElementById(
    "payments-dropdown-content"
  );
  elements.paymentBadge = document.getElementById("payment-badge");
  elements.paymentAlert = document.getElementById("payment-alert");
  elements.modalRoot = document.getElementById("modal-root");
  elements.btnMainMenu = document.getElementById("btn-main-menu");
  elements.mainMenu = document.getElementById("main-menu");
  elements.menuBadge = document.getElementById("menu-badge");
  elements.btnNotifications = document.getElementById("btn-notifications");
  elements.notificationsDropdown = document.getElementById(
    "notifications-dropdown"
  );
  elements.notificationsDropdownContent = document.getElementById(
    "notifications-dropdown-content"
  );
  elements.notificationBadge = document.getElementById("notification-badge");
  elements.iconCircle = document.querySelector(".icon-circle");
  elements.totalRevenue = document.getElementById("total-revenue");
  elements.btnToggleRevenue = document.getElementById("btn-toggle-revenue");
  elements.revenueEyeIcon = document.querySelector(".revenue-eye-icon");
  elements.btnToggleStudentList = document.getElementById(
    "btn-toggle-student-list"
  );
  elements.studentListContent = document.getElementById("student-list-content");
  elements.studentListSummary = document.getElementById("student-list-summary");
  elements.studentSearch = document.getElementById("student-search");
  elements.listCard = document.querySelector(".list-card");
  elements.clockTime = document.getElementById("clock-time");
  elements.clockDate = document.getElementById("clock-date");
  elements.clockLunar = document.getElementById("clock-lunar");
  elements.calendarGrid = document.getElementById("calendar-grid");
  elements.calendarMonthYear = document.getElementById("calendar-month-year");
  elements.calendarPrev = document.getElementById("calendar-prev");
  elements.calendarNext = document.getElementById("calendar-next");
  elements.btnQuickAdd = document.getElementById("btn-quick-add");
  elements.desktopFilterChips = document.getElementById("desktop-filter-chips");
  elements.summaryTotal = document.getElementById("summary-total");
  elements.summaryExpiring = document.getElementById("summary-expiring");
  elements.summaryOverdue = document.getElementById("summary-overdue");

  // Đảm bảo cả summary cards và table đều hiển thị ở desktop view
  if (elements.studentListSummary) {
    elements.studentListSummary.classList.remove("hidden");
    elements.studentListSummary.style.display = "block";
  }
  if (elements.studentListContent) {
    elements.studentListContent.style.display = "block";
  }
}

function attachEvents() {
  // Notification button click
  if (elements.btnNotifications) {
    elements.btnNotifications.addEventListener("click", (e) => {
      e.stopPropagation();
      // Đóng menu nếu đang mở
      if (state.menuVisible) {
        closeMenu();
      }
      toggleNotificationsDropdown();
    });
  }

  // Payment button click
  if (elements.btnPayments) {
    elements.btnPayments.addEventListener("click", (e) => {
      e.stopPropagation();
      // Đóng menu và notifications nếu đang mở
      if (state.menuVisible) {
        closeMenu();
      }
      if (state.notificationsDropdownVisible) {
        closeNotificationsDropdown();
      }
      togglePaymentsDropdown();
    });
  }

  // Close notifications dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (
      state.notificationsDropdownVisible &&
      elements.notificationsDropdown &&
      !elements.notificationsDropdown.contains(e.target) &&
      elements.btnNotifications &&
      !elements.btnNotifications.contains(e.target)
    ) {
      closeNotificationsDropdown();
    }

    // Close payments dropdown when clicking outside
    if (
      state.paymentsDropdownVisible &&
      elements.paymentsDropdown &&
      !elements.paymentsDropdown.contains(e.target) &&
      elements.btnPayments &&
      !elements.btnPayments.contains(e.target)
    ) {
      closePaymentsDropdown();
    }
  });

  // Menu button click
  if (elements.btnMainMenu) {
    elements.btnMainMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      // Đóng notifications và payments dropdown nếu đang mở
      if (state.notificationsDropdownVisible) {
        closeNotificationsDropdown();
      }
      if (state.paymentsDropdownVisible) {
        closePaymentsDropdown();
      }
      toggleMenu();
    });
  }

  // Menu items click
  if (elements.mainMenu) {
    elements.mainMenu.addEventListener("click", (e) => {
      const menuItem = e.target.closest(".menu-item");
      if (menuItem) {
        const action = menuItem.dataset.menuAction;
        handleMenuAction(action);
        closeMenu();
      }
    });
  }

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    // Đóng menu nếu click bên ngoài menu
    if (
      state.menuVisible &&
      elements.mainMenu &&
      !elements.mainMenu.contains(e.target) &&
      elements.btnMainMenu &&
      !elements.btnMainMenu.contains(e.target)
    ) {
      closeMenu();
    }

    // Đóng notifications dropdown nếu click vào menu button hoặc menu
    if (
      state.notificationsDropdownVisible &&
      (elements.btnMainMenu?.contains(e.target) ||
        elements.mainMenu?.contains(e.target))
    ) {
      closeNotificationsDropdown();
    }

    // Đóng menu nếu click vào notifications button hoặc notifications dropdown
    if (
      state.menuVisible &&
      (elements.btnNotifications?.contains(e.target) ||
        elements.notificationsDropdown?.contains(e.target))
    ) {
      closeMenu();
    }

    // Đóng menu và notifications nếu click vào payments button hoặc payments dropdown
    if (
      state.menuVisible &&
      (elements.btnPayments?.contains(e.target) ||
        elements.paymentsDropdown?.contains(e.target))
    ) {
      closeMenu();
    }
    if (
      state.notificationsDropdownVisible &&
      (elements.btnPayments?.contains(e.target) ||
        elements.paymentsDropdown?.contains(e.target))
    ) {
      closeNotificationsDropdown();
    }

    // Đóng payments nếu click vào menu hoặc notifications
    if (
      state.paymentsDropdownVisible &&
      (elements.btnMainMenu?.contains(e.target) ||
        elements.mainMenu?.contains(e.target) ||
        elements.btnNotifications?.contains(e.target) ||
        elements.notificationsDropdown?.contains(e.target))
    ) {
      closePaymentsDropdown();
    }
  });

  // Đóng menu và notifications dropdown khi scroll hoặc resize
  window.addEventListener(
    "scroll",
    () => {
      if (state.menuVisible) {
        closeMenu();
      }
      if (state.notificationsDropdownVisible) {
        closeNotificationsDropdown();
      }
      if (state.paymentsDropdownVisible) {
        closePaymentsDropdown();
      }
    },
    true
  );

  window.addEventListener("resize", () => {
    if (state.menuVisible) {
      // Cập nhật lại vị trí menu khi resize
      toggleMenu(); // Tắt menu trước
      setTimeout(() => {
        state.menuVisible = true; // Bật lại để tính toán lại vị trí
        toggleMenu();
      }, 10);
    }
    if (state.notificationsDropdownVisible) {
      // Cập nhật lại vị trí notifications dropdown khi resize
      toggleNotificationsDropdown(); // Tắt dropdown trước
      setTimeout(() => {
        state.notificationsDropdownVisible = true; // Bật lại để tính toán lại vị trí
        toggleNotificationsDropdown();
      }, 10);
    }
    if (state.paymentsDropdownVisible) {
      // Cập nhật lại vị trí payments dropdown khi resize
      togglePaymentsDropdown(); // Tắt dropdown trước
      setTimeout(() => {
        state.paymentsDropdownVisible = true; // Bật lại để tính toán lại vị trí
        togglePaymentsDropdown();
      }, 10);
    }
  });

  // Toggle hiển thị/ẩn tổng thu
  if (elements.btnToggleRevenue) {
    elements.btnToggleRevenue.addEventListener("click", () => {
      state.revenueVisible = !state.revenueVisible;
      updateTotalRevenue();
    });
  }

  // Toggle collapse/expand danh sách học viên
  if (elements.btnToggleStudentList) {
    elements.btnToggleStudentList.addEventListener("click", () => {
      state.studentListCollapsed = !state.studentListCollapsed;
      toggleStudentList();
    });
  }

  // Search input
  if (elements.studentSearch) {
    elements.studentSearch.addEventListener("input", (e) => {
      state.studentSearchQuery = e.target.value.trim().toLowerCase();
      renderStudents();
    });

    // Clear search khi nhấn Escape
    elements.studentSearch.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        elements.studentSearch.value = "";
        state.studentSearchQuery = "";
        renderStudents();
      }
    });
  }

  // Nút Quick Add học viên ở header
  if (elements.btnQuickAdd) {
    elements.btnQuickAdd.addEventListener("click", () => {
      openStudentForm(null);
    });
  }

  // Bộ lọc Desktop Segmented Filter Pills
  if (elements.desktopFilterChips) {
    elements.desktopFilterChips.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      const filter = btn.dataset.filter;
      if (!filter) return;

      elements.desktopFilterChips
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      state.activeFilter = filter;
      renderStudents();
    });
  }
}

async function initialize() {
  await loadBackgroundImage();
  await loadProfileAvatar();
  await loadSettings();
  loadCalendarNotes();
  await refreshStudents();
  await refreshExpiringStudents();
  updateTotalRevenue();
  updateMenuBadge();
  updateNotificationBadge();
  renderStudentListSummary();

  // Khởi tạo đồng hồ và lịch
  initClock();
  initCalendar();

  setInterval(refreshExpiringStudents, 60000);
}

function loadCalendarNotes() {
  try {
    const saved = localStorage.getItem("calendarNotes");
    if (saved) {
      state.calendarNotes = JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error loading calendar notes:", error);
    state.calendarNotes = {};
  }
}

function saveCalendarNotes() {
  try {
    localStorage.setItem("calendarNotes", JSON.stringify(state.calendarNotes));
  } catch (error) {
    console.error("Error saving calendar notes:", error);
  }
}

function toggleMenu() {
  state.menuVisible = !state.menuVisible;
  console.log("Toggle menu:", state.menuVisible);

  if (elements.mainMenu && elements.btnMainMenu) {
    const menu = elements.mainMenu;

    if (state.menuVisible) {
      // Xóa class hidden trước
      menu.classList.remove("hidden");

      // Đặt display để menu có thể tính toán kích thước
      menu.style.display = "block";
      menu.style.visibility = "hidden";
      menu.style.opacity = "0";

      // Tính toán vị trí của button
      const buttonRect = elements.btnMainMenu.getBoundingClientRect();

      // Dùng requestAnimationFrame để đảm bảo browser đã render
      requestAnimationFrame(() => {
        // Tính toán kích thước và vị trí
        const menuWidth = menu.offsetWidth || 260;
        const menuHeight = menu.offsetHeight || 200;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const spacing = 10;

        // Vị trí mặc định: dưới button, căn phải
        let top = buttonRect.bottom + spacing;
        let left = buttonRect.right - menuWidth;

        // Điều chỉnh nếu menu bị tràn màn hình bên phải
        if (left + menuWidth > viewportWidth - 10) {
          left = Math.max(10, viewportWidth - menuWidth - 10);
        }

        // Điều chỉnh nếu menu bị tràn màn hình bên trái
        if (left < 10) {
          left = 10;
        }

        // Điều chỉnh nếu menu bị tràn xuống dưới
        if (top + menuHeight > viewportHeight - 10) {
          // Hiển thị menu phía trên button
          top = buttonRect.top - menuHeight - spacing;
          if (top < 10) {
            top = 10;
            menu.style.maxHeight = `${viewportHeight - top - 20}px`;
          } else {
            menu.style.maxHeight = "";
          }
        } else {
          menu.style.maxHeight = "";
        }

        // Áp dụng vị trí với !important
        menu.style.setProperty("position", "fixed", "important");
        menu.style.setProperty("top", `${top}px`, "important");
        menu.style.setProperty("left", `${left}px`, "important");
        menu.style.setProperty("right", "auto", "important");
        menu.style.setProperty("bottom", "auto", "important");
        menu.style.setProperty("z-index", "9999999", "important");

        // Hiển thị menu
        menu.style.visibility = "visible";
        requestAnimationFrame(() => {
          menu.style.opacity = "1";
        });
      });
    } else {
      // Ẩn menu
      menu.style.opacity = "0";
      setTimeout(() => {
        menu.classList.add("hidden");
        menu.style.visibility = "";
        menu.style.position = "";
        menu.style.top = "";
        menu.style.left = "";
        menu.style.maxHeight = "";
      }, 200);
    }
  }

  // Cập nhật arrow
  if (elements.btnMainMenu) {
    const arrow = elements.btnMainMenu.querySelector(".menu-arrow");
    if (arrow) {
      arrow.textContent = state.menuVisible ? "▴" : "▾";
      arrow.style.transform = state.menuVisible
        ? "rotate(180deg)"
        : "rotate(0deg)";
    }
  }
}

function closeMenu() {
  state.menuVisible = false;
  if (elements.mainMenu) {
    elements.mainMenu.classList.add("hidden");
  }
  if (elements.btnMainMenu) {
    const arrow = elements.btnMainMenu.querySelector(".menu-arrow");
    if (arrow) {
      arrow.textContent = "▾";
      arrow.style.transform = "rotate(0deg)";
    }
  }
}

function toggleNotificationsDropdown() {
  state.notificationsDropdownVisible = !state.notificationsDropdownVisible;
  console.log(
    "Toggle notifications dropdown:",
    state.notificationsDropdownVisible
  );

  if (elements.notificationsDropdown && elements.btnNotifications) {
    const dropdown = elements.notificationsDropdown;

    if (state.notificationsDropdownVisible) {
      // Render notifications vào dropdown
      renderNotificationsToDropdown();

      // Xóa class hidden
      dropdown.classList.remove("hidden");
      dropdown.style.display = "block";
      dropdown.style.visibility = "hidden";
      dropdown.style.opacity = "0";

      // Tính toán vị trí button
      const buttonRect = elements.btnNotifications.getBoundingClientRect();

      // Tính toán vị trí
      requestAnimationFrame(() => {
        const dropdownWidth = dropdown.offsetWidth || 320;
        const dropdownHeight = dropdown.offsetHeight || 400;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const spacing = 10;

        // Vị trí mặc định: dưới button, căn phải
        let top = buttonRect.bottom + spacing;
        let left = buttonRect.right - dropdownWidth;

        // Điều chỉnh vị trí
        if (left + dropdownWidth > viewportWidth - 10) {
          left = Math.max(10, viewportWidth - dropdownWidth - 10);
        }
        if (left < 10) {
          left = 10;
        }
        if (top + dropdownHeight > viewportHeight - 10) {
          top = buttonRect.top - dropdownHeight - spacing;
          if (top < 10) {
            top = 10;
            dropdown.style.maxHeight = `${viewportHeight - top - 20}px`;
          } else {
            dropdown.style.maxHeight = "";
          }
        } else {
          dropdown.style.maxHeight = "";
        }

        // Áp dụng vị trí
        dropdown.style.setProperty("position", "fixed", "important");
        dropdown.style.setProperty("top", `${top}px`, "important");
        dropdown.style.setProperty("left", `${left}px`, "important");
        dropdown.style.setProperty("z-index", "9999999", "important");

        // Hiển thị dropdown
        dropdown.style.visibility = "visible";
        requestAnimationFrame(() => {
          dropdown.style.opacity = "1";
        });
      });
    } else {
      // Ẩn dropdown
      dropdown.style.opacity = "0";
      setTimeout(() => {
        dropdown.classList.add("hidden");
        dropdown.style.visibility = "";
        dropdown.style.position = "";
        dropdown.style.top = "";
        dropdown.style.left = "";
        dropdown.style.maxHeight = "";
      }, 200);
    }
  }

  // Cập nhật arrow
  if (elements.btnNotifications) {
    const arrow = elements.btnNotifications.querySelector(
      ".notification-arrow"
    );
    if (arrow) {
      arrow.textContent = state.notificationsDropdownVisible ? "▴" : "▾";
      arrow.style.transform = state.notificationsDropdownVisible
        ? "rotate(180deg)"
        : "rotate(0deg)";
    }
  }
}

function closeNotificationsDropdown() {
  state.notificationsDropdownVisible = false;
  if (elements.notificationsDropdown) {
    elements.notificationsDropdown.classList.add("hidden");
  }
  if (elements.btnNotifications) {
    const arrow = elements.btnNotifications.querySelector(
      ".notification-arrow"
    );
    if (arrow) {
      arrow.textContent = "▾";
      arrow.style.transform = "rotate(0deg)";
    }
  }
}

function togglePaymentsDropdown() {
  state.paymentsDropdownVisible = !state.paymentsDropdownVisible;
  const dropdown = elements.paymentsDropdown;
  const button = elements.btnPayments;

  if (!dropdown || !button) return;

  if (state.paymentsDropdownVisible) {
    // Render payments trước khi hiển thị
    renderPaymentsToDropdown();

    // Xóa hidden class
    dropdown.classList.remove("hidden");
    dropdown.style.visibility = "hidden"; // Tạm thời ẩn để tính toán vị trí
    dropdown.style.opacity = "0";

    requestAnimationFrame(() => {
      // Lấy vị trí button
      const buttonRect = button.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();
      const dropdownWidth = dropdownRect.width || 320;
      const dropdownHeight = dropdownRect.height || 400;

      // Lấy kích thước viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const spacing = 10;

      // Vị trí mặc định: dưới button, căn phải
      let top = buttonRect.bottom + spacing;
      let left = buttonRect.right - dropdownWidth;

      // Điều chỉnh vị trí
      if (left + dropdownWidth > viewportWidth - 10) {
        left = Math.max(10, viewportWidth - dropdownWidth - 10);
      }
      if (left < 10) {
        left = 10;
      }
      if (top + dropdownHeight > viewportHeight - 10) {
        top = buttonRect.top - dropdownHeight - spacing;
        if (top < 10) {
          top = 10;
          dropdown.style.maxHeight = `${viewportHeight - top - 20}px`;
        } else {
          dropdown.style.maxHeight = "";
        }
      } else {
        dropdown.style.maxHeight = "";
      }

      // Áp dụng vị trí
      dropdown.style.setProperty("position", "fixed", "important");
      dropdown.style.setProperty("top", `${top}px`, "important");
      dropdown.style.setProperty("left", `${left}px`, "important");
      dropdown.style.setProperty("z-index", "9999999", "important");

      // Hiển thị dropdown
      dropdown.style.visibility = "visible";
      requestAnimationFrame(() => {
        dropdown.style.opacity = "1";
      });
    });
  } else {
    // Ẩn dropdown
    dropdown.style.opacity = "0";
    setTimeout(() => {
      dropdown.classList.add("hidden");
      dropdown.style.visibility = "";
      dropdown.style.position = "";
      dropdown.style.top = "";
      dropdown.style.left = "";
      dropdown.style.maxHeight = "";
    }, 200);
  }

  // Cập nhật arrow
  if (elements.btnPayments) {
    const arrow = elements.btnPayments.querySelector(".payment-arrow");
    if (arrow) {
      arrow.textContent = state.paymentsDropdownVisible ? "▴" : "▾";
      arrow.style.transform = state.paymentsDropdownVisible
        ? "rotate(180deg)"
        : "rotate(0deg)";
    }
  }
}

function closePaymentsDropdown() {
  state.paymentsDropdownVisible = false;
  if (elements.paymentsDropdown) {
    elements.paymentsDropdown.classList.add("hidden");
  }
  if (elements.btnPayments) {
    const arrow = elements.btnPayments.querySelector(".payment-arrow");
    if (arrow) {
      arrow.textContent = "▾";
      arrow.style.transform = "rotate(0deg)";
    }
  }
}

function handleMenuAction(action) {
  switch (action) {
    case "add-student":
      openStudentForm();
      break;
    case "settings":
      openSettingsModal();
      break;
  }
}

function updateMenuBadge() {
  if (!elements.menuBadge) return;

  const notificationCount =
    state.expiringStudents.length + state.overdueStudents.length;
  const paymentCount = state.students.reduce((total, student) => {
    return total + (student.paymentHistory?.length || 0);
  }, 0);

  const totalCount = notificationCount + paymentCount;

  if (totalCount > 0) {
    elements.menuBadge.textContent = totalCount;
    elements.menuBadge.classList.remove("hidden");
  } else {
    elements.menuBadge.classList.add("hidden");
  }
}

async function loadSettings() {
  try {
    const settings = await window.electronAPI.getSettings();
    // Gộp packages vào classes - mỗi lớp có price
    state.settings.classes = settings.classes || [];
    // Nếu có packages cũ, chuyển đổi sang classes (migration)
    if (
      settings.packages &&
      settings.packages.length > 0 &&
      state.settings.classes.length === 0
    ) {
      // Migration: chuyển packages thành classes nếu chưa có classes
      state.settings.classes = settings.packages.map((pkg) => ({
        name: pkg.name,
        price: pkg.price || null,
      }));
    }
    // Đảm bảo mỗi lớp có price
    state.settings.classes = state.settings.classes.map((cls) => ({
      name: cls.name,
      price: cls.price || null,
    }));
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

async function refreshStudents() {
  try {
    state.students = await window.electronAPI.getStudents();
    state.expiringStudents = getExpiringStudents();
    state.overdueStudents = getOverdueStudents();
    renderStudents();
    renderPayments();
    updatePaymentAlert();
    updateTotalRevenue();
  } catch (error) {
    console.error("Error loading students:", error);
  }
}

async function refreshExpiringStudents() {
  try {
    // dữ liệu từ backend chỉ xét expiryDate gốc; ta tính lại để hỗ trợ công thức 1 tháng
    await window.electronAPI.checkExpiring();
    state.expiringStudents = getExpiringStudents();
    state.overdueStudents = getOverdueStudents();
    renderNotificationsToDropdown();
    renderStudents();
    updatePaymentAlert();
    updateMenuBadge();
    updateNotificationBadge();
  } catch (error) {
    console.error("Error checking expiring students:", error);
  }
}

async function loadBackgroundImage() {
  try {
    state.backgroundImage = await window.electronAPI.getBackgroundImageData();
    if (!state.backgroundImage) {
      state.backgroundImage = './background.jpg';
    }
    applyBackground();
  } catch (error) {
    console.error("Error loading background image:", error);
    state.backgroundImage = './background.jpg';
    applyBackground();
  }
}

async function handleAvatarClick(event) {
  event.preventDefault();
  event.stopPropagation();
  try {
    const result = await window.electronAPI.selectProfileAvatar();
    if (result?.dataUrl) {
      state.profileAvatar = result.dataUrl;
      applyProfileAvatar();
    }
  } catch (error) {
    console.error("Error selecting profile avatar:", error);
    alert("Không thể chọn ảnh đại diện. Vui lòng thử lại.");
  }
}

async function loadProfileAvatar() {
  try {
    state.profileAvatar = await window.electronAPI.getProfileAvatarData();
    applyProfileAvatar();
  } catch (error) {
    console.error("Error loading profile avatar:", error);
  }
}

function applyProfileAvatar() {
  if (elements.iconCircle) {
    // Xóa event listener cũ trước khi thay đổi innerHTML
    elements.iconCircle.removeEventListener("click", handleAvatarClick);

    if (state.profileAvatar) {
      elements.iconCircle.innerHTML = `<img src="${state.profileAvatar}" alt="Avatar" class="profile-avatar-image" />`;
    } else {
      elements.iconCircle.innerHTML = typeof Icons !== 'undefined' ? Icons.brand(22) : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"></circle></svg>';
    }
    // Thêm cursor pointer và title để người dùng biết có thể click
    elements.iconCircle.style.cursor = "pointer";
    elements.iconCircle.title = "Click để đổi ảnh đại diện";

    // Gắn lại event listener sau mỗi lần cập nhật
    elements.iconCircle.addEventListener("click", handleAvatarClick);

    // Đảm bảo click vào ảnh cũng trigger event (ảnh không chặn click)
    const img = elements.iconCircle.querySelector(".profile-avatar-image");
    if (img) {
      img.style.pointerEvents = "none";
    }
  }
}

function applyBackground() {
  if (state.backgroundImage) {
    document.body.style.backgroundImage = `url(${state.backgroundImage})`;
    document.body.classList.add("has-background");
  } else {
    document.body.style.backgroundImage = "";
    document.body.classList.remove("has-background");
  }
}

function toggleStudentList() {
  if (elements.listCard && elements.btnToggleStudentList) {
    const icon = elements.btnToggleStudentList.querySelector(".collapse-icon");
    const content = elements.studentListContent;

    if (state.studentListCollapsed) {
      // Thu danh sách - ẩn bảng nội dung
      if (content) {
        content.style.opacity = "0";
        content.style.transform = "translateY(-10px)";
        setTimeout(() => {
          content.style.display = "none";
        }, 200);
      }
      elements.listCard.style.padding = "var(--spacing-lg)";
      elements.listCard.style.minHeight = "auto";

      if (icon) {
        icon.innerHTML = typeof Icons !== 'undefined' ? Icons.chevronRight(14) : '▸';
      }
    } else {
      // Mở lại danh sách - hiển thị bảng
      if (content) {
        content.style.display = "block";
        requestAnimationFrame(() => {
          content.style.opacity = "1";
          content.style.transform = "translateY(0)";
        });
      }
      elements.listCard.style.padding = "";
      elements.listCard.style.minHeight = "";

      if (icon) {
        icon.innerHTML = typeof Icons !== 'undefined' ? Icons.chevronDown(14) : '▾';
      }
    }
  }
}

function renderStudentListSummary() {
  const total = state.students.length;
  const overdue = state.overdueStudents.length;
  const expiring = state.expiringStudents.length;

  // Cập nhật stats
  const totalEl = document.getElementById("summary-total");
  const overdueEl = document.getElementById("summary-overdue");
  const expiringEl = document.getElementById("summary-expiring");

  if (totalEl) totalEl.textContent = total;
  if (overdueEl) overdueEl.textContent = overdue;
  if (expiringEl) expiringEl.textContent = expiring;

  // Hiển thị highlights nếu ở chế độ thu gọn
  const highlightsContainer = document.getElementById("summary-highlights");
  if (highlightsContainer) {
    if (!state.studentListCollapsed) {
      highlightsContainer.innerHTML = "";
      return;
    }

    const highlights = [];
    state.overdueStudents.forEach((student) => {
      const dueDate = getDueDate(student);
      const status = getStatus(dueDate);
      highlights.push({
        student,
        priority: "overdue",
        status,
      });
    });

    if (highlights.length === 0) {
      highlightsContainer.innerHTML = `
        <div class="summary-empty">
          <div class="summary-empty-icon">${typeof Icons !== 'undefined' ? Icons.check(24) : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'}</div>
          <p>Không có học viên nào trễ hạn</p>
          <small>Tất cả học viên đều đã đóng học phí đúng hạn</small>
        </div>
      `;
    } else {
      highlightsContainer.innerHTML = highlights
        .map(({ student, priority, status }) => {
          const priorityClass =
            priority === "overdue"
              ? "highlight-overdue"
              : priority === "expiring"
              ? "highlight-expiring"
              : "highlight-normal";
          return `
          <div class="summary-highlight-item ${priorityClass}">
            <div class="highlight-content">
              <div class="highlight-name">${escapeHtml(student.name)}</div>
              <div class="highlight-details">
                ${
                  student.className
                    ? `<span class="highlight-class">${escapeHtml(
                        student.className
                      )}</span>`
                    : ""
                }
                <span class="highlight-status status-badge ${
                  status.className
                }">${status.label}</span>
              </div>
            </div>
            <button class="icon-btn highlight-action" data-action="edit" data-id="${
              student.id
            }" title="Sửa">
              ${typeof Icons !== 'undefined' ? Icons.edit(14) : 'Sửa'}
            </button>
          </div>
        `;
        })
        .join("");

      highlightsContainer
        .querySelectorAll('[data-action="edit"]')
        .forEach((btn) => {
          btn.addEventListener("click", () => {
            const student = state.students.find((s) => s.id === btn.dataset.id);
            if (student) {
              openStudentForm(student);
            }
          });
        });
    }
  }
}

function ensureStudentListCollapsed() {
  // Giữ nguyên trạng thái do người dùng thiết lập
}

function getInitials(name) {
  if (!name) return "HV";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderStudents() {
  if (!elements.tableBody) return;

  // Cập nhật thẻ KPI số liệu thực tế
  const totalEl = document.getElementById("summary-total");
  const expiringEl = document.getElementById("summary-expiring");
  const overdueEl = document.getElementById("summary-overdue");
  if (totalEl) totalEl.textContent = state.students.length;
  if (expiringEl) expiringEl.textContent = state.expiringStudents.length;
  if (overdueEl) overdueEl.textContent = state.overdueStudents.length;

  // Lọc học viên theo search query
  let filteredStudents = state.students;
  if (state.studentSearchQuery) {
    filteredStudents = filteredStudents.filter((student) => {
      const name = (student.name || "").toLowerCase();
      const phone = (student.phone || "").toLowerCase();
      const className = (student.className || "").toLowerCase();
      const notes = (student.notes || "").toLowerCase();
      const query = state.studentSearchQuery;

      return (
        name.includes(query) ||
        phone.includes(query) ||
        className.includes(query) ||
        notes.includes(query)
      );
    });
  }

  // Lọc học viên theo filter pills
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (state.activeFilter === "expiring") {
    filteredStudents = filteredStudents.filter((student) => {
      return state.expiringStudents.some((s) => s.id === student.id);
    });
  } else if (state.activeFilter === "overdue") {
    filteredStudents = filteredStudents.filter((student) => {
      const dueDate = getDueDate(student);
      if (!dueDate) return false;
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    });
  } else if (state.activeFilter === "active") {
    filteredStudents = filteredStudents.filter((student) => {
      const dueDate = getDueDate(student);
      if (!dueDate) return true;
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      return due >= today;
    });
  }

  elements.studentCount.textContent = `(${filteredStudents.length}${
    state.studentSearchQuery || state.activeFilter !== "all"
      ? ` / ${state.students.length}`
      : ""
  })`;

  if (filteredStudents.length === 0) {
    elements.tableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="9">${
          state.studentSearchQuery
            ? "Không tìm thấy học viên nào khớp với tìm kiếm"
            : state.activeFilter !== "all"
            ? "Không có học viên trong danh mục này"
            : "Chưa có học viên nào"
        }</td>
      </tr>
    `;
    return;
  }

  const expiringIds = new Set(state.expiringStudents.map((s) => s.id));

  // Sắp xếp học viên theo lớp
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!a.className && !b.className) return 0;
    if (!a.className) return 1;
    if (!b.className) return -1;
    if (a.className !== b.className) {
      return a.className.localeCompare(b.className, "vi");
    }
    return a.name.localeCompare(b.name, "vi");
  });

  const rows = sortedStudents
    .map((student) => {
      const dueDate = getDueDate(student);
      const status = getStatus(dueDate);
      const isExpiring = expiringIds.has(student.id);
      const classInfo = getClassStartInfo(student.classStartDate);
      const due = dueDate ? new Date(dueDate) : null;
      if (due) due.setHours(0, 0, 0, 0);
      const isOverdue = due && due < today;
      const paymentButton = isOverdue
        ? `<button class="btn btn-payment" data-action="collect-payment" data-id="${student.id}">Thu</button>`
        : `<span class="text-muted" style="font-size: 12px;">Đã thu</span>`;

      return `
        <tr class="${isExpiring ? "row-warning" : ""}">
          <td>
            <div class="student-name-cell">
              <span class="student-avatar-badge">${getInitials(student.name)}</span>
              <span class="student-name-text">${escapeHtml(student.name)}</span>
            </div>
          </td>
          <td>
            ${
              student.phone
                ? `<a href="tel:${escapeHtml(student.phone)}" class="phone-link" title="Gọi điện">${escapeHtml(student.phone)}</a>`
                : '<span class="text-muted">-</span>'
            }
          </td>
          <td>${student.className ? `<span class="student-row-class">${escapeHtml(student.className)}</span>` : '<span class="text-muted">-</span>'}</td>
          <td>
            <button class="icon-btn" data-action="edit-date" data-id="${student.id}" title="Đổi ngày vào lớp">
              <span class="text-strong">${classInfo.dateText}</span>
              ${classInfo.detailText ? `<span class="subtext">${classInfo.detailText}</span>` : ""}
            </button>
          </td>
          <td><span class="student-row-date">${formatDate(dueDate)}</span></td>
          <td>
            <span class="status-badge ${status.className}">
              ${status.label}
            </span>
          </td>
          <td>${paymentButton}</td>
          <td>${student.notes ? escapeHtml(student.notes) : '<span class="text-muted">-</span>'}</td>
          <td class="text-right">
            <div class="actions" style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
              <button class="icon-btn" data-action="edit" data-id="${student.id}" title="Chỉnh sửa học viên">
                ${typeof Icons !== 'undefined' ? Icons.edit(14) : 'Sửa'}
              </button>
              <button class="icon-btn text-danger" data-action="delete" data-id="${student.id}" title="Xóa học viên">
                ${typeof Icons !== 'undefined' ? Icons.trash(14) : 'Xóa'}
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  elements.tableBody.innerHTML = rows;

  elements.tableBody
    .querySelectorAll('button[data-action="edit"]')
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const student = state.students.find((s) => s.id === btn.dataset.id);
        if (student) {
          openStudentForm(student);
        }
      });
    });

  elements.tableBody
    .querySelectorAll('button[data-action="delete"]')
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const student = state.students.find((s) => s.id === btn.dataset.id);
        if (student) {
          openDeleteConfirm(student);
        }
      });
    });

  elements.tableBody
    .querySelectorAll('button[data-action="edit-date"]')
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const student = state.students.find((s) => s.id === btn.dataset.id);
        if (student) {
          openClassStartDateEditor(student);
        }
      });
    });

  elements.tableBody
    .querySelectorAll('button[data-action="collect-payment"]')
    .forEach((btn) => {
      btn.addEventListener("click", async () => {
        const student = state.students.find((s) => s.id === btn.dataset.id);
        if (student) {
          await collectPayment(student);
        }
      });
    });
}

function renderNotificationsToDropdown() {
  if (!elements.notificationsDropdownContent) return;

  const totalAlerts =
    state.expiringStudents.length + state.overdueStudents.length;
  const count = totalAlerts;

  // Cập nhật badge
  if (count > 0) {
    if (elements.notificationBadge) {
      elements.notificationBadge.textContent = count;
      elements.notificationBadge.classList.remove("hidden");
    }
  } else {
    if (elements.notificationBadge) {
      elements.notificationBadge.classList.add("hidden");
    }
  }
  updateNotificationBadge();

  if (count === 0) {
    elements.notificationsDropdownContent.innerHTML = `<div class="empty">Không có học viên nào sắp hoặc đã hết hạn</div>`;
    return;
  }

  const overdueSection =
    state.overdueStudents.length > 0
      ? `
        <div class="notification-section">
          <h4>Đã quá hạn</h4>
          ${
            state.overdueStudents
              .map((student) => {
                const notificationId = `overdue-${student.id}`;
                if (state.dismissedNotifications.has(notificationId)) {
                  return "";
                }
                const overdueDays = student.overdueDays;
                const overdueDuration =
                  formatDurationFromDates(getDueDate(student), new Date()) ||
                  `${overdueDays} ngày`;
                return `
                <div class="notification-item overdue" data-notification-id="${notificationId}">
                  <div class="notification-content">
                    <strong>${escapeHtml(student.name)}</strong>
                    <p>${formatDate(getDueDate(student))}</p>
                    <small>
                      Trễ hạn${overdueDuration}
                    </small>
                  </div>
                  <button class="icon-btn btn-dismiss-notification" data-notification-id="${notificationId}" title="Đóng thông báo">${typeof Icons !== 'undefined' ? Icons.close(14) : '×'}</button>
                </div>
              `;
              })
              .filter((html) => html !== "")
              .join("") ||
            '<div class="notification-item">Không có dữ liệu</div>'
          }
        </div>`
      : "";

  const expiringSection =
    state.expiringStudents.length > 0
      ? `
        <div class="notification-section">
          <h4>Sắp hết hạn</h4>
          ${
            state.expiringStudents
              .map((student) => {
                const notificationId = `expiring-${student.id}`;
                if (state.dismissedNotifications.has(notificationId)) {
                  return "";
                }
                const dueDate = getDueDate(student);
                const status = getStatus(dueDate);
                const classInfo = getClassStartInfo(student.classStartDate);
                return `
                <div class="notification-item" data-notification-id="${notificationId}">
                  <div class="notification-content">
                    <strong>${escapeHtml(student.name)}</strong>
                    <p>${formatDate(dueDate)}</p>
                    <small>
                      ${status.label}${
                  classInfo.detailText ? ` • ${classInfo.detailText}` : ""
                }
                    </small>
                  </div>
                  <button class="icon-btn btn-dismiss-notification" data-notification-id="${notificationId}" title="Đóng thông báo">${typeof Icons !== 'undefined' ? Icons.close(14) : '×'}</button>
                </div>
              `;
              })
              .filter((html) => html !== "")
              .join("") ||
            '<div class="notification-item">Không có dữ liệu</div>'
          }
        </div>`
      : "";

  elements.notificationsDropdownContent.innerHTML =
    overdueSection + expiringSection;

  // Event listener cho nút đóng thông báo
  elements.notificationsDropdownContent
    .querySelectorAll(".btn-dismiss-notification")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const notificationId = btn.dataset.notificationId;
        // Xóa thông báo khỏi giao diện
        state.dismissedNotifications.add(notificationId);
        renderNotificationsToDropdown();
        updateNotificationBadge();
      });
    });
}

function renderNotifications() {
  // Giữ lại hàm này để tương thích, nhưng không sử dụng nữa
  // Sử dụng renderNotificationsToDropdown() thay thế
  renderNotificationsToDropdown();
}

function updateNotificationBadge() {
  if (!elements.notificationBadge) return;

  const notificationCount =
    state.expiringStudents.length + state.overdueStudents.length;

  if (notificationCount > 0) {
    elements.notificationBadge.textContent = notificationCount;
    elements.notificationBadge.classList.remove("hidden");
  } else {
    elements.notificationBadge.classList.add("hidden");
  }
}

function openStudentForm(student = null) {
  const today = new Date().toISOString().split("T")[0];
  const formValues = {
    name: student?.name || "",
    phone: student?.phone || "",
    className: student?.className || "",
    registrationDate: student?.registrationDate
      ? toInputDate(student.registrationDate)
      : today,
    classStartDate: student?.classStartDate
      ? toInputDate(student.classStartDate)
      : today,
    expiryDate: student?.expiryDate ? toInputDate(student.expiryDate) : "",
    notes: student?.notes || "",
  };

  const safeValues = {
    name: escapeHtml(formValues.name),
    phone: escapeHtml(formValues.phone),
    className: escapeHtml(formValues.className),
    registrationDate: escapeHtml(formValues.registrationDate),
    classStartDate: escapeHtml(formValues.classStartDate),
    expiryDate: escapeHtml(formValues.expiryDate),
    notes: escapeHtml(formValues.notes),
  };

  const classesOptions = state.settings.classes
    .map(
      (cls) =>
        `<option value="${escapeHtml(cls.name)}" ${
          formValues.className === cls.name ? "selected" : ""
        }>${escapeHtml(cls.name)}</option>`
    )
    .join("");

  const overlay = createModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>${student ? "Cập nhật học viên" : "Thêm học viên mới"}</h3>
        <button class="icon-btn" data-close title="Đóng">${typeof Icons !== 'undefined' ? Icons.close(16) : '×'}</button>
      </div>
      <form id="student-form">
        <div class="modal-body">
          <div class="form-group">
            <label>Họ tên <span class="required">*</span></label>
            <input type="text" name="name" value="${
              safeValues.name
            }" required />
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <input type="tel" name="phone" value="${safeValues.phone}" />
          </div>
          <div class="form-group">
            <label>Lớp</label>
            <select name="className" id="student-class-select">
              <option value="">-- Chọn lớp --</option>
              ${classesOptions}
            </select>
            <div id="class-price-display" style="margin-top: 8px; color: rgba(255, 255, 255, 0.8); font-size: 14px;"></div>
          </div>
          <div class="form-group">
            <label>
              <span>Ngày vào lớp <span class="required">*</span></span>
              <button type="button" class="icon-btn" data-today>Hôm nay</button>
            </label>
            <input type="date" name="classStartDate" value="${
              safeValues.classStartDate
            }" required />
          </div>
          <div class="form-group">
            <label>Ghi chú</label>
            <textarea name="notes">${safeValues.notes}</textarea>
          </div>
        </div>
        <div class="modal-actions">
          ${
            student
              ? '<button type="button" class="btn danger" data-delete>Xóa</button>'
              : ""
          }
          <button type="button" class="btn secondary" data-close>Hủy</button>
          <button type="submit" class="btn primary">${
            student ? "Cập nhật" : "Thêm mới"
          }</button>
        </div>
      </form>
    </div>
  `);

  const form = overlay.querySelector("#student-form");
  const todayButton = overlay.querySelector("[data-today]");
  const deleteButton = overlay.querySelector("[data-delete]");
  const classSelect = overlay.querySelector("#student-class-select");
  const priceDisplay = overlay.querySelector("#class-price-display");

  // Hiển thị giá khi chọn lớp
  classSelect?.addEventListener("change", () => {
    const selectedClassName = classSelect.value;
    if (selectedClassName) {
      const selectedClass = state.settings.classes.find(
        (cls) => cls.name === selectedClassName
      );
      if (selectedClass && selectedClass.price) {
        priceDisplay.textContent = `Giá học phí: ${selectedClass.price.toLocaleString(
          "vi-VN"
        )} VND`;
      } else {
        priceDisplay.textContent = "Chưa đặt giá cho lớp này";
      }
    } else {
      priceDisplay.textContent = "";
    }
  });

  // Hiển thị giá ban đầu nếu đang sửa học viên
  if (student?.className) {
    const selectedClass = state.settings.classes.find(
      (cls) => cls.name === student.className
    );
    if (selectedClass && selectedClass.price) {
      priceDisplay.textContent = `Giá học phí: ${selectedClass.price.toLocaleString(
        "vi-VN"
      )} VND`;
    }
  }

  todayButton?.addEventListener("click", () => {
    const input = form.querySelector('input[name="classStartDate"]');
    input.value = new Date().toISOString().split("T")[0];
  });

  deleteButton?.addEventListener("click", () => {
    closeModal(overlay);
    if (student) {
      openDeleteConfirm(student);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      id: student?.id,
      name: data.get("name").trim(),
      phone: data.get("phone").trim(),
      className: data.get("className") || null,
      registrationDate: data.get("registrationDate") || null,
      classStartDate: data.get("classStartDate"),
      expiryDate: data.get("expiryDate") || null,
      notes: data.get("notes").trim(),
    };

    if (!payload.name) {
      alert("Vui lòng nhập tên học viên");
      return;
    }

    if (!payload.classStartDate) {
      alert("Vui lòng chọn ngày vào lớp");
      return;
    }

    if (!payload.expiryDate && payload.classStartDate) {
      payload.expiryDate = calcOneMonthLater(payload.classStartDate);
    }

    try {
      await window.electronAPI.saveStudent(payload);
      await refreshStudents();
      await refreshExpiringStudents();
      closeModal(overlay);
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Không thể lưu học viên");
    }
  });
}

function openClassStartDateEditor(student) {
  const overlay = createModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>Chỉnh sửa ngày vào lớp</h3>
        <button class="icon-btn" data-close title="Đóng">${typeof Icons !== 'undefined' ? Icons.close(16) : '×'}</button>
      </div>
      <form id="class-date-form">
        <div class="modal-body">
          <p><strong>${escapeHtml(student.name)}</strong></p>
          <div class="form-group" style="margin-top: 16px;">
            <label>Ngày vào lớp</label>
            <input type="date" name="classStartDate" value="${
              toInputDate(student.classStartDate) || ""
            }" required />
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn secondary" data-close>Hủy</button>
          <button type="submit" class="btn primary">Cập nhật</button>
        </div>
      </form>
    </div>
  `);

  const form = overlay.querySelector("#class-date-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const date = form.classStartDate.value;
    if (!date) {
      alert("Vui lòng chọn ngày");
      return;
    }

    try {
      await window.electronAPI.saveStudent({
        ...student,
        classStartDate: date,
        expiryDate: student.expiryDate || calcOneMonthLater(date),
      });
      await refreshStudents();
      closeModal(overlay);
    } catch (error) {
      console.error("Error updating class date:", error);
      alert("Không thể cập nhật ngày vào lớp");
    }
  });
}

function openDeleteConfirm(student) {
  const overlay = createModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>Xóa học viên</h3>
        <button class="icon-btn" data-close title="Đóng">${typeof Icons !== 'undefined' ? Icons.close(16) : '×'}</button>
      </div>
      <div class="modal-body">
        <p>Bạn có chắc chắn muốn xóa học viên <strong>${escapeHtml(
          student.name
        )}</strong>?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </div>
      <div class="modal-actions">
        <button class="btn secondary" data-close>Hủy</button>
        <button class="btn danger" data-confirm>Xóa</button>
      </div>
    </div>
  `);

  overlay
    .querySelector("[data-confirm]")
    .addEventListener("click", async () => {
      try {
        await window.electronAPI.deleteStudent(student.id);
        await refreshStudents();
        await refreshExpiringStudents();
        closeModal(overlay);
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Không thể xóa học viên");
      }
    });
}

async function collectPayment(student) {
  // Tìm giá của lớp học viên
  let classPrice = null;
  if (student.className) {
    const selectedClass = state.settings.classes.find(
      (cls) => cls.name === student.className
    );
    if (selectedClass && selectedClass.price) {
      classPrice = selectedClass.price;
    }
  }

  // Hiển thị modal nhập số tiền
  const overlay = createModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>Thu học phí</h3>
        <button class="icon-btn" data-close title="Đóng">${typeof Icons !== 'undefined' ? Icons.close(16) : '×'}</button>
      </div>
      <form id="payment-form">
        <div class="modal-body">
          <p><strong>Học viên:</strong> ${escapeHtml(student.name)}</p>
          ${
            student.className
              ? `<p><strong>Lớp:</strong> ${escapeHtml(student.className)}</p>`
              : ""
          }
          ${
            classPrice
              ? `<p style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Giá lớp: ${classPrice.toLocaleString(
                  "vi-VN"
                )} VND</p>`
              : ""
          }
          <div class="form-group" style="margin-top: 16px;">
            <label>Số tiền (VND) <span class="required">*</span></label>
            <input type="number" name="amount" min="0" required placeholder="Nhập số tiền đã thu" value="${
              classPrice || ""
            }" />
            ${
              classPrice
                ? `<button type="button" class="icon-btn" id="btn-use-class-price" style="margin-left: 8px;">Dùng giá lớp</button>`
                : ""
            }
          </div>
          <div class="form-group">
            <label>Ghi chú</label>
            <textarea name="notes" placeholder="Ghi chú (tùy chọn)"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn secondary" data-close>Hủy</button>
          <button type="submit" class="btn primary">Xác nhận thu</button>
        </div>
      </form>
    </div>
  `);

  // Nút dùng giá lớp
  const useClassPriceBtn = overlay.querySelector("#btn-use-class-price");
  if (useClassPriceBtn && classPrice) {
    useClassPriceBtn.addEventListener("click", () => {
      const amountInput = overlay.querySelector('input[name="amount"]');
      amountInput.value = classPrice;
    });
  }

  const form = overlay.querySelector("#payment-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const amount = parseInt(formData.get("amount"));
    const notes = formData.get("notes").trim();

    if (!amount || amount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    try {
      const currentDueDate = getDueDate(student);
      if (!currentDueDate) {
        alert(
          "Không thể tính ngày hết hạn. Vui lòng kiểm tra lại thông tin học viên."
        );
        closeModal(overlay);
        return;
      }

      const newExpiryDate = calcOneMonthLater(currentDueDate);
      if (!newExpiryDate) {
        alert("Không thể tính ngày hết hạn mới.");
        closeModal(overlay);
        return;
      }

      // Lưu payment history với số tiền
      const paymentHistory = student.paymentHistory || [];
      paymentHistory.push({
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        amount: amount,
        notes: notes,
      });

      await window.electronAPI.saveStudent({
        ...student,
        expiryDate: newExpiryDate,
        paymentHistory: paymentHistory,
      });

      await refreshStudents();
      await refreshExpiringStudents();
      updateTotalRevenue();
      closeModal(overlay);
    } catch (error) {
      console.error("Error collecting payment:", error);
      alert("Không thể cập nhật học phí");
    }
  });
}

function renderPayments() {
  // Tính toán và cập nhật badge
  const allPayments = [];
  state.students.forEach((student) => {
    if (student.paymentHistory && student.paymentHistory.length > 0) {
      student.paymentHistory.forEach((payment) => {
        allPayments.push({
          ...payment,
          studentId: student.id,
          studentName: student.name,
          studentPhone: student.phone || "-",
        });
      });
    }
  });

  // Sắp xếp theo ngày mới nhất
  allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Lọc các payment đã bị đóng
  const activePayments = allPayments.filter(
    (p) => !state.dismissedPayments.has(`payment-${p.studentId}-${p.id}`)
  );

  const count = activePayments.length;
  if (count > 0) {
    if (elements.paymentBadge) {
      elements.paymentBadge.textContent = count;
      elements.paymentBadge.classList.remove("hidden");
    }
  } else {
    if (elements.paymentBadge) {
      elements.paymentBadge.classList.add("hidden");
    }
  }
  updateMenuBadge();

  // Render vào dropdown nếu đang mở
  if (state.paymentsDropdownVisible) {
    renderPaymentsToDropdown(activePayments);
  }
}

function renderPaymentsToDropdown(activePayments = null) {
  const dropdownContent = elements.paymentsDropdownContent;
  if (!dropdownContent) return;

  // Nếu không có payments được truyền vào, tính toán lại
  if (!activePayments) {
    const allPayments = [];
    state.students.forEach((student) => {
      if (student.paymentHistory && student.paymentHistory.length > 0) {
        student.paymentHistory.forEach((payment) => {
          allPayments.push({
            ...payment,
            studentId: student.id,
            studentName: student.name,
            studentPhone: student.phone || "-",
          });
        });
      }
    });
    allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    activePayments = allPayments.filter(
      (p) => !state.dismissedPayments.has(`payment-${p.studentId}-${p.id}`)
    );
  }

  if (activePayments.length === 0) {
    dropdownContent.innerHTML = `<div class="empty">Chưa có giao dịch nào</div>`;
    return;
  }

  dropdownContent.innerHTML = `
      <div class="payment-list">
        ${activePayments
          .map((payment) => {
            const paymentId = `payment-${payment.studentId}-${payment.id}`;
            return `
            <div class="payment-item-dropdown" data-payment-id="${paymentId}">
              <div class="payment-item-header">
                  <div>
                    <strong>${escapeHtml(payment.studentName)}</strong>
                    ${
                      payment.studentPhone && payment.studentPhone !== "-"
                        ? `<p class="payment-phone">${escapeHtml(
                            payment.studentPhone
                          )}</p>`
                        : ""
                    }
                  </div>
                  <div class="payment-actions">
                    <button class="icon-btn btn-dismiss-payment" data-payment-id="${paymentId}" title="Đóng">${typeof Icons !== 'undefined' ? Icons.close(14) : '×'}</button>
                    <button class="icon-btn btn-delete-payment text-danger" data-payment-id="${
                      payment.id
                    }" data-student-id="${
                      payment.studentId
                    }" title="Xóa">${typeof Icons !== 'undefined' ? Icons.trash(14) : 'Xóa'}</button>
                  </div>
                </div>
              <div class="payment-item-details">
                  <p><span class="label">Ngày thu:</span> ${formatDate(
                    payment.date
                  )}</p>
                  ${
                    payment.amount
                      ? `<p><span class="label">Số tiền:</span> ${payment.amount.toLocaleString(
                          "vi-VN"
                        )} VND</p>`
                      : ""
                  }
                  ${
                    payment.notes
                      ? `<p class="payment-notes"><span class="label">Ghi chú:</span> ${escapeHtml(
                          payment.notes
                        )}</p>`
                      : ""
                  }
                </div>
              </div>
            `;
          })
          .join("")}
    </div>
  `;

  // Event listener cho nút đóng payment
  dropdownContent.querySelectorAll(".btn-dismiss-payment").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const paymentId = btn.dataset.paymentId;
      // Xóa payment khỏi giao diện
      state.dismissedPayments.add(paymentId);
      renderPayments();
    });
  });

  // Event listener cho nút xóa payment
  dropdownContent.querySelectorAll(".btn-delete-payment").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const paymentId = btn.dataset.paymentId;
      const studentId = btn.dataset.studentId;
      const student = state.students.find((s) => s.id === studentId);
      if (student) {
        await deletePayment(student, paymentId);
      }
    });
  });
}

async function deletePayment(student, paymentId) {
  if (!confirm(`Bạn có chắc chắn muốn xóa giao dịch này?`)) {
    return;
  }

  try {
    const paymentHistory = (student.paymentHistory || []).filter(
      (p) => p.id !== paymentId
    );

    await window.electronAPI.saveStudent({
      ...student,
      paymentHistory: paymentHistory,
    });

    await refreshStudents();
    updateTotalRevenue();
  } catch (error) {
    console.error("Error deleting payment:", error);
    alert("Không thể xóa giao dịch");
  }
}

function calculateTotalRevenue() {
  let total = 0;
  state.students.forEach((student) => {
    if (student.paymentHistory && student.paymentHistory.length > 0) {
      student.paymentHistory.forEach((payment) => {
        if (payment.amount && payment.amount > 0) {
          total += payment.amount;
        }
      });
    } else if (student.feePaid && Number(student.feePaid) > 0) {
      total += Number(student.feePaid);
    }
  });
  return total;
}

function updateTotalRevenue() {
  if (elements.totalRevenue) {
    const total = calculateTotalRevenue();
    if (state.revenueVisible) {
      elements.totalRevenue.textContent =
        total.toLocaleString("vi-VN") + " VND";
    } else {
      // Hiển thị dạng **** với số ký tự tương ứng
      const masked = "****";
      elements.totalRevenue.textContent = masked;
    }
  }

  // Cập nhật icon mắt
  if (elements.revenueEyeIcon) {
    if (state.revenueVisible) {
      elements.revenueEyeIcon.innerHTML = typeof Icons !== 'undefined' ? Icons.eye(16) : 'Mở';
    } else {
      elements.revenueEyeIcon.innerHTML = typeof Icons !== 'undefined' ? Icons.eyeOff(16) : 'Khóa';
    }
  }
}

function openSettingsModal() {
  const classesHtml = state.settings.classes
    .map(
      (cls, index) => `
      <div class="settings-item">
        <div class="settings-item-content">
          <strong>${escapeHtml(cls.name || "")}</strong>
          <span class="settings-item-price">${
            cls.price
              ? cls.price.toLocaleString("vi-VN") + " VND"
              : "Chưa đặt giá"
          }</span>
        </div>
        <div class="settings-item-actions">
          <button class="icon-btn" data-edit-class data-index="${index}">Sửa</button>
          <button class="icon-btn" data-delete-class data-index="${index}">Xóa</button>
        </div>
      </div>
    `
    )
    .join("");

  const overlay = createModal(`
    <div class="modal settings-modal">
      <div class="modal-header">
        <h3>Cài đặt</h3>
        <button class="icon-btn" data-close title="Đóng">${typeof Icons !== 'undefined' ? Icons.close(16) : '×'}</button>
      </div>
      <div class="modal-body settings-body">
        <div class="settings-section">
          <h4>Ảnh đại diện</h4>
          <div class="form-group">
            <div class="profile-avatar-preview" data-select-avatar style="width: 64px; height: 64px; border-radius: 16px; overflow: hidden; background: rgba(0, 0, 0, 0.05); margin-bottom: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;" title="Click để chọn ảnh">
              ${
                state.profileAvatar
                  ? `<img src="${state.profileAvatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />`
                  : (typeof Icons !== 'undefined' ? Icons.brand(36) : '<span>Sun Yoga</span>')
              }
            </div>
          </div>
          <div class="actions" style="justify-content: flex-start;">
            <button class="btn primary" data-select-avatar>Chọn ảnh</button>
            <button class="btn secondary" data-reset-avatar>Xóa ảnh</button>
          </div>
        </div>

        <div class="settings-section">
          <h4>Hình nền</h4>
          <div class="form-group">
            ${
              state.backgroundImage
                ? `<img src="${state.backgroundImage}" alt="Background" data-select-bg style="width: 100%; border-radius: 16px; margin-bottom: 12px; max-height: 200px; object-fit: cover; cursor: pointer; transition: all 0.2s ease;" title="Click để chọn ảnh" />`
                : '<p class="muted">Đang dùng nền mặc định</p>'
            }
          </div>
          <div class="actions" style="justify-content: flex-start;">
            <button class="btn primary" data-select-bg>Chọn ảnh</button>
            <button class="btn secondary" data-reset-bg>Xóa ảnh</button>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section-header">
            <h4>Lớp tập và giá</h4>
            <button class="btn primary btn-sm" data-add-class>+ Thêm lớp</button>
          </div>
          <div class="settings-list">
            ${classesHtml || '<p class="muted">Chưa có lớp tập nào</p>'}
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn primary" data-close>Đóng</button>
      </div>
    </div>
  `);

  // Profile avatar handlers - xử lý cả button và preview image
  const selectAvatarHandler = async () => {
    try {
      const result = await window.electronAPI.selectProfileAvatar();
      if (result?.dataUrl) {
        state.profileAvatar = result.dataUrl;
        applyProfileAvatar();
        closeModal(overlay);
        openSettingsModal();
      }
    } catch (error) {
      console.error("Error selecting profile avatar:", error);
    }
  };

  overlay.querySelectorAll("[data-select-avatar]").forEach((el) => {
    el.addEventListener("click", selectAvatarHandler);
  });

  overlay
    .querySelector("[data-reset-avatar]")
    .addEventListener("click", async () => {
      try {
        await window.electronAPI.resetProfileAvatar();
        state.profileAvatar = null;
        applyProfileAvatar();
        closeModal(overlay);
        openSettingsModal();
      } catch (error) {
        console.error("Error resetting profile avatar:", error);
      }
    });

  // Background image handlers - xử lý cả button và preview image
  const selectBgHandler = async () => {
    try {
      const result = await window.electronAPI.selectBackgroundImage();
      if (result?.dataUrl) {
        state.backgroundImage = result.dataUrl;
        applyBackground();
        closeModal(overlay);
        openSettingsModal();
      }
    } catch (error) {
      console.error("Error selecting background:", error);
    }
  };

  overlay.querySelectorAll("[data-select-bg]").forEach((el) => {
    el.addEventListener("click", selectBgHandler);
  });

  overlay
    .querySelector("[data-reset-bg]")
    .addEventListener("click", async () => {
      try {
        await window.electronAPI.resetBackground();
        state.backgroundImage = null;
        applyBackground();
        closeModal(overlay);
        openSettingsModal();
      } catch (error) {
        console.error("Error resetting background:", error);
      }
    });

  // Class handlers
  overlay.querySelector("[data-add-class]").addEventListener("click", () => {
    openClassForm(overlay);
  });

  overlay.querySelectorAll("[data-edit-class]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      openClassForm(overlay, state.settings.classes[index], index);
    });
  });

  overlay.querySelectorAll("[data-delete-class]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const index = parseInt(btn.dataset.index);
      if (confirm("Bạn có chắc chắn muốn xóa lớp tập này?")) {
        state.settings.classes.splice(index, 1);
        await saveSettings();
        closeModal(overlay);
        openSettingsModal();
      }
    });
  });
}

function openPackageForm(parentOverlay, packageData = null, index = -1) {
  const overlay = createModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>${packageData ? "Sửa gói tập" : "Thêm gói tập mới"}</h3>
        <button class="icon-btn" data-close title="Đóng">${typeof Icons !== 'undefined' ? Icons.close(16) : '×'}</button>
      </div>
      <form id="package-form">
        <div class="modal-body">
          <div class="form-group">
            <label>Tên gói <span class="required">*</span></label>
            <input type="text" name="name" value="${
              packageData ? escapeHtml(packageData.name || "") : ""
            }" required />
          </div>
          <div class="form-group">
            <label>Giá (VND)</label>
            <input type="number" name="price" value="${
              packageData ? packageData.price || "" : ""
            }" min="0" />
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn secondary" data-close>Hủy</button>
          <button type="submit" class="btn primary">${
            packageData ? "Cập nhật" : "Thêm mới"
          }</button>
        </div>
      </form>
    </div>
  `);

  overlay
    .querySelector("#package-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const packageObj = {
        name: formData.get("name").trim(),
        price: formData.get("price") ? parseInt(formData.get("price")) : null,
      };

      if (!packageObj.name) {
        alert("Vui lòng nhập tên gói");
        return;
      }

      if (index >= 0) {
        state.settings.packages[index] = packageObj;
      } else {
        state.settings.packages.push(packageObj);
      }

      await saveSettings();
      closeModal(overlay);
      closeModal(parentOverlay);
      openSettingsModal();
    });
}

function openClassForm(parentOverlay, classData = null, index = -1) {
  const overlay = createModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>${classData ? "Sửa lớp tập" : "Thêm lớp tập mới"}</h3>
        <button class="icon-btn" data-close title="Đóng">${typeof Icons !== 'undefined' ? Icons.close(16) : '×'}</button>
      </div>
      <form id="class-form">
        <div class="modal-body">
          <div class="form-group">
            <label>Tên lớp <span class="required">*</span></label>
            <input type="text" name="name" value="${
              classData ? escapeHtml(classData.name || "") : ""
            }" required />
          </div>
          <div class="form-group">
            <label>Giá học phí (VND)</label>
            <input type="number" name="price" value="${
              classData ? classData.price || "" : ""
            }" min="0" placeholder="Nhập giá học phí" />
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn secondary" data-close>Hủy</button>
          <button type="submit" class="btn primary">${
            classData ? "Cập nhật" : "Thêm mới"
          }</button>
        </div>
      </form>
    </div>
  `);

  overlay.querySelector("#class-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const classObj = {
      name: formData.get("name").trim(),
      price: formData.get("price") ? parseInt(formData.get("price")) : null,
    };

    if (!classObj.name) {
      alert("Vui lòng nhập tên lớp");
      return;
    }

    if (index >= 0) {
      state.settings.classes[index] = classObj;
    } else {
      state.settings.classes.push(classObj);
    }

    await saveSettings();
    closeModal(overlay);
    closeModal(parentOverlay);
    openSettingsModal();
  });
}

async function saveSettings() {
  try {
    await window.electronAPI.saveSettings({
      classes: state.settings.classes,
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    alert("Không thể lưu cài đặt");
  }
}

function createModal(innerHtml) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = innerHtml;
  elements.modalRoot.appendChild(overlay);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.closest("[data-close]")) {
      closeModal(overlay);
    }
  });

  return overlay;
}

function closeModal(overlay) {
  overlay.remove();
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

function toInputDate(value) {
  if (!value) return "";
  if (value.includes("T")) {
    return value.split("T")[0];
  }
  return value;
}

function getStatus(expiryDate) {
  if (!expiryDate) {
    return { label: "Chưa có", className: "status-gray" };
  }
  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) {
    return { label: "Không hợp lệ", className: "status-gray" };
  }
  const today = resetDate(new Date());
  const normalizedExpiry = resetDate(expiry);
  const diff = Math.round((normalizedExpiry - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return { label: `Trễ hạn${Math.abs(diff)} ngày`, className: "status-red" };
  }
  if (diff === 0) {
    return { label: "Hết hạn hôm nay", className: "status-red" };
  }
  if (diff <= 7) {
    return { label: `Còn ${diff} ngày`, className: "status-orange" };
  }
  return { label: `Còn ${diff} ngày`, className: "status-green" };
}

function resetDate(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Đồng hồ
let clockInterval = null;
let currentCalendarDate = new Date();

function initClock() {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
}

function updateClock() {
  if (!elements.clockTime || !elements.clockDate) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  elements.clockTime.textContent = `${hours}:${minutes}:${seconds}`;

  const days = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  const dayName = days[now.getDay()];
  const dateStr = now.toLocaleDateString("vi-VN");

  elements.clockDate.textContent = `${dayName}, ${dateStr}`;

  if (elements.clockLunar) {
    const lunarNow = convertSolarToLunar(now);
    elements.clockLunar.textContent = `Âm lịch: ${lunarNow.day} Tháng ${lunarNow.monthName}`;
  }
}

// Hàm chuyển đổi ngày dương sang âm lịch (phiên bản đơn giản)
// Lưu ý: Để chính xác hoàn toàn cần bảng dữ liệu đầy đủ, đây là phiên bản gần đúng
function convertSolarToLunar(solarDate) {
  const date = new Date(solarDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Bảng tên tháng âm lịch
  const lunarMonths = [
    "Giêng",
    "Hai",
    "Ba",
    "Tư",
    "Năm",
    "Sáu",
    "Bảy",
    "Tám",
    "Chín",
    "Mười",
    "Một",
    "Chạp",
  ];

  // Bảng ngày đầu năm âm lịch (từ 1900-2100, đơn giản hóa)
  // Ngày 1 tháng 1 âm lịch tương ứng với ngày dương nào
  const LUNAR_NEW_YEAR = [
    // Một số năm mẫu (cần bảng đầy đủ cho độ chính xác cao)
    31, 19, 8, 27, 15, 4, 24, 12, 1, 20, 9, 28, 16, 5, 25, 13, 2, 21, 10, 29,
    17, 6, 26, 14, 3, 22, 11, 30, 18, 7, 27, 15, 4, 24, 12, 1, 20, 9, 28, 16,
  ];

  // Tính offset năm (đơn giản hóa)
  const yearOffset = year - 1900;
  const daysFromNewYear = Math.floor(
    (date - new Date(year, 0, 1)) / (1000 * 60 * 60 * 24)
  );

  // Ước tính tháng và ngày âm (công thức gần đúng)
  // Mỗi tháng âm lịch có khoảng 29.5 ngày
  const estimatedLunarDays = daysFromNewYear + (yearOffset % 19) * 354;
  const lunarMonthIndex = Math.floor((estimatedLunarDays % 354) / 29.5);
  const lunarDay = Math.floor((estimatedLunarDays % 354) % 29.5) + 1;

  // Điều chỉnh để có giá trị hợp lệ
  const finalDay = Math.max(1, Math.min(30, lunarDay));
  const finalMonth = Math.max(0, Math.min(11, lunarMonthIndex));

  return {
    day: finalDay,
    month: finalMonth,
    monthName: lunarMonths[finalMonth],
  };
}

// Lịch
function initCalendar() {
  if (!elements.calendarGrid || !elements.calendarMonthYear) return;

  renderCalendar();

  if (elements.calendarPrev) {
    elements.calendarPrev.addEventListener("click", () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (elements.calendarNext) {
    elements.calendarNext.addEventListener("click", () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
      renderCalendar();
    });
  }
}

function renderCalendar() {
  if (!elements.calendarGrid || !elements.calendarMonthYear) return;

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  // Cập nhật header
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  elements.calendarMonthYear.textContent = `${monthNames[month]}, ${year}`;

  // Lấy ngày đầu tiên của tháng và số ngày trong tháng
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Chủ nhật

  // Tên các ngày trong tuần
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  // Tạo HTML cho lịch
  let html = '<div class="calendar-weekdays">';
  dayNames.forEach((day) => {
    html += `<div class="calendar-weekday">${day}</div>`;
  });
  html += '</div><div class="calendar-days">';

  // Thêm các ô trống cho ngày đầu tháng
  for (let i = 0; i < startingDayOfWeek; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  // Thêm các ngày trong tháng
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const hasNote = state.calendarNotes[dateKey];
    const isToday =
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year;
    // Tính lịch âm
    const solarDate = new Date(year, month, day);
    const lunarDate = convertSolarToLunar(solarDate);

    html += `<div class="calendar-day ${isToday ? "today" : ""} ${
      hasNote ? "has-note" : ""
    }" data-date="${dateKey}">
      <div class="calendar-day-solar">${day}</div>
      <div class="calendar-day-lunar">${lunarDate.day}/${
      lunarDate.monthName
    }</div>
      ${hasNote ? '<span class="note-indicator">●</span>' : ""}
    </div>`;
  }

  html += "</div>";
  elements.calendarGrid.innerHTML = html;

  // Thêm event listener cho các ngày
  elements.calendarGrid
    .querySelectorAll(".calendar-day:not(.empty)")
    .forEach((dayEl) => {
      dayEl.addEventListener("click", () => {
        const dateKey = dayEl.dataset.date;
        openCalendarNoteModal(dateKey);
      });
    });
}

function openCalendarNoteModal(dateKey) {
  const date = new Date(dateKey);
  const dateStr = date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const currentNote = state.calendarNotes[dateKey] || "";

  const overlay = createModal(`
    <div class="modal">
      <div class="modal-header">
        <h3>Ghi chú ngày ${dateStr}</h3>
        <button class="icon-btn" data-close title="Đóng">${typeof Icons !== 'undefined' ? Icons.close(16) : '×'}</button>
      </div>
      <form id="calendar-note-form">
        <div class="modal-body">
          <div class="form-group">
            <label>Ghi chú</label>
            <textarea name="note" rows="5" placeholder="Nhập ghi chú cho ngày này...">${escapeHtml(
              currentNote
            )}</textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn secondary" data-close>Hủy</button>
          ${
            currentNote
              ? '<button type="button" class="btn danger" id="btn-delete-note">Xóa ghi chú</button>'
              : ""
          }
          <button type="submit" class="btn primary">Lưu</button>
        </div>
      </form>
    </div>
  `);

  const form = overlay.querySelector("#calendar-note-form");
  const deleteBtn = overlay.querySelector("#btn-delete-note");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = form.note.value.trim();
    if (note) {
      state.calendarNotes[dateKey] = note;
    } else {
      delete state.calendarNotes[dateKey];
    }
    saveCalendarNotes();
    renderCalendar();
    closeModal(overlay);
  });

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      delete state.calendarNotes[dateKey];
      saveCalendarNotes();
      renderCalendar();
      closeModal(overlay);
    });
  }
}

function getClassStartInfo(classStartDate) {
  const dateText = formatDate(classStartDate);
  if (!classStartDate) {
    return { dateText, detailText: "" };
  }

  const start = new Date(classStartDate);
  if (Number.isNaN(start.getTime())) {
    return { dateText: "-", detailText: "" };
  }

  const today = resetDate(new Date());
  const startNormalized = resetDate(start);
  const diff = Math.round((today - startNormalized) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return {
      dateText,
      detailText: `Còn ${Math.abs(diff)} ngày sẽ bắt đầu`,
    };
  }

  const { months, days } = splitMonthsAndDays(startNormalized, today);
  if (months >= 1) {
    const parts = [];
    parts.push(`${months} tháng`);
    if (days > 0) {
      parts.push(`${days} ngày`);
    }
    return {
      dateText,
      detailText: `Đã học ${parts.join(" ")}`,
    };
  }

  return {
    dateText,
    detailText: diff === 0 ? "Bắt đầu hôm nay" : `Đã học ${diff} ngày`,
  };
}

function updatePaymentAlert() {
  const alertEl = elements.paymentAlert;
  if (!alertEl) return;

  const dueStudents = state.overdueStudents;

  if (dueStudents.length === 0) {
    alertEl.classList.add("hidden");
    alertEl.textContent = "";
    return;
  }

  const overdueDetails = dueStudents
    .map((student) => ({
      name: escapeHtml(student.name),
      days: student.overdueDays,
      duration: formatDurationFromDates(getDueDate(student), new Date()),
    }))
    .sort((a, b) => b.days - a.days);

  const listItems = overdueDetails
    .slice(0, 5)
    .map(
      (detail) =>
        `<li><strong>${detail.name}</strong> – trễ hạn ${
          detail.duration || `${detail.days} ngày`
        }</li>`
    )
    .join("");

  const more =
    overdueDetails.length > 5
      ? `<li>…và ${overdueDetails.length - 5} học viên khác</li>`
      : "";

  alertEl.innerHTML = `
     ${dueStudents.length} học viên đã quá hạn đóng học phí
    <ul>${listItems}${more}</ul>
  `;
  alertEl.classList.remove("hidden");
}

function calcOneMonthLater(dateStr) {
  try {
    const base = new Date(dateStr);
    if (Number.isNaN(base.getTime())) return null;
    const result = new Date(base);
    result.setMonth(result.getMonth() + 1);
    return result.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

function getDueDate(student) {
  if (student.expiryDate) return student.expiryDate;
  if (!student.classStartDate) return null;
  return calcOneMonthLater(student.classStartDate);
}

function getExpiringStudents() {
  const today = resetDate(new Date());
  return state.students
    .filter((student) => {
      const dueDate = getDueDate(student);
      if (!dueDate) return false;
      const expiry = resetDate(new Date(dueDate));
      if (Number.isNaN(expiry.getTime())) return false;
      const diffDays = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    })
    .map((student) => ({ ...student }));
}

function getOverdueStudents() {
  const today = resetDate(new Date());
  return state.students
    .filter((student) => {
      const dueDate = getDueDate(student);
      if (!dueDate) return false;
      const expiry = resetDate(new Date(dueDate));
      if (Number.isNaN(expiry.getTime())) return false;
      return expiry <= today;
    })
    .map((student) => {
      const dueDate = getDueDate(student);
      const expiry = resetDate(new Date(dueDate));
      const overdueDays = Math.max(
        0,
        Math.round((today - expiry) / (1000 * 60 * 60 * 24))
      );
      return {
        ...student,
        expiryDate: student.expiryDate || dueDate,
        overdueDays,
      };
    });
}

function splitMonthsAndDays(start, end) {
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  const anchor = new Date(start);
  anchor.setMonth(start.getMonth() + months);

  if (anchor > end) {
    months -= 1;
    anchor.setMonth(anchor.getMonth() - 1);
  }

  const days = Math.max(0, Math.round((end - anchor) / (1000 * 60 * 60 * 24)));

  return { months: Math.max(months, 0), days };
}

function formatDurationFromDates(startDate, endDate) {
  if (!startDate || !endDate) return "";
  const start = resetDate(new Date(startDate));
  const end = resetDate(new Date(endDate));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "";
  }
  if (end < start) {
    return "";
  }
  const { months, days } = splitMonthsAndDays(start, end);
  const parts = [];
  if (months > 0) {
    parts.push(`${months} tháng`);
  }
  if (days > 0) {
    parts.push(`${days} ngày`);
  }
  if (parts.length === 0) {
    return "0 ngày";
  }
  return parts.join(" ");
}
