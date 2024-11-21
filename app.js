let currentLog = null;

// List of users and their passwords
const users = {
  Jacinda: "Mcgregor",
  Ilyas: "Zaki",
};

// Add Entry Button Event
document.getElementById("addEntry").addEventListener("click", function () {
  const selectedUser = document.getElementById("employeeSelect").value;
  const enteredPassword = document.getElementById("passwordInput").value;

  // Password verification
  if (users[selectedUser] !== enteredPassword) {
    document.getElementById("passwordError").classList.remove("d-none");
    return; // Stop further actions if password is incorrect
  } else {
    document.getElementById("passwordError").classList.add("d-none");
  }

  // Proceed with adding the entry
  addEntry(selectedUser);
});

// Function to add an entry
function addEntry(selectedUser) {
  const startHour = document.getElementById("startTimeHour").value;
  const startMinute = document.getElementById("startTimeMinute").value;
  const endHour = document.getElementById("endTimeHour").value;
  const endMinute = document.getElementById("endTimeMinute").value;
  const breakMinutes = parseInt(document.getElementById("breakDuration").value) || 0;

  // Ensure valid hour and minute values
  if (!startHour || !startMinute || !endHour || !endMinute) {
    alert("Please select valid start and end times.");
    return;
  }

  const startTime = `${startHour.padStart(2, '0')}:${startMinute.padStart(2, '0')}:00`;
  const endTime = `${endHour.padStart(2, '0')}:${endMinute.padStart(2, '0')}:00`;

  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    alert("Invalid time format. Please check your inputs.");
    return;
  }

  const totalMinutesWorked = (end - start) / (1000 * 60) - breakMinutes;

  if (totalMinutesWorked < 0) {
    alert("End Time must be after Start Time.");
    return;
  }

  const hours = Math.floor(totalMinutesWorked / 60);
  const minutes = Math.round(totalMinutesWorked % 60);

  currentLog = {
    date: new Date().toLocaleDateString(),
    employee: selectedUser,
    startTime: `${startHour}:${startMinute}`,
    endTime: `${endHour}:${endMinute}`,
    breakMinutes: breakMinutes,
    totalHours: `${hours} hours and ${minutes} minutes`,
  };

  updateTable();
}

// Function to update the table
function updateTable() {
  const tableBody = document.getElementById("timeLogTable");
  tableBody.innerHTML = "";
  if (currentLog) {
    const row = `
      <tr>
        <td>${currentLog.date}</td>
        <td>${currentLog.employee}</td>
        <td>${currentLog.startTime}</td>
        <td>${currentLog.endTime}</td>
        <td>${currentLog.breakMinutes}</td>
        <td>${currentLog.totalHours}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteEntry()">Delete</button></td>
      </tr>
    `;
    tableBody.innerHTML = row;
  }
}

// Function to delete the entry
function deleteEntry() {
  currentLog = null;
  updateTable();
}

// Function to send data to Google Sheets
function sendToGoogleSheets() {
  const url = "https://script.google.com/macros/s/AKfycbxZkZWpCHA3bB7h4UV3NyKmn8MQEi278lkDHBoVlO2CPpcYrsfoikqMqN90xr9xjvl__Q/exec"

  console.log("Sending to URL:", url); // Debugging
  console.log("Payload:", currentLog); // Debugging

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentLog),
    mode: "cors", // Explicitly allow CORS
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response from server:", data); // Debug log
      if (data.status === "success") {
        alert("Data sent successfully!");
      } else {
        alert("Failed to send data.");
      }
    })
    .catch((error) => {
      console.error("Error sending data:", error); // Debugging
      alert("An error occurred. Please try again.");
    });
}

// Attach sendToGoogleSheets to the Send button
document.getElementById("sendButton").addEventListener("click", function () {
  if (!currentLog) {
    alert("No log entry to send.");
    return;
  }
  sendToGoogleSheets();
});
