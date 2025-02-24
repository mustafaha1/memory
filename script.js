document.addEventListener('DOMContentLoaded', function () {
  loadTasks();
});

// Save tasks to localStorage
function saveTasks() {
  const tasks = [];
  document.querySelectorAll('#taskList li').forEach(li => {
    const taskText = li.querySelector('span').textContent;
    const taskImage = li.querySelector('img')?.src || '';
    tasks.push({ text: taskText, image: taskImage });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${task.text}</span>
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
});

// Delete task
function deleteTask(button) {
  const li = button.parentElement;
  li.remove();
  saveTasks(); // Save tasks after deletion
}

// Edit task
function editTask(button) {
  const li = button.parentElement;
  const taskText = li.querySelector('span').textContent.split(' (Due:')[0];
  const newText = prompt('Edit your task:', taskText);
  if (newText) {
    const taskDateTime = document.getElementById('taskDateTime').value;
    const dueDate = taskDateTime ? ` (Due: ${new Date(taskDateTime).toLocaleString()})` : '';
    li.querySelector('span').textContent = `${newText}${dueDate}`;
    saveTasks(); // Save tasks after editing
  }
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
    url: taskImage || '' // Optional image URL
  };

  // Check if the Web Share API is supported
  if (navigator.share) {
    navigator.share(shareData)
      .then(() => console.log('Shared successfully'))
      .catch((error) => {
        console.error('Sharing failed', error);
        alert('Sharing failed. Please try again.'); // Fallback for sharing errors
      });
  } else {
    // Fallback for browsers that don't support the Web Share API
    const shareContent = taskImage ? `${taskText}\n\nImage: ${taskImage}` : taskText;
    alert(`Sharing not supported in this browser. Here's your task:\n\n${shareContent}`);
  }
}