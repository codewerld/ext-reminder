document.addEventListener("DOMContentLoaded", () => {
    const listView = document.getElementById("listView");
    const formView = document.getElementById("formView");
    const createButton = document.getElementById("createButton");
    const backButton = document.getElementById("backButton");
    const saveButton = document.getElementById("saveButton");
    const remindersList = document.getElementById("remindersList");
    const noReminders = document.getElementById("noReminders");
    const titleInput = document.getElementById("titleInput");
    const descriptionInput = document.getElementById("descriptionInput");
    const dateInput = document.getElementById("dateInput");

    let reminders = [];

    function displayReminders() {
        chrome.storage.sync.get(['reminders'], (result) => {
            reminders = result.reminders || [];
            remindersList.innerHTML = "";
            if (reminders.length === 0) {
                noReminders.style.display = "block";
            } else {
                noReminders.style.display = "none";
                reminders.forEach((reminder) => {
                    const listItem = document.createElement("li");
                    listItem.classList.add("list-item");
                    listItem.innerHTML = `
            <p>${reminder.title}</p>
            <p>${reminder.description}</p>
            <p>${reminder.date}</p>
            <button class="delete-button" data-id="${reminder.id}">×</button>
          `;
                    remindersList.appendChild(listItem);
                });
            }
        });
    }

    function saveReminders() {
        chrome.storage.sync.set({ reminders: reminders });
    }

    function showFormView() {
        listView.style.display = "none";
        formView.style.display = "block";
    }

    function showListView() {
        formView.style.display = "none";
        listView.style.display = "block";
        displayReminders();
    }

    function deleteReminder(id) {
        reminders = reminders.filter(reminder => reminder.id !== id);
        saveReminders();
        displayReminders();
    }

    createButton.addEventListener("click", showFormView);
    backButton.addEventListener("click", showListView);

    saveButton.addEventListener("click", () => {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const date = dateInput.value;

        if (title && description && date) {
            const newReminder = {
                id: Date.now(),
                title,
                description,
                date: `${getDaysLeft(date)} Days left | ${formatDate(date)}`,
            };

            reminders.push(newReminder);
            saveReminders();
            showListView();

            titleInput.value = "";
            descriptionInput.value = "";
            dateInput.value = "";
        } else {
            alert("Please fill in all fields");
        }
    });

    remindersList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-button")) {
            const id = parseInt(e.target.getAttribute("data-id"));
            deleteReminder(id);
        }
    });

    function getDaysLeft(date) {
        const today = new Date();
        const reminderDate = new Date(date);
        const timeDiff = reminderDate.getTime() - today.getTime();
        return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    }

    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    }

    displayReminders();
});