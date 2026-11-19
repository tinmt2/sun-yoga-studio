const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  dialog,
} = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

const dataPath = path.join(app.getPath("userData"), "students.json");
const settingsPath = path.join(app.getPath("userData"), "settings.json");

// Đảm bảo file dữ liệu tồn tại
function ensureDataFile() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
  }
}

// Đảm bảo file settings tồn tại
function ensureSettingsFile() {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(
      settingsPath,
      JSON.stringify(
        {
          backgroundImage: null,
          profileAvatar: null,
          packages: [],
          classes: [],
        },
        null,
        2
      )
    );
  } else {
    // Đảm bảo packages và classes tồn tại trong settings cũ
    // Đọc trực tiếp để tránh vòng lặp với readSettings()
    try {
      const data = fs.readFileSync(settingsPath, "utf8");
      const settings = JSON.parse(data);
      if (!settings.packages) settings.packages = [];
      if (!settings.classes) settings.classes = [];
      writeSettings(settings);
    } catch (error) {
      // Nếu lỗi, tạo lại file với cấu trúc mặc định
      fs.writeFileSync(
        settingsPath,
        JSON.stringify(
          {
            backgroundImage: null,
            packages: [],
            classes: [],
          },
          null,
          2
        )
      );
    }
  }
}

// Đọc settings
function readSettings() {
  try {
    ensureSettingsFile();
    const data = fs.readFileSync(settingsPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading settings:", error);
    return { backgroundImage: null };
  }
}

// Ghi settings
function writeSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing settings:", error);
    return false;
  }
}

// Đọc dữ liệu học viên
function readStudents() {
  try {
    ensureDataFile();
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading students:", error);
    return [];
  }
}

// Ghi dữ liệu học viên
function writeStudents(students) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(students, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing students:", error);
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "default",
  });

  const indexPath = path.join(__dirname, "../renderer/index.html");
  mainWindow.loadFile(indexPath);

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  ensureDataFile();
  ensureSettingsFile();
  createWindow();

  // Kiểm tra thông báo định kỳ
  setInterval(checkExpiringStudents, 60000); // Kiểm tra mỗi phút

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle("get-students", () => {
  return readStudents();
});

ipcMain.handle("save-student", (event, student) => {
  const students = readStudents();
  if (student.id) {
    // Cập nhật học viên
    const index = students.findIndex((s) => s.id === student.id);
    if (index !== -1) {
      students[index] = student;
    }
  } else {
    // Thêm học viên mới
    student.id = Date.now().toString();
    student.createdAt = new Date().toISOString();
    students.push(student);
  }
  return writeStudents(students);
});

ipcMain.handle("delete-student", (event, id) => {
  const students = readStudents();
  const filtered = students.filter((s) => s.id !== id);
  return writeStudents(filtered);
});

ipcMain.handle("check-expiring", () => {
  return checkExpiringStudents();
});

ipcMain.handle("get-settings", () => {
  return readSettings();
});

ipcMain.handle("select-background-image", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      {
        name: "Images",
        extensions: ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
      },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const imagePath = result.filePaths[0];
    try {
      // Đọc file dưới dạng base64 để có thể hiển thị trong renderer
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString("base64");
      const ext = path.extname(imagePath).toLowerCase().slice(1);
      const mimeType =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "png"
          ? "image/png"
          : ext === "gif"
          ? "image/gif"
          : ext === "webp"
          ? "image/webp"
          : ext === "bmp"
          ? "image/bmp"
          : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${imageBase64}`;

      const settings = readSettings();
      settings.backgroundImage = imagePath;
      settings.backgroundImageData = dataUrl; // Lưu cả base64 để hiển thị
      writeSettings(settings);
      return { path: imagePath, dataUrl };
    } catch (error) {
      console.error("Error reading image file:", error);
      return null;
    }
  }
  return null;
});

ipcMain.handle("get-background-image-data", async () => {
  const settings = readSettings();
  if (settings.backgroundImage && fs.existsSync(settings.backgroundImage)) {
    try {
      // Kiểm tra xem đã có dataUrl chưa
      if (settings.backgroundImageData) {
        return settings.backgroundImageData;
      }

      // Nếu chưa có, đọc lại file
      const imageBuffer = fs.readFileSync(settings.backgroundImage);
      const imageBase64 = imageBuffer.toString("base64");
      const ext = path.extname(settings.backgroundImage).toLowerCase().slice(1);
      const mimeType =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "png"
          ? "image/png"
          : ext === "gif"
          ? "image/gif"
          : ext === "webp"
          ? "image/webp"
          : ext === "bmp"
          ? "image/bmp"
          : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${imageBase64}`;

      settings.backgroundImageData = dataUrl;
      writeSettings(settings);
      return dataUrl;
    } catch (error) {
      console.error("Error reading background image:", error);
      return null;
    }
  }
  return null;
});

ipcMain.handle("set-background-image", (event, imagePath) => {
  const settings = readSettings();
  settings.backgroundImage = imagePath;
  return writeSettings(settings);
});

ipcMain.handle("reset-background", () => {
  const settings = readSettings();
  settings.backgroundImage = null;
  settings.backgroundImageData = null;
  return writeSettings(settings);
});

ipcMain.handle("select-profile-avatar", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      {
        name: "Images",
        extensions: ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
      },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const imagePath = result.filePaths[0];
    try {
      // Đọc file dưới dạng base64 để có thể hiển thị trong renderer
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString("base64");
      const ext = path.extname(imagePath).toLowerCase().slice(1);
      const mimeType =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "png"
          ? "image/png"
          : ext === "gif"
          ? "image/gif"
          : ext === "webp"
          ? "image/webp"
          : ext === "bmp"
          ? "image/bmp"
          : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${imageBase64}`;

      const settings = readSettings();
      settings.profileAvatar = imagePath;
      settings.profileAvatarData = dataUrl; // Lưu cả base64 để hiển thị
      writeSettings(settings);
      return { path: imagePath, dataUrl };
    } catch (error) {
      console.error("Error reading profile avatar file:", error);
      return null;
    }
  }
  return null;
});

ipcMain.handle("get-profile-avatar-data", async () => {
  const settings = readSettings();
  if (settings.profileAvatar && fs.existsSync(settings.profileAvatar)) {
    try {
      // Kiểm tra xem đã có dataUrl chưa
      if (settings.profileAvatarData) {
        return settings.profileAvatarData;
      }

      // Nếu chưa có, đọc lại file
      const imageBuffer = fs.readFileSync(settings.profileAvatar);
      const imageBase64 = imageBuffer.toString("base64");
      const ext = path.extname(settings.profileAvatar).toLowerCase().slice(1);
      const mimeType =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "png"
          ? "image/png"
          : ext === "gif"
          ? "image/gif"
          : ext === "webp"
          ? "image/webp"
          : ext === "bmp"
          ? "image/bmp"
          : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${imageBase64}`;

      settings.profileAvatarData = dataUrl;
      writeSettings(settings);
      return dataUrl;
    } catch (error) {
      console.error("Error reading profile avatar:", error);
      return null;
    }
  }
  return null;
});

ipcMain.handle("reset-profile-avatar", () => {
  const settings = readSettings();
  settings.profileAvatar = null;
  settings.profileAvatarData = null;
  return writeSettings(settings);
});

ipcMain.handle("save-settings", (event, newSettings) => {
  const settings = readSettings();
  Object.assign(settings, newSettings);
  return writeSettings(settings);
});

// Kiểm tra học viên sắp hết hạn
function checkExpiringStudents() {
  const students = readStudents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiring = students.filter((student) => {
    if (!student.expiryDate) return false;
    const expiry = new Date(student.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0; // Trong vòng 7 ngày
  });

  if (expiring.length > 0 && mainWindow) {
    const names = expiring.map((s) => s.name).join(", ");
    new Notification({
      title: "Thông báo học phí sắp hết hạn",
      body: `${expiring.length} học viên sắp hết hạn: ${names}`,
      urgency: "normal",
    }).show();
  }

  return expiring;
}
