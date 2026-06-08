const SPREADSHEET_ID = "";
const DRIVE_FOLDER_ID = "";
const SPREADSHEET_NAME = "J&S Wedding Memory Wall DB";
const DRIVE_FOLDER_NAME = "J&S Wedding Moment Uploads";
const SHARED_SECRET = "fa7a61fe740cf4e8a7897f4392d21003247f0258609a93f2";

const WISH_HEADERS = [
  "id",
  "guest_name",
  "relationship",
  "table_number",
  "message_type",
  "message",
  "status",
  "likes_count",
  "is_pinned",
  "created_at",
  "updated_at"
];

const PHOTO_HEADERS = [
  "id",
  "guest_name",
  "table_number",
  "caption",
  "category",
  "image_url",
  "thumbnail_url",
  "status",
  "likes_count",
  "created_at",
  "updated_at"
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    assertSecret(payload.secret);
    const action = payload.action;

    if (action === "createWish") return json(createWish(payload));
    if (action === "createPhoto") return json(createPhoto(payload));
    if (action === "listWishes") return json({ wishes: listRows("wishes", WISH_HEADERS, true) });
    if (action === "listPhotos") return json({ photos: listRows("photos", PHOTO_HEADERS, true) });
    if (action === "adminList") {
      return json({
        wishes: listRows("wishes", WISH_HEADERS, false),
        photos: listRows("photos", PHOTO_HEADERS, false)
      });
    }
    if (action === "moderate") return json(moderate(payload));
    if (action === "getPhotoBytes") return json(getPhotoBytes(payload));
    if (action === "likeSubmission") return json(likeSubmission(payload));

    return json({ ok: false, error: "Unknown action" }, 400);
  } catch (error) {
    return json({ ok: false, error: String(error) }, 500);
  }
}

function createWish(payload) {
  const now = new Date().toISOString();
  const id = Utilities.getUuid();
  const sheet = getSheet("wishes", WISH_HEADERS);

  sheet.appendRow([
    id,
    payload.guest_name || "",
    payload.relationship || "",
    payload.table_number || "",
    payload.message_type || "Wedding Wish",
    payload.message || "",
    "approved",
    0,
    false,
    now,
    now
  ]);

  return { ok: true, id };
}

function createPhoto(payload) {
  const now = new Date().toISOString();
  const id = Utilities.getUuid();
  const extension = extensionFromName(payload.file_name || "upload.jpg");
  const fileName = `${id}.${extension}`;
  const bytes = Utilities.base64Decode(payload.file_base64 || "");
  const blob = Utilities.newBlob(bytes, payload.file_type || "image/jpeg", fileName);
  const file = getUploadFolder().createFile(blob);

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const imageUrl = `https://lh3.googleusercontent.com/d/${file.getId()}`;
  const sheet = getSheet("photos", PHOTO_HEADERS);

  sheet.appendRow([
    id,
    payload.guest_name || "",
    payload.table_number || "",
    payload.caption || "",
    payload.category || "Couple Moment",
    imageUrl,
    "",
    "approved",
    0,
    now,
    now
  ]);

  return { ok: true, id, image_url: imageUrl };
}

function listRows(sheetName, headers, approvedOnly) {
  const sheet = getSheet(sheetName, headers);
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) return [];

  const rows = values.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    item.likes_count = Number(item.likes_count || 0);
    item.is_pinned = item.is_pinned === true || item.is_pinned === "TRUE";
    return item;
  });

  return rows
    .filter((row) => row.status !== "deleted")
    .filter((row) => !approvedOnly || row.status === "approved")
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

function moderate(payload) {
  const sheetName = payload.content_type === "photo" ? "photos" : "wishes";
  const headers = payload.content_type === "photo" ? PHOTO_HEADERS : WISH_HEADERS;
  const sheet = getSheet(sheetName, headers);
  const values = sheet.getDataRange().getValues();
  const idIndex = headers.indexOf("id");
  const statusIndex = headers.indexOf("status");
  const updatedAtIndex = headers.indexOf("updated_at");

  for (let row = 1; row < values.length; row += 1) {
    if (values[row][idIndex] === payload.id) {
      sheet.getRange(row + 1, statusIndex + 1).setValue(payload.status);
      sheet.getRange(row + 1, updatedAtIndex + 1).setValue(new Date().toISOString());
      return { ok: true };
    }
  }

  return { ok: false, error: "Not found" };
}

function getSheet(name, headers) {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function getSpreadsheet() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);

  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty("SPREADSHEET_ID");

  if (existingId) return SpreadsheetApp.openById(existingId);

  const spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
  properties.setProperty("SPREADSHEET_ID", spreadsheet.getId());
  return spreadsheet;
}

function getUploadFolder() {
  if (DRIVE_FOLDER_ID) return DriveApp.getFolderById(DRIVE_FOLDER_ID);

  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty("DRIVE_FOLDER_ID");

  if (existingId) return DriveApp.getFolderById(existingId);

  const folder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
  properties.setProperty("DRIVE_FOLDER_ID", folder.getId());
  return folder;
}

function assertSecret(secret) {
  if (SHARED_SECRET && secret !== SHARED_SECRET) {
    throw new Error("Unauthorized");
  }
}

function json(payload, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function extensionFromName(fileName) {
  const parts = String(fileName).split(".");
  return parts.length > 1 ? parts.pop() : "jpg";
}

function getPhotoBytes(payload) {
  const id = payload.id;
  if (!id) throw new Error("Missing photo ID");
  const file = DriveApp.getFileById(id);
  const blob = file.getBlob();
  const bytes = blob.getBytes();
  const base64 = Utilities.base64Encode(bytes);
  return { ok: true, file_base64: base64, file_type: blob.getContentType() };
}

function likeSubmission(payload) {
  const sheetName = payload.content_type === "photo" ? "photos" : "wishes";
  const headers = payload.content_type === "photo" ? PHOTO_HEADERS : WISH_HEADERS;
  const sheet = getSheet(sheetName, headers);
  const values = sheet.getDataRange().getValues();
  const idIndex = headers.indexOf("id");
  const likesIndex = headers.indexOf("likes_count");
  const updatedAtIndex = headers.indexOf("updated_at");

  for (let row = 1; row < values.length; row += 1) {
    if (values[row][idIndex] === payload.id) {
      const currentLikes = Number(values[row][likesIndex] || 0);
      const isUnlike = payload.unlike === true || payload.unlike === "true";
      const newLikes = Math.max(0, isUnlike ? currentLikes - 1 : currentLikes + 1);
      sheet.getRange(row + 1, likesIndex + 1).setValue(newLikes);
      sheet.getRange(row + 1, updatedAtIndex + 1).setValue(new Date().toISOString());
      return { ok: true, likes_count: newLikes };
    }
  }

  return { ok: false, error: "Not found" };
}
