
const dataController = (function () {
  // Project class
  class Project {
    constructor(id, title) {
      this.id = id;
      this.title = title;
    }
  }

  // Project data
  const projects = {
    allProjects: [],
  };

  // Publicly accessible
  return {
    // Add project
    addProject: function (title) {
      // Create ID
      let ID;
      if (projects.allProjects.length > 0) {
        ID = projects.allProjects[projects.allProjects.length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create a new instance
      const newProject = new Project(ID, title);

      // Add the project to the project data
      projects.allProjects.push(newProject);

      // Return the new project
      return newProject;
    },

    // Update project title in data structure
    updateTitle: function (newTitle, ID) {
      // Find the object with matching ID
      const projectToUpdate = projects.allProjects.find(
        (project) => project.id === ID
      );

      // Update the title
      projectToUpdate.title = newTitle;
    },

    // Delete a project from data structure
    deleteData: function (ID) {
      const currentProject = projects.allProjects.map((current) => current.id);
      const index = currentProject.indexOf(ID);
      if (index !== -1) {
        projects.allProjects.splice(index, 1);
      }
    },

    // Testing
    testing: function () {
      console.log(projects);
    },
  };
})();


const UIController = (function () {
  
  let intervalID;

  
  const DOMstrings = {
    projectForm: ".project-form",
    inputValue: 'input[type="text"]',
    projectList: ".projects",
    hoursSpan: ".hours",
    minutesSpan: ".minutes",
    secondsSpan: ".seconds",
  };

  
  const {
    projectForm,
    inputValue,
    projectList,
    hoursSpan,
    minutesSpan,
    secondsSpan,
  } = DOMstrings;

  
  return {
    
    getInput: function () {
      return document.querySelector(inputValue);
    },

    
    addProjectToUI: function (obj) {
      
      const html = `
            <li id="project-${obj.id}">
                <h2>${obj.title}</h2>
                <div class="timer">
                    <p class="timer-label">Total Time Spent</p>
                    <p class="timer-text"><span class="hours">00</span>:<span class="minutes">00</span>:<span class="seconds">00</span></p>
                </div>
                <button class="btn start">Start</button>
                <button class="delete-btn"><i class="fa fa-times"></i></button>
            </li>
            `;

      
      document.querySelector(projectList).insertAdjacentHTML("beforeend", html);
    },

    
    clearField: function () {
      const input = document.querySelector(inputValue);
      input.value = "";
    },

    
    startTimer: function (event) {
      const target = event.target.previousElementSibling.lastElementChild;
      const seconds = target.querySelector(secondsSpan);
      const minutes = target.querySelector(minutesSpan);
      const hours = target.querySelector(hoursSpan);

      let sec = 0;
      intervalID = setInterval(function () {
        sec++;
        seconds.textContent = `0${sec % 60}`.substr(-2);
        minutes.textContent = `0${parseInt(sec / 60) % 60}`.substr(-2);
        hours.textContent = `0${parseInt(sec / 3600)}`.substr(-2);
      }, 1000);

      
      target.setAttribute("timer-id", intervalID);
    },

    
    stopTimer: function (event) {
      const target = event.target.previousElementSibling.lastElementChild;
      clearInterval(target.getAttribute("timer-id"));
    },

   
    edit: function (event) {
      const input = document.createElement("input");
      const title = event.target;
      const parent = title.parentNode;
      input.value = title.textContent;
      parent.insertBefore(input, title);
      parent.removeChild(title);
    },

    
    save: function (event) {
      const title = document.createElement("h2");
      const input = event.target;
      const parent = input.parentNode;
      title.textContent = input.value;
      parent.insertBefore(title, input);
      parent.removeChild(input);
      return title.textContent;
    },

    
    delete: function (projectID) {
      const projectToDelete = document.getElementById(projectID);
      projectToDelete.parentNode.removeChild(projectToDelete);
    },

   
    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();


const controller = (function (dataCtrl, UICtrl) {
  
  const setupEventListeners = function () {
   
    const DOM = UICtrl.getDOMstrings();

   
    const form = document.querySelector(DOM.projectForm);
    form.addEventListener("submit", ctrlAddProject);

    const projects = document.querySelector(DOM.projectList);

    projects.addEventListener("click", function (event) {
      const target = event.target;

      
      if (
        target.className === "btn start" ||
        target.className === "btn start stop"
      ) {
        timer(event);
      }

      
      if (target.tagName === "H2") {
        editTitle(event);
      }

     
      if (target.className === "delete-btn") {
        deleteProject(event);
      }
    });

    
    projects.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        saveTitle(event);
      }
    });
  };

  
  const ctrlAddProject = function (event) {
    
    event.preventDefault();

    
    const dirty = UICtrl.getInput().value;
    const clean = DOMPurify.sanitize(dirty);

   
    if (clean !== "") {
      
      const newProject = dataCtrl.addProject(clean);

      
      UICtrl.addProjectToUI(newProject);

     
      UICtrl.clearField();
    }
  };

 
  const timer = function (event) {
    const target = event.target;

    
    target.classList.toggle("stop");

    
    if (target.textContent === "Start") {
      target.textContent = "Stop";
      UICtrl.startTimer(event);

      
    } else if (target.textContent === "Stop") {
      target.textContent = "Start";
      UICtrl.stopTimer(event);
    }
  };

  
  const editTitle = function (event) {
    UICtrl.edit(event);
  };

  
  const saveTitle = function (event) {
    const ID = parseInt(event.target.parentNode.id.slice(8));

   
    const newTitle = UICtrl.save(event);

    
    dataCtrl.updateTitle(newTitle, ID);
  };

  
  const deleteProject = function (event) {
    const target = event.target;
    const projectID = target.parentNode.id;
    const ID = parseInt(target.parentNode.id.slice(8));

    if (projectID) {
      
      dataCtrl.deleteData(ID);

     
      UICtrl.delete(projectID);
    }
  };

  
  return {
    
    init: function () {
      console.log("Application has started");
      setupEventListeners();
    },
  };
})(dataController, UIController);


controller.init();
