(function(){
    const UIapp = document.querySelector('#app');
    const sidebar = document.querySelector('#settings-sidebar');
    const settingsIcon = document.querySelector('#settings-icon');
    const fontSelect = document.querySelector('#change-font');
    const toggleButtons = document.querySelectorAll('.toggle-btn');

    let settings = getSettings();

    function loadEvents(){
        // Apply the settings to the application
        window.addEventListener('load', applySettings);

        settingsIcon.addEventListener('click', toggleSidebar);

        fontSelect.addEventListener('change', changeFont);

        toggleButtons.forEach(function(toggleButton){
            toggleButton.addEventListener('click', toggleUI);
        })
    }
    loadEvents();

    // Show and hide the sidebar
    function toggleSidebar(){
        sidebar.classList.toggle('active');
    }

    // Retrieve the user's settings/preferences from local storage
    function getSettings(){
        const settingsLS = JSON.parse(localStorage.getItem('settings'));

        // If the user has no settings 
        if(settingsLS === null){
            // Create some default settings for the user
            const defaultSettings = {
                confirmDelete: true,
                completionSound: false,
                theme: 'Light Mode',
                hideCompleted: false,
                fontType: 'Roboto Condensed'
            }

            // Save those settings to local storage
            localStorage.setItem('settings', JSON.stringify(defaultSettings));

            return defaultSettings;
        }else{
            // If there are actual settings that the user has modified
            return settingsLS;
        }
    }

    function applySettings(){
        applyTheme();

        applyFont();

        applyCompleted();

        applyCompletionSound();

        applyDelete();
    }

    function applyDelete(){
        const confirmToggler = document.getElementById('confirm-toggler');
        const indicatorText = confirmToggler.nextElementSibling;

        if(settings.confirmDelete){
            confirmToggler.classList.add('active');

            indicatorText.textContent = 'On';
        }else{
            confirmToggler.classList.remove('active');

            indicatorText.textContent = 'Off';
        }
    }

    function applyCompletionSound(){
        const soundToggler = document.getElementById('sound-toggler');
        const indicatorText = soundToggler.nextElementSibling;

        if(settings.completionSound){
            soundToggler.classList.add('active');

            indicatorText.textContent = 'On';
        }else{
            soundToggler.classList.remove('active');

            indicatorText.textContent = 'Off';
        }
    }

    function applyCompleted(){
        const completedToggler = document.getElementById('hide-tasks');
        const indicatorText = completedToggler.nextElementSibling;
        const completedTasks = document.querySelectorAll('input[data-completed="true"]');

        if(settings.hideCompleted){
            completedToggler.classList.add('active');

            indicatorText.textContent = 'On';

            completedTasks.forEach(function(input){
                input.parentElement.classList.add('task-hidden');
            })

        }else{
            completedToggler.classList.remove('active');

            indicatorText.textContent = 'Off';

            completedTasks.forEach(function(input){
                input.parentElement.classList.remove('task-hidden');
            })
        }
    }

    function applyTheme(){
        const themeToggler = document.querySelector('.theme-btn');
        const indicatorText = themeToggler.nextElementSibling;

        if(settings.theme === 'Dark Mode'){
            // Change the theme to Dark Mode
            UIapp.classList.remove('light-mode');

            // Toggle the theme toggler appropiately
            themeToggler.classList.add('active');

            // Toggle the indicator text appropiately
            indicatorText.textContent = 'Dark Mode';
        }else{
            // Change the theme to Light Mode
            UIapp.classList.add('light-mode');

            // Toggle the theme toggler appropiately
            themeToggler.classList.remove('active');

            // Toggle the indicator text appropiately
            indicatorText.textContent = 'Light Mode';
        }
    }

    function applyFont(){
        let font;

        switch(settings.fontType){
            case 'Roboto Condensed':
                font = 'Roboto Condensed';
            break;
            case 'Raleway Regular':
                font = 'Raleway Regular';
            break;
            case 'Lato Regular':
                font = 'Lato Regular';
            break;
            case 'Montserrat Regular':
                font = 'Montserrat Regular';
            break;
            case 'Gabriola':
                font = 'Gabriola';
            break;
            case 'Indie Flower':
                font = 'Indie Flower';
            break;
            default:
                font = 'Roboto Condensed';
            break;
        }

        document.body.style.fontFamily = font;

        const options = Array.from(fontSelect.children);
        options.forEach(function(opt){
            if(opt.value === font){
                opt.setAttribute('selected', 'selected');
            }
        })
    }

    function changeFont(){
        document.body.style.fontFamily = this.value;

        settings.fontType = this.value;

        localStorage.setItem('settings', JSON.stringify(settings));
    }

    function toggleUI(){
        let toggleButton = this;

        toggleButton.classList.toggle('active');

        if(toggleButton.classList.contains('theme-btn')){
            if(!(toggleButton.classList.contains('active'))){
                updateSettings(toggleButton, 'off', 'Light Mode', 'theme', 'Light Mode');
            }else{                
                updateSettings(toggleButton, 'on', 'Dark Mode', 'theme', 'Dark Mode');
            }

            UIapp.classList.toggle('light-mode');
        }else if(toggleButton.getAttribute('data-option') === 'hide-completed'){
            const completedTasks = document.querySelectorAll('input[data-completed="true"]');

            if(!(toggleButton.classList.contains('active'))){
                updateSettings(toggleButton, 'off', 'Off', 'hideCompleted', false);

                completedTasks.forEach(function(input){
                    input.parentElement.classList.remove('task-hidden');
                })
            }else{
                updateSettings(toggleButton, 'on', 'On', 'hideCompleted', true);

                completedTasks.forEach(function(input){
                    input.parentElement.classList.add('task-hidden');
                })
            }
        }else if(toggleButton.getAttribute('data-option') === 'completion-sound'){
            if(!(toggleButton.classList.contains('active'))){
                updateSettings(toggleButton, 'off', 'Off', 'completionSound', false);
            }else{
                updateSettings(toggleButton, 'on', 'On', 'completionSound', true);
            }
        }else{
            if(!(toggleButton.classList.contains('active'))){
                updateSettings(toggleButton, 'off', 'Off', 'confirmDelete', false);
            }else{
                updateSettings(toggleButton, 'on', 'On', 'confirmDelete', true);
            }
        }
    }

    function updateSettings(element, switchMode, toggleText, optionLS, valueLS){
        element.setAttribute('data-switch', switchMode);

        element.nextElementSibling.textContent = toggleText;

        settings[optionLS] = valueLS;

        localStorage.setItem('settings', JSON.stringify(settings));
    }






    const UItaskList = document.querySelector('#task-list');
    const UItaskTitle = document.querySelector('#task-title')
    const UIaddTaskBtn = document.querySelector('#add-task-btn');
    const UImodalMessage = document.querySelector('#modal-message');
    const UIclearTasksBtn = document.querySelector('#clear-tasks-btn');

    let timerID;

    function manageEvents(){
        // Initialize the application when the DOM loads
        document.addEventListener('DOMContentLoaded', init);

        // Add an input event listener to the task input
        UItaskTitle.addEventListener('input', validateLength);

        // Add a blur event listener to the task input
        UItaskTitle.addEventListener('blur', checkTaskContent);

        // Add a click event listener to add task button
        UIaddTaskBtn.addEventListener('click', createTask);

        // Add a click event to the clear task button
        UIclearTasksBtn.addEventListener('click', clearAllTasks);

        // Add a click event to the task list and use event delegation to select the specific action
        UItaskList.addEventListener('click', manageTasks);
    }
    manageEvents();

    function init(){
        // Set the date for the application
        setDate();

        // Load tasks from local storage
        loadTasks();

        // Check Tasks Status
        checkTaskStatus();

        // Hide or show clear all tasks button based on whether there are available tasks or not
        checkTasksNo();
    }

    // Validate the length of the task title input field
    function validateLength(event){        
        // Restrict the number of characters the user can enter to 70
        if(event.target.value.length > 70){
            // Show an error to the user
            showMessage('Task cannot exceed 70 characters', 'error', UImodalMessage);
            // Disable the add task button
            UIaddTaskBtn.disabled = true;
        }else{
            // Enable the add task button
            UIaddTaskBtn.disabled = false;
        }
    }

    // Check that the task input field has actual content in it
    function checkTaskContent(event){
        if(event.target.value.length > 1){
            UIaddTaskBtn.setAttribute('data-dismiss', 'modal');
        }else{
            UIaddTaskBtn.removeAttribute('data-dismiss');
        }
    }

    // Create a new task and add it to the UI
    function createTask(){
        // Get the title of the task to be created
        const task = UItaskTitle.value;
        
        // Create an object conataining the new task details
        const taskDetails = {
            title: task,
            completedStatus: false
        }

        // Validate the task title input field to ensure that the user actually typed something
        if(taskDetails.title === '' || taskDetails === null){
            showMessage('Please enter a valid task', 'error', UImodalMessage)
        }else{
            // Add task to the UI
            addTaskToUI(taskDetails);

            // Clear the task title input field
            UItaskTitle.value = '';

            // Save the newly created task to local storage
            saveToLocalStorage(taskDetails);;
        }
    }

    // Add a newly created task or tasks from local to the tasks list
    function addTaskToUI(taskDetails){
        // Create a new div to hold everything about the task
        const taskItem = document.createElement('div');

        // Add some class names to the div
        taskItem.className = 'input-group task-item';
        
        // Create the HTML content for the task item
        taskItem.innerHTML = createTaskContent(taskDetails);

        // Append the task item to the task list
        UItaskList.appendChild(taskItem);

        // Hide or show clear all tasks button based on whether there are available tasks or not
        checkTasksNo();
    }

    // Create the HTML content for the task item
    function createTaskContent(taskDetails){
        return `
            <input type="text" class="form-control" value="${taskDetails.title}"  disabled="true" data-completed="${taskDetails.completedStatus}" />
            <div class="input-group-append" id="check-task">
                <span class="input-group-text" title="Complete task"><i class="fas fa-check"></i></span>
            </div>
            <div class="input-group-append" id="edit-task">
                <span class="input-group-text" title="Edit task"><i class="fas fa-pen"></i></span>
            </div>
            <div class="input-group-append" id="delete-task">
                <span class="input-group-text" title="Delete task"><i class="fas fa-window-close"></i></span>
            </div>
        `;
    }

    // Save the newly created task to local storage
    function saveToLocalStorage(task){
        // Get all tasks from local storage if there are any
        let tasksLS = getFromLocalStorage()

        tasksLS.push(task);

        localStorage.setItem('tasks', JSON.stringify(tasksLS));
    }

    // Get all tasks in local storage if they are any
    function getFromLocalStorage(){
        let tasks;

        if(localStorage.getItem('tasks') === null){
            tasks = [];
        }else{
            tasks = JSON.parse(localStorage.getItem('tasks'));
        }

        return tasks;
    }

    // Load all tasks in local storage when the DOM is loaded
    function loadTasks(){
        let tasks = getFromLocalStorage();

        tasks.forEach(function(task){
            addTaskToUI(task);
        })
    }

    // Check the status of the task and update its UI
    function checkTaskStatus(){
        const allTasks = document.querySelectorAll('.task-item');

        allTasks.forEach(function(task){
            const taskInput = task.querySelector('input');

            if(taskInput.getAttribute('data-completed') === 'false'){
                updateTaskStatus(task, taskInput, false, 'not-completed-cursor');
            }else{
                updateTaskStatus(task, taskInput, true, 'not-completed-cursor');
            }
        })
    }

    // Peform specific operations on each task
    function manageTasks(event){
        const task = event.target.parentElement.parentElement.parentElement;

        if(event.target.classList.contains('fa-check')){
            toggleTaskCompletion(task);
        }else if(event.target.classList.contains('fa-pen')){
            editTask(task);
        }else if(event.target.classList.contains('fa-window-close')){
            if(settings.confirmDelete){
                if(confirm('Are you sure you want to delete this task')){
                    deleteTask(task);
                }
            }else{
                deleteTask(task);
            }
        }
    }

    // Toggle tasks completion
    function toggleTaskCompletion(task){
        const taskInput = task.querySelector('input')

        // Get the completed status of the task
        const completedStatus = taskInput.getAttribute('data-completed');

        // If the task is not being edited when the task toggler is clicked
        if(!taskInput.classList.contains('edit-mode')){
            if(completedStatus === 'false'){
                if(settings.hideCompleted){
                    task.classList.add('task-hidden');
                }

                if(settings.completionSound){
                    const completeTone = new Audio('sounds/completed.wav');
                    completeTone.play();
                }

                updateTaskStatus(task, taskInput, true, 'not-completed-cursor');

            }else{
                updateTaskStatus(task, taskInput, false, 'not-completed-cursor')
            }
        }else{
            // Do absolutely nothing
        }
    }

    function updateTaskStatus(task, taskInput, status, cursorClass){
        taskInput.setAttribute('data-completed', status.toString());

        const editTaskBtn = task.querySelector('#edit-task');

        if(status === true){
            editTaskBtn.className = `input-group-append ${cursorClass}`;
            task.querySelector('#check-task').querySelector('span').classList.add('active');
        }else{
            editTaskBtn.className = 'input-group-append';
            task.querySelector('#check-task').querySelector('span').classList.remove('active');
        }

        // Update the task status in local storage
        let tasksLS = getFromLocalStorage();

        tasksLS.forEach(function(task){
            if(taskInput.value === task.title){
                task.completedStatus = status;
            }
        });

        localStorage.setItem('tasks', JSON.stringify(tasksLS));
    }

    function updateTaskName(task, taskInput, disabledStatus, focusMode){
        taskInput.disabled = disabledStatus;

        if(focusMode){
            taskInput.focus();
        }
        
        task.querySelector('#check-task').classList.toggle('not-completed-cursor');
    }

    // Edit Tasks
    function editTask(task){
        const taskInput = task.querySelector('input');
        const oldTask = taskInput.value;

       if(taskInput.getAttribute('data-completed') === 'false'){
            setTimeout(function(){
                taskInput.classList.add('edit-mode');
            }, 400);

            updateTaskName(task, taskInput, false, true);
       }else{
            console.log('Task cannot be edited');
       }

       taskInput.addEventListener('blur', function(){
            updatedTask = taskInput.value;

            setTimeout(function(){
                taskInput.classList.remove('edit-mode');
            }, 300);

            updateTaskName(task, taskInput, true, false);

            // Update the task in local storage
            let tasksLS = getFromLocalStorage();

            tasksLS.forEach(function(task){
                for(let x in task){
                    if(task[x] === oldTask){
                        task[x] = updatedTask;
                    }
                }
            })

            localStorage.setItem('tasks', JSON.stringify(tasksLS));
       })
    }

    // Delete Task
    function deleteTask(task){
        // Delete the task from the UI
        task.remove();

        // Hide or show clear all tasks button based on whether there are available tasks or not
        checkTasksNo();

        // Delete the task from local storage
        let tasksLS = getFromLocalStorage();

        // Get the title content of the task
        const taskTitle = task.querySelector('input').value;

        tasksLS.forEach(function(task, index){
            for(let prop in task){
                if(task[prop] === taskTitle){
                    tasksLS.splice(index, 1);
                }
            }
        })

        localStorage.setItem('tasks', JSON.stringify(tasksLS));
    }

    // Hide or show clear all tasks button based on whether there are available tasks or not
    function checkTasksNo(){
        if(UItaskList.firstChild){
            document.querySelector('.normal-message').textContent = '';
            UIclearTasksBtn.style.visibility = 'visible';
        }else{
            showMessage('You dont have any available task', 'success', document.querySelector('.normal-message'));
            UIclearTasksBtn.style.visibility = 'hidden';
        }
    }

    // Clear all tasks in the UI
    function clearAllTasks(){
        if(confirm('Are you sure you want to delate all tasks')){
            while(UItaskList.firstChild){
                UItaskList.firstChild.remove();
            }

            // Clear all tasks in local storage
            localStorage.removeItem('tasks');

            checkTasksNo();
        }

    }
    
    // Shows a success or error message to the user
    function showMessage(message, type, target){
        // Clear the previous timeout
        clearTimeout(timerID);

        let color;

        // Define a color for the message based on its type
        if(type === 'error'){
            color = 'text-danger';
        }else if(type === 'success'){
            color = 'text-success';
        }

        target.textContent = message;
        target.classList.add(color);

        // Clear the message from the UI after three seconds
        clearMessage(target);
    }

    // Clear message from the UI after three seconds
    function clearMessage(target){
        timerID = setTimeout(function(){
            target.textContent = '';
        }, 3000);
    }

    // Set the date for the application
    function setDate(){
        const todayDate = getFormattedDate();

        document.querySelector('#app-year').textContent = todayDate.year;
        document.querySelector('#app-month').textContent = todayDate.month;
        document.querySelector('#app-date').textContent = todayDate.date;
        document.querySelector('#app-day').textContent = todayDate.day;
    }

    // Return a meaningful date format
    function getFormattedDate(){
        // Create a new instance of the Date object
        const today = new Date();

        // Get the current year
        const year = today.getFullYear();

        // Get the current month of the year
        let month = getCurrentMonth(today);

        // Get the current date of the month
        const date = today.getDate();

        // Get the current day of the week
        let day = getCurrentDay(today);

        return {
            year: year,
            month: month,
            date: date,
            day: day
        }
    }

    // Returns the current month of the year
    function getCurrentMonth(today){
        let month;

        switch(today.getMonth()){
            case 0:
                month = 'January';
            break;

            case 1:
                month = 'February';
            break;

            case 2:
                month = 'March';
            break;

            case 3:
                month = 'April';
            break;

            case 4:
                month = 'May';
            break;

            case 5:
                month = 'June';
            break;

            case 6:
                month = 'July';
            break;

            case 7:
                month = 'August';
            break;

            case 8:
                month = 'September';
            break;

            case 9:
                month = 'October';
            break;

            case 10:
                month = 'November';
            break;

            case 11:
                month = 'December';
            break;
        }

        return month;
    }

    // Returns the current day of the week
    function getCurrentDay(today){
        let day;

        switch(today.getDay()){
            case 0:
                day = 'Sunday';
            break;
            case 1:
                day = 'Monday';
            break;
            case 2:
                day = 'Tuesday';
            break;
            case 3:
                day = 'Wednesday';
            break;
            case 4:
                day = 'Thursday';
            break;
            case 5:
                day = 'Friday';
            break;
            case 6:
                day = 'Saturday';
            break;
        }

        return day;
    }
})();