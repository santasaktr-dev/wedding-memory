async function test() {
  try {
    const formData = new URLSearchParams();
    formData.append("guest_name", "Test Guest");
    formData.append("message", "This is a test message of sufficient length to pass validation.");
    formData.append("relationship", "Friend");
    formData.append("table_number", "12");
    formData.append("message_type", "Wedding Wish");

    console.log("Sending POST to local /api/wishes...");
    const res = await fetch("http://localhost:3000/api/wishes", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    console.log("Response Status:", res.status);
    const text = await res.text();
    console.log("Response Body:", text);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

test();
