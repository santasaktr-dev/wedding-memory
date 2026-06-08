const fs = require('node:fs');
const path = require('node:path');

async function test() {
  try {
    // Let's create a dummy small image file to upload
    const dummyImagePath = path.join(__dirname, 'dummy.jpg');
    // Simple 1x1 pixel JPEG base64 or just random bytes
    const base64Jpg = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    fs.writeFileSync(dummyImagePath, Buffer.from(base64Jpg, 'base64'));

    const formData = new FormData();
    formData.append("guest_name", "Photo Guest");
    formData.append("caption", "Beautiful couple!");
    formData.append("category", "Couple Moment");
    formData.append("table_number", "4");
    
    const fileBuffer = fs.readFileSync(dummyImagePath);
    const fileBlob = new Blob([fileBuffer], { type: 'image/jpeg' });
    formData.append("photo", fileBlob, "dummy.jpg");

    console.log("Sending photo POST to local /api/photos...");
    const res = await fetch("http://localhost:3000/api/photos", {
      method: "POST",
      body: formData
    });

    console.log("Response Status:", res.status);
    const text = await res.text();
    console.log("Response Body:", text);

    // Clean up
    fs.unlinkSync(dummyImagePath);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

test();
