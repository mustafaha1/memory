document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    requestNotificationPermission();
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
        <div class="task-actions">
          <button onclick="editTask(this)">Edit</button>
          <button onclick="deleteTask(this)">Delete</button>
          <button onclick="shareTask(this)">Share</button>
        </div>
      `;
      if (task.image) {
        const img = document.createElement('img');
        img.src = task.image;
        li.appendChild(img);
      }
      document.getElementById('taskList').appendChild(li);
    });
    updateTaskStyles();
  }
  
  // Add task
  document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const taskText = document.getElementById('taskInput').value;
    const taskDateTime = document.getElementById('taskDateTime').value;
    const taskImage = document.getElementById('taskImage').files[0];
  
    const li = document.createElement('li');
    const dueDate = taskDateTime ? ` (Due: ${new Date(taskDateTime).toLocaleString()})` : '';
    
    li.innerHTML = `
      <input type="checkbox" onchange="toggleCompletion(this)">
      <span>${taskText}${dueDate}</span>
      <div class="task-actions">
        <button onclick="editTask(this)">Edit</button>
        <button onclick="deleteTask(this)">Delete</button>
        <button onclick="shareTask(this)">Share</button>
      </div>
    `;
  
    if (taskImage) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        li.appendChild(img);
        saveTasks();
      };
      reader.readAsDataURL(taskImage);
    }
  
    document.getElementById('taskList').appendChild(li);
    saveTasks();
    document.getElementById('taskForm').reset();
    updateTaskStyles();
  });
  
  // Delete task with confirmation
  function deleteTask(button) {
    const li = button.closest('li');
    const taskText = li.querySelector('span').textContent.split(' (Due:')[0].trim();
    
    if (confirm(`Are you sure you want to delete "${taskText}"?`)) {
      li.classList.add('deleting');
      setTimeout(() => {
        li.remove();
        saveTasks();
        updateTaskStyles();
      }, 200);
    }
  }
  
  // Edit task
  function editTask(button) {
    const li = button.closest('li');
    const taskText = li.querySelector('span').textContent.split(' (Due:')[0];
    const taskDateTime = li.querySelector('span').textContent.match(/Due: (.+)\)/)?.[1];
  
    const newText = prompt('Edit your task:', taskText);
    if (newText) {
      const newDateTime = prompt('Edit due date (YYYY-MM-DDTHH:MM):', taskDateTime);
      const dueDate = newDateTime ? ` (Due: ${new Date(newDateTime).toLocaleString()})` : '';
      li.querySelector('span').textContent = `${newText}${dueDate}`;
      saveTasks();
      updateTaskStyles();
    }
  }
  
  // Toggle completion
  function toggleCompletion(checkbox) {
    const li = checkbox.closest('li');
    const span = li.querySelector('span');
    span.classList.toggle('completed', checkbox.checked);
    saveTasks();
  }
  
  // Update task styles
  function updateTaskStyles() {
    const tasks = document.querySelectorAll('#taskList li');
    const now = new Date().getTime();
  
    tasks.forEach(li => {
      li.classList.remove('amber', 'red');
      const dueDateText = li.querySelector('span').textContent.match(/Due: (.+)\)/)?.[1];
      
      if (dueDateText) {
        const dueTime = new Date(dueDateText).getTime();
        const timeDifference = dueTime - now;
  
        if (timeDifference > 0 && timeDifference <= 10800000) {
          li.classList.add('red');
        } else if (timeDifference > 0 && timeDifference <= 86400000) {
          li.classList.add('amber');
        }
      }
    });
  
    // Sort tasks
    const taskList = document.getElementById('taskList');
    const sortedTasks = Array.from(tasks).sort((a, b) => {
      const aDue = a.querySelector('span').textContent.match(/Due: (.+)\)/)?.[1];
      const bDue = b.querySelector('span').textContent.match(/Due: (.+)\)/)?.[1];
      return aDue && bDue ? new Date(aDue) - new Date(bDue) : 0;
    });
  
    taskList.innerHTML = '';
    sortedTasks.forEach(li => taskList.appendChild(li));
  }
  
  // Other functions (share, notifications) remain the same as previous versions
  // Include them if you need the complete functionality