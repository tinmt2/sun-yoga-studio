/**
 * ====================================================================
 * SUN YOGA — GOOGLE APPS SCRIPT BACKEND
 * ====================================================================
 * Hướng dẫn cài đặt vào Google Sheet (chỉ mất 1 phút):
 * 1. Mở file Google Sheet của bạn trên trình duyệt.
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) > Apps Script.
 * 3. Xóa hết code cũ trong file Code.gs, dán toàn bộ đoạn code dưới đây vào.
 * 4. Bấm "Lưu" (biểu tượng đĩa mềm hoặc Ctrl+S).
 * 5. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải > "Tùy chọn triển khai mới" (New deployment).
 * 6. Chọn loại: "Ứng dụng web" (Web App).
 *    - Mô tả: Sun Yoga API
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 7. Bấm "Triển khai", cấp quyền khi Google hỏi, và copy đường dẫn "URL ứng dụng web" (Web App URL).
 * 8. Dán URL này vào mục "Cài đặt" trên ứng dụng Sun Yoga Mobile là xong!
 * ====================================================================
 */

function setupSheetIfNeeded(ss) {
  let studentSheet = ss.getSheetByName("Students");
  if (!studentSheet) {
    studentSheet = ss.insertSheet("Students");
    studentSheet.appendRow([
      "ID",
      "Họ và tên",
      "Số điện thoại",
      "Lớp học",
      "Ngày vào lớp",
      "Ngày hết hạn",
      "Gói tập",
      "Học phí đã thu",
      "Ghi chú",
      "Thời gian tạo"
    ]);
    studentSheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#F2F2F7");
  }

  let settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
    settingsSheet.appendRow(["Key", "Value"]);
    settingsSheet.appendRow(["packages", JSON.stringify([
      { name: "Gói 1 Tháng", fee: 800000, durationMonths: 1 },
      { name: "Gói 3 Tháng", fee: 2200000, durationMonths: 3 },
      { name: "Gói 6 Tháng", fee: 4000000, durationMonths: 6 }
    ])]);
    settingsSheet.appendRow(["classes", JSON.stringify([
      { name: "Lớp Sáng (06:00 - 07:15)" },
      { name: "Lớp Trưa (11:45 - 12:45)" },
      { name: "Lớp Chiều (17:30 - 18:45)" }
    ])]);
    settingsSheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#F2F2F7");
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheetIfNeeded(ss);

  const studentSheet = ss.getSheetByName("Students");
  const data = studentSheet.getDataRange().getValues();
  const students = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0] && !row[1]) continue;
    students.push({
      id: String(row[0] || Date.now() + i),
      name: String(row[1] || ""),
      phone: String(row[2] || ""),
      className: String(row[3] || ""),
      classStartDate: formatDate(row[4]),
      expiryDate: formatDate(row[5]),
      package: String(row[6] || ""),
      feePaid: Number(row[7] || 0),
      notes: String(row[8] || ""),
      createdAt: formatDate(row[9])
    });
  }

  const settingsSheet = ss.getSheetByName("Settings");
  const settingsData = settingsSheet.getDataRange().getValues();
  const settings = { packages: [], classes: [] };

  for (let i = 1; i < settingsData.length; i++) {
    const key = settingsData[i][0];
    const val = settingsData[i][1];
    try {
      if (key === "packages") settings.packages = JSON.parse(val);
      if (key === "classes") settings.classes = JSON.parse(val);
    } catch (err) {}
  }

  const response = {
    success: true,
    timestamp: new Date().toISOString(),
    students: students,
    settings: settings
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetIfNeeded(ss);
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    const studentSheet = ss.getSheetByName("Students");

    if (action === "saveStudent") {
      const student = postData.student;
      const data = studentSheet.getDataRange().getValues();
      let foundIndex = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(student.id)) {
          foundIndex = i + 1; // 1-based index in Google Sheets
          break;
        }
      }

      const rowValues = [
        student.id || Date.now().toString(),
        student.name || "",
        student.phone || "",
        student.className || "",
        student.classStartDate || "",
        student.expiryDate || "",
        student.package || "",
        student.feePaid || 0,
        student.notes || "",
        student.createdAt || new Date().toISOString()
      ];

      if (foundIndex > 0) {
        studentSheet.getRange(foundIndex, 1, 1, 10).setValues([rowValues]);
      } else {
        studentSheet.appendRow(rowValues);
      }

      return makeJsonResponse({ success: true, message: "Đã lưu học viên thành công", student });
    }

    if (action === "deleteStudent") {
      const id = String(postData.id);
      const data = studentSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === id) {
          studentSheet.deleteRow(i + 1);
          return makeJsonResponse({ success: true, message: "Đã xóa học viên" });
        }
      }
      return makeJsonResponse({ success: false, message: "Không tìm thấy học viên" });
    }

    if (action === "syncAll") {
      // Ghi đè toàn bộ danh sách
      const allStudents = postData.students || [];
      const numRows = studentSheet.getLastRow();
      if (numRows > 1) {
        studentSheet.deleteRows(2, numRows - 1);
      }
      for (let s of allStudents) {
        studentSheet.appendRow([
          s.id || Date.now().toString(),
          s.name || "",
          s.phone || "",
          s.className || "",
          s.classStartDate || "",
          s.expiryDate || "",
          s.package || "",
          s.feePaid || 0,
          s.notes || "",
          s.createdAt || new Date().toISOString()
        ]);
      }
      return makeJsonResponse({ success: true, message: "Đồng bộ thành công" });
    }

    return makeJsonResponse({ success: false, message: "Hành động không hợp lệ" });
  } catch (error) {
    return makeJsonResponse({ success: false, error: error.toString() });
  }
}

function formatDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(val);
}

function makeJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
