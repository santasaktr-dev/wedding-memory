const SPREADSHEET_ID = "";
const DRIVE_FOLDER_ID = "";
const SPREADSHEET_NAME = "J&S Wedding Memory Wall DB";
const DRIVE_FOLDER_NAME = "J&S Wedding Moment Uploads";
const SHARED_SECRET_PROPERTY = "SHARED_SECRET";
const DEFAULT_STORE_ENV = "production";

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
  "is_pinned",
  "created_at",
  "updated_at"
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    assertSecret(payload.secret);
    const action = payload.action;
    const storeEnv = normalizeStoreEnv(payload.store_env);

    if (action === "createWish") return json(createWish(payload, storeEnv));
    if (action === "createPhoto") return json(createPhoto(payload, storeEnv));
    if (action === "listWishes") return json({ wishes: listRows("wishes", WISH_HEADERS, true, storeEnv) });
    if (action === "listPhotos") return json({ photos: listRows("photos", PHOTO_HEADERS, true, storeEnv) });
    if (action === "adminList") {
      return json({
        wishes: listRows("wishes", WISH_HEADERS, false, storeEnv),
        photos: listRows("photos", PHOTO_HEADERS, false, storeEnv)
      });
    }
    if (action === "moderate") return json(moderate(payload, storeEnv));
    if (action === "pinSubmission") return json(pinSubmission(payload, storeEnv));
    if (action === "getPhotoBytes") return json(getPhotoBytes(payload));
    if (action === "likeSubmission") return json(likeSubmission(payload, storeEnv));

    return json({ ok: false, error: "Unknown action" }, 400);
  } catch (error) {
    return json({ ok: false, error: String(error) }, 500);
  }
}

function createWish(payload, storeEnv) {
  const now = new Date().toISOString();
  const id = Utilities.getUuid();
  const sheet = getSheet("wishes", WISH_HEADERS, storeEnv);

  sheet.appendRow([
    id,
    payload.guest_name || "",
    payload.relationship || "",
    payload.table_number || "",
    payload.message_type || "Wedding Wish",
    payload.message || "",
    validStatus(payload.status),
    0,
    false,
    now,
    now
  ]);

  return { ok: true, id };
}

function createPhoto(payload, storeEnv) {
  const now = new Date().toISOString();
  const id = Utilities.getUuid();
  const extension = extensionFromName(payload.file_name || "upload.jpg");
  const fileName = `${id}.${extension}`;
  const bytes = Utilities.base64Decode(payload.file_base64 || "");
  const blob = Utilities.newBlob(bytes, payload.file_type || "image/jpeg", fileName);
  const file = getUploadFolder(storeEnv).createFile(blob);

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const imageUrl = `https://lh3.googleusercontent.com/d/${file.getId()}`;
  const sheet = getSheet("photos", PHOTO_HEADERS, storeEnv);

  sheet.appendRow([
    id,
    payload.guest_name || "",
    payload.table_number || "",
    payload.caption || "",
    payload.category || "Couple Moment",
    imageUrl,
    "",
    validStatus(payload.status),
    0,
    false,
    now,
    now
  ]);

  return { ok: true, id, image_url: imageUrl };
}

function listRows(sheetName, headers, approvedOnly, storeEnv) {
  const sheet = getSheet(sheetName, headers, storeEnv);
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

function moderate(payload, storeEnv) {
  const sheetName = payload.content_type === "photo" ? "photos" : "wishes";
  const headers = payload.content_type === "photo" ? PHOTO_HEADERS : WISH_HEADERS;
  const sheet = getSheet(sheetName, headers, storeEnv);
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

function pinSubmission(payload, storeEnv) {
  const sheetName = payload.content_type === "photo" ? "photos" : "wishes";
  const headers = payload.content_type === "photo" ? PHOTO_HEADERS : WISH_HEADERS;
  const sheet = getSheet(sheetName, headers, storeEnv);
  const values = sheet.getDataRange().getValues();
  const idIndex = headers.indexOf("id");
  const pinnedIndex = headers.indexOf("is_pinned");
  const updatedAtIndex = headers.indexOf("updated_at");

  for (let row = 1; row < values.length; row += 1) {
    if (values[row][idIndex] === payload.id) {
      sheet.getRange(row + 1, pinnedIndex + 1).setValue(payload.is_pinned === true || payload.is_pinned === "true");
      sheet.getRange(row + 1, updatedAtIndex + 1).setValue(new Date().toISOString());
      return { ok: true };
    }
  }

  return { ok: false, error: "Not found" };
}

function getSheet(name, headers, storeEnv) {
  const spreadsheet = getSpreadsheet(storeEnv);
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    ensureHeaders(sheet, headers);
  }

  return sheet;
}

function ensureHeaders(sheet, headers) {
  let currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  headers.forEach((header, index) => {
    if (currentHeaders.indexOf(header) === -1) {
      sheet.insertColumnBefore(index + 1);
      sheet.getRange(1, index + 1).setValue(header);
      currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    }
  });
}

function getSpreadsheet(storeEnv) {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);

  const properties = PropertiesService.getScriptProperties();
  const propertyName = scopedPropertyName("SPREADSHEET_ID", storeEnv);
  const existingId = properties.getProperty(propertyName);

  if (existingId) return SpreadsheetApp.openById(existingId);

  const spreadsheet = SpreadsheetApp.create(scopedResourceName(SPREADSHEET_NAME, storeEnv));
  properties.setProperty(propertyName, spreadsheet.getId());
  return spreadsheet;
}

function getUploadFolder(storeEnv) {
  if (DRIVE_FOLDER_ID) return DriveApp.getFolderById(DRIVE_FOLDER_ID);

  const properties = PropertiesService.getScriptProperties();
  const propertyName = scopedPropertyName("DRIVE_FOLDER_ID", storeEnv);
  const existingId = properties.getProperty(propertyName);

  if (existingId) return DriveApp.getFolderById(existingId);

  const folder = DriveApp.createFolder(scopedResourceName(DRIVE_FOLDER_NAME, storeEnv));
  properties.setProperty(propertyName, folder.getId());
  return folder;
}

function normalizeStoreEnv(storeEnv) {
  const value = String(storeEnv || DEFAULT_STORE_ENV).toLowerCase();
  if (value === "prod" || value === "production") return "production";
  if (value === "preview" || value === "development" || value === "dev") return "development";
  return value.replace(/[^a-z0-9_-]/g, "-") || DEFAULT_STORE_ENV;
}

function scopedPropertyName(baseName, storeEnv) {
  return storeEnv === "production" ? baseName : `${storeEnv.toUpperCase()}_${baseName}`;
}

function scopedResourceName(baseName, storeEnv) {
  return storeEnv === "production" ? baseName : `${baseName} - ${storeEnv}`;
}

function assertSecret(secret) {
  const sharedSecret = PropertiesService.getScriptProperties().getProperty(SHARED_SECRET_PROPERTY);
  if (sharedSecret && secret !== sharedSecret) {
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

function validStatus(status) {
  const value = String(status || "pending");
  if (value === "pending" || value === "approved" || value === "hidden" || value === "deleted") {
    return value;
  }
  return "pending";
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

function likeSubmission(payload, storeEnv) {
  const sheetName = payload.content_type === "photo" ? "photos" : "wishes";
  const headers = payload.content_type === "photo" ? PHOTO_HEADERS : WISH_HEADERS;
  const sheet = getSheet(sheetName, headers, storeEnv);
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
