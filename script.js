document.addEventListener('DOMContentLoaded', function () {
    loadTasks();
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