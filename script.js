document.addEventListener('DOMContentLoaded', function () {
  loadTasks();
  requestNotificationPermission(); // Request notification permission
});

// Save tasks to localStorage
function saveTasks() {
  const tasks = [];
  document.querySelectorAll('#taskList li').forEach(li => {
    const taskText = li.querySelector('span').textContent;
    const taskImage = li.querySelector('img')?.src || '';
    const isCompleted = li.querySelector('input[type="checkbox"]').checked;
    tasks.push({ text: taskText, image: taskImage, completed: isCompleted });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleCompletion(this)">
      <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
      <button onclick="editTask(this)">Edit</button>
      <button onclick="deleteTask(this)">Delete</button>
      <button onclick="shareTask(this)">Share</button>
    `;
    if (task.image) {
      const img = document.createElement('img');
      img.src = task.image;
      li.appendChild(img);
    }
    document.getElementById('taskList').appendChild(li);
  });

  // Update task styles and sort the list
  updateTaskStyles();
}

// Add task
document.getElementById('taskForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Get input values
  const taskText = document.getElementById('taskInput').value;
  const taskDateTime = document.getElementById('taskDateTime').value;
  const taskImage = document.getElementById('taskImage').files[0];

  // Create a new task item
  const li = document.createElement('li');

  // Add task text
  const dueDate = taskDateTime ? ` (Due: ${new Date(taskDateTime).toLocaleString()})` : '';
  li.innerHTML = `
    <input type="checkbox" onchange="toggleCompletion(this)">
    <span>${taskText}${dueDate}</span>
    <button onclick="editTask(this)">Edit</button>
    <button onclick="deleteTask(this)">Delete</button>
    <button onclick="shareTask(this)">Share</button>
  `;

  // Add image if uploaded
  if (taskImage) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      li.appendChild(img);
      saveTasks(); // Save tasks after adding an image
    };
    reader.readAsDataURL(taskImage);
  }

  // Append task to the list
  document.getElementById('taskList').appendChild(li);

  // Save tasks to localStorage
  saveTasks();

  // Clear the form
  document.getElementById('taskForm').reset();

  // Update task styles and sort the list
  updateTaskStyles();
});

// Delete task
function deleteTask(button) {
  const li = button.parentElement;
  li.remove();
  saveTasks(); // Save tasks after deletion

  // Update task styles and sort the list
  updateTaskStyles();
}

// Edit task
function editTask(button) {
  const li = button.parentElement;
  const taskText = li.querySelector('span').textContent.split(' (Due:')[0];
  const taskDateTime = li.querySelector('span').textContent.match(/Due: (.+)\)/)?.[1];

  // Prompt for new task text
  const newText = prompt('Edit your task:', taskText);
  if (newText) {
    // Prompt for new due date
    const newDateTime = prompt('Edit the due date and time (YYYY-MM-DDTHH:MM):', taskDateTime);
    const dueDate = newDateTime ? ` (Due: ${new Date(newDateTime).toLocaleString()})` : '';
    li.querySelector('span').textContent = `${newText}${dueDate}`;
    saveTasks(); // Save tasks after editing

    // Update task styles and sort the list
    updateTaskStyles();
  }
}

// Toggle task completion
function toggleCompletion(checkbox) {
  const li = checkbox.parentElement;
  const span = li.querySelector('span');
  span.classList.toggle('completed', checkbox.checked);
  saveTasks(); // Save tasks after toggling completion
}

// Share task
function shareTask(button) {
  const li = button.parentElement;
  const taskText = li.querySelector('span').textContent;
  const taskImage = li.querySelector('img')?.src;

  // Prepare share data
  const shareData = {
    title: 'Task', // Required field
    text: taskText, // Task description
  };

  // If an image exists, include it as a base64 URL
  if (taskImage) {
    shareData.url = taskImage; // Add the image URL to the share data
  }

  // Check if the Web Share API is supported
  if (navigator.share) {
    navigator.share(shareData)
      .then(() => console.log('Shared successfully'))
      .catch((error) => {
        console.error('Sharing failed', error);
        // Fallback for sharing errors
        const shareContent = taskImage ? `${taskText}\n\nImage: ${taskImage}` : taskText;
        alert(`Sharing failed. Here's your task:\n\n${shareContent}`);
      });
  } else {
    // Fallback for browsers that don't support the Web Share API
    const shareContent = taskImage ? `${taskText}\n\nImage: ${taskImage}` : taskText;
    alert(`Sharing not supported in this browser. Here's your task:\n\n${shareContent}`);
  }
}

// Request notification permission
function requestNotificationPermission() {
  if ('Notification' in window) { // Check if Notification is supported
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }
}

// Show notification
function showNotification(taskText) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Task Due Soon', {
      body: `Task: ${taskText} is due soon!`,
      icon: 'icon.png', // Add an icon if needed
    });
  } else {
    // Fallback for browsers that don't support notifications
    alert(`Task Due Soon: ${taskText}`);
  }
}

// Check for due tasks and trigger notifications/alarms
function checkDueTasks() {
  const tasks = document.querySelectorAll('#taskList li');
  const now = new Date().getTime();

  tasks.forEach(li => {
    const dueDateText = li.querySelector('span').textContent.match(/Due: (.+)\)/)?.[1];
    if (dueDateText) {
      const dueTime = new Date(dueDateText).getTime();
      const timeDifference = dueTime - now;

      // Notify if the task is due within 1 hour
      if (timeDifference > 0 && timeDifference <= 3600000) { // 1 hour = 3600000 ms
        showNotification(li.querySelector('span').textContent);
      }

      // Set an alarm for the due time
      if (timeDifference > 0) {
        setTimeout(() => {
          showNotification(li.querySelector('span').textContent);
        }, timeDifference);
      }
    }
  });

  // Update task styles and sort the list
  updateTaskStyles();
}

// Update task background and sort the list
function updateTaskStyles() {
  const tasks = document.querySelectorAll('#taskList li');
  const now = new Date().getTime();

  tasks.forEach(li => {
    const dueDateText = li.querySelector('span').textContent.match(/Due: (.+)\)/)?.[1];
    if (dueDateText) {
      const dueTime = new Date(dueDateText).getTime();
      const timeDifference = dueTime - now;

      // Remove existing background classes
      li.classList.remove('amber', 'red');

      // Add background classes based on due time
      if (timeDifference > 0 && timeDifference <= 10800000) { // 3 hours = 10800000 ms
        li.classList.add('red'); // Red background for tasks due within 3 hours
      } else if (timeDifference > 0 && timeDifference <= 86400000) { // 24 hours = 86400000 ms
        li.classList.add('amber'); // Amber background for tasks due within 24 hours
      }
    }
  });

  // Sort tasks by due date (earliest first)
  const taskList = document.getElementById('taskList');
  const sortedTasks = Array.from(tasks).sort((a, b) => {
    const dueDateA = a.querySelector('span').textContent.match(/Due: (.+)\)/)?.[1];
    const dueDateB = b.querySelector('span').textContent.match(/Due: (.+)\)/)?.[1];
    if (dueDateA && dueDateB) {
      return new Date(dueDateA).getTime() - new Date(dueDateB).getTime();
    }
    return 0;
  });

  // Rebuild the task list
  taskList.innerHTML = '';
  sortedTasks.forEach(li => taskList.appendChild(li));
}

// Check for due tasks every minute
setInterval(checkDueTasks, 60000); // 60000 ms = 1 minute