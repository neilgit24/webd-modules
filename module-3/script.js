// ========== GLOBAL STATE ==========
let currentUser = null;
let currentCourse = null;
let courseData = {};
let calendarDate = new Date();
let selectedDay = new Date();

const importanceLevels = ['low', 'medium', 'high'];

// ========== DOM ELEMENTS ==========
const loginPage = document.getElementById('loginPage');
const homePage = document.getElementById('homePage');
const coursePage = document.getElementById('coursePage');

const userList = document.getElementById('userList');
const newUserNameInput = document.getElementById('newUserName');
const addUserBtn = document.getElementById('addUserBtn');

const currentUserNameSpan = document.getElementById('currentUserName');
const courseList = document.getElementById('courseList');
const newCourseNameInput = document.getElementById('newCourseName');
const addCourseBtn = document.getElementById('addCourseBtn');
const logoutBtn = document.getElementById('logoutBtn');

const courseTitle = document.getElementById('courseTitle');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const logoutBtn2 = document.getElementById('logoutBtn2');

const btnCalendar = document.getElementById('btnCalendar');
const btnChecklist = document.getElementById('btnChecklist');
const btnNotes = document.getElementById('btnNotes');
const btnAssignments = document.getElementById('btnAssignments');
const btnMisc = document.getElementById('btnMisc');

const calendarSection = document.getElementById('calendarSection');
const checklistSection = document.getElementById('checklistSection');
const notesSection = document.getElementById('notesSection');
const assignmentsSection = document.getElementById('assignmentsSection');
const miscSection = document.getElementById('miscSection');

const calendarTitle = document.getElementById('calendarTitle');
const calendarContainer = document.getElementById('calendarContainer');
const dayView = document.getElementById('dayView');
const selectedDayTitle = document.getElementById('selectedDayTitle');
const dayEventsList = document.getElementById('dayEventsList');
const newEventInput = document.getElementById('newEventInput');
const eventImportanceSelect = document.getElementById('eventImportanceSelect');
const addEventBtn = document.getElementById('addEventBtn');
const backToMonthBtn = document.getElementById('backToMonthBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const checklistList = document.getElementById('checklistList');
const newChecklistInput = document.getElementById('newChecklistInput');
const addChecklistBtn = document.getElementById('addChecklistBtn');

const notesTextarea = document.getElementById('notesTextarea');
const notesFileInput = document.getElementById('notesFileInput');
const uploadedFilesDiv = document.getElementById('uploadedFiles');

const assignmentsList = document.getElementById('assignmentsList');
const newAssignmentInput = document.getElementById('newAssignmentInput');
const assignmentFileInput = document.getElementById('assignmentFileInput');
const addAssignmentBtn = document.getElementById('addAssignmentBtn');

const miscTextarea = document.getElementById('miscTextarea');

// ========== UTILS ==========
function formatDateKey(y, m, d) {
  const mm = (m + 1).toString().padStart(2, '0');
  const dd = d.toString().padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

// ========== LOGIN ==========
let users = [];

function renderUsers() {
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    li.onclick = () => { currentUser = user; openHomePage(); };
    userList.appendChild(li);
  });
}

addUserBtn.onclick = () => {
  const val = newUserNameInput.value.trim();
  if (!val) return alert('Enter user name');
  if (users.includes(val)) return alert('User already exists');
  users.push(val);
  newUserNameInput.value = '';
  renderUsers();
};

// ========== HOME ==========
function renderCourses() {
  courseList.innerHTML = '';
  if (!courseData[currentUser]) courseData[currentUser] = {};
  Object.keys(courseData[currentUser]).forEach(courseName => {
    const li = document.createElement('li');
    li.textContent = courseName;
    li.onclick = () => { currentCourse = courseName; openCoursePage(); };
    courseList.appendChild(li);
  });
}

addCourseBtn.onclick = () => {
  const val = newCourseNameInput.value.trim();
  if (!val) return alert('Enter course name');
  if (!courseData[currentUser]) courseData[currentUser] = {};
  if (courseData[currentUser][val]) return alert('Course already exists');
  courseData[currentUser][val] = {
    calendarEvents: {},
    checklist: [],
    notes: '',
    files: [],
    assignments: [],
    misc: ''
  };
  newCourseNameInput.value = '';
  renderCourses();
};

logoutBtn.onclick = logout;
logoutBtn2.onclick = logout;

function logout() {
  currentUser = null; currentCourse = null;
  calendarDate = new Date(); selectedDay = new Date();
  showPage('loginPage');
  renderUsers();
}

// ========== NAVIGATION ==========
function showPage(pageId) {
  [loginPage, homePage, coursePage].forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

function openHomePage() {
  currentUserNameSpan.textContent = currentUser;
  renderCourses();
  showPage('homePage');
}

function openCoursePage() {
  courseTitle.textContent = currentCourse;
  showPage('coursePage');
  showTab('calendar');
  calendarDate = new Date();
  selectedDay = new Date();
  renderCalendarMonthView();
  renderChecklist();
  renderNotes();
  renderAssignments();
  renderMisc();
}

backToHomeBtn.onclick = () => { currentCourse = null; showPage('homePage'); };

// ========== TAB SWITCH ==========
function showTab(tab) {
  [calendarSection, checklistSection, notesSection, assignmentsSection, miscSection].forEach(s => s.classList.add('hidden'));
  [btnCalendar, btnChecklist, btnNotes, btnAssignments, btnMisc].forEach(b => b.disabled = false);

  if (tab === 'calendar') { calendarSection.classList.remove('hidden'); btnCalendar.disabled = true; }
  if (tab === 'checklist') { checklistSection.classList.remove('hidden'); btnChecklist.disabled = true; }
  if (tab === 'notes') { notesSection.classList.remove('hidden'); btnNotes.disabled = true; }
  if (tab === 'assignments') { assignmentsSection.classList.remove('hidden'); btnAssignments.disabled = true; }
  if (tab === 'misc') { miscSection.classList.remove('hidden'); btnMisc.disabled = true; }
}

btnCalendar.onclick = () => showTab('calendar');
btnChecklist.onclick = () => showTab('checklist');
btnNotes.onclick = () => showTab('notes');
btnAssignments.onclick = () => showTab('assignments');
btnMisc.onclick = () => showTab('misc');

// ========== CALENDAR ==========
function renderCalendarMonthView() {
  dayView.classList.add('hidden');
  calendarContainer.classList.remove('hidden');
  calendarTitle.textContent = calendarDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDayWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(day => {
    const th = document.createElement('th'); th.textContent = day;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  let dayCount = 1;

  for (let row = 0; row < 6; row++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < 7; col++) {
      const td = document.createElement('td');
      if ((row === 0 && col < firstDayWeekday) || dayCount > daysInMonth) {
        td.classList.add('disabled');
        td.textContent = '';
      } else {
        td.textContent = dayCount;
        const dateKey = formatDateKey(year, month, dayCount);
        const events = getCourseData().calendarEvents[dateKey] || [];
        if (events.length) {
          td.classList.add('has-event');
          let maxImp = 'low';
          events.forEach(ev => {
            if (importanceLevels.indexOf(ev.importance) > importanceLevels.indexOf(maxImp)) maxImp = ev.importance;
          });
          const strip = document.createElement('div');
          strip.classList.add('importance-strip', `importance-${maxImp}`);
          td.appendChild(strip);
        }
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && dayCount === today.getDate()) {
          td.classList.add('today');
        }
        const thisDay = dayCount; // capture for closure
        td.onclick = () => {
          selectedDay = new Date(year, month, thisDay);
          renderCalendarDayView();
        };
        dayCount++;
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  calendarContainer.innerHTML = '';
  calendarContainer.appendChild(table);
}

prevBtn.onclick = () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1); renderCalendarMonthView(); };
nextBtn.onclick = () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1); renderCalendarMonthView(); };

function renderCalendarDayView() {
  calendarContainer.classList.add('hidden');
  dayView.classList.remove('hidden');
  calendarTitle.textContent = selectedDay.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
  selectedDayTitle.textContent = selectedDay.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const dateKey = formatDateKey(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate());
  const events = getCourseData().calendarEvents[dateKey] || [];
  dayEventsList.innerHTML = '';

  events.forEach((ev, i) => {
    const li = document.createElement('li');
    li.textContent = ev.text;
    li.classList.add(`importance-${ev.importance}`);
    const strip = document.createElement('div');
    strip.classList.add('importance-strip', `importance-${ev.importance}`);
    li.prepend(strip);

    const delBtn = document.createElement('span');
    delBtn.textContent = '×';
    delBtn.title = 'Delete event';
    delBtn.classList.add('delete-event');
    delBtn.onclick = e => {
      e.stopPropagation();
      events.splice(i, 1);
      saveCourseData();
      renderCalendarDayView();
    };
    li.appendChild(delBtn);
    dayEventsList.appendChild(li);
  });

  newEventInput.value = '';
}

addEventBtn.onclick = () => {
  const text = newEventInput.value.trim();
  const importance = eventImportanceSelect.value;
  if (!text) return alert('Type an event description');

  const dateKey = formatDateKey(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate());
  if (!getCourseData().calendarEvents[dateKey]) getCourseData().calendarEvents[dateKey] = [];
  getCourseData().calendarEvents[dateKey].push({ text, importance });
  saveCourseData();
  renderCalendarDayView();
};

backToMonthBtn.onclick = () => renderCalendarMonthView();

// ========== CHECKLIST ==========
function renderChecklist() {
  checklistList.innerHTML = '';
  (getCourseData().checklist || []).forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = item.text;
    li.classList.add(item.complete ? 'complete' : 'incomplete');
    li.onclick = () => {
      item.complete = !item.complete;
      saveCourseData();
      renderChecklist();
    };
    checklistList.appendChild(li);
  });
}

addChecklistBtn.onclick = () => {
  const val = newChecklistInput.value.trim();
  if (!val) return alert('Type checklist item');
  getCourseData().checklist.push({ text: val, complete: false });
  newChecklistInput.value = '';
  saveCourseData();
  renderChecklist();
};

// ========== NOTES ==========
function renderNotes() {
  notesTextarea.value = getCourseData().notes || '';
  renderUploadedFiles();
}

notesTextarea.oninput = () => {
  getCourseData().notes = notesTextarea.value;
  saveCourseData();
};

notesFileInput.onchange = e => {
  Array.from(e.target.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      getCourseData().files.push({ name: file.name, content: reader.result });
      saveCourseData();
      renderUploadedFiles();
    };
    reader.readAsDataURL(file);
  });
  notesFileInput.value = '';
};

function renderUploadedFiles() {
  uploadedFilesDiv.innerHTML = '';
  (getCourseData().files || []).forEach(file => {
    const div = document.createElement('div');
    div.textContent = file.name;
    uploadedFilesDiv.appendChild(div);
  });
}

// ========== ASSIGNMENTS ==========
function renderAssignments() {
  assignmentsList.innerHTML = '';
  (getCourseData().assignments || []).forEach((ass, i) => {
    const li = document.createElement('li');
    li.textContent = ass.text;
    li.classList.add(ass.complete ? 'complete' : 'incomplete');
    li.onclick = () => {
      ass.complete = !ass.complete;
      saveCourseData();
      renderAssignments();
    };

    if (ass.files && ass.files.length) {
      const fileContainer = document.createElement('div');
      fileContainer.classList.add('assignment-files');
      ass.files.forEach(file => {
        const link = document.createElement('a');
        link.href = file.content;
        link.download = file.name;
        link.textContent = `📎 ${file.name}`;
        fileContainer.appendChild(link);
      });
      li.appendChild(fileContainer);
    }

    assignmentsList.appendChild(li);
  });
}

addAssignmentBtn.onclick = () => {
  const val = newAssignmentInput.value.trim();
  const files = Array.from(assignmentFileInput.files);
  if (!val) return alert('Type assignment');

  const assignment = { text: val, complete: false, files: [] };

  if (files.length) {
    Promise.all(files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, content: reader.result });
      reader.readAsDataURL(file);
    }))).then(results => {
      assignment.files = results;
      getCourseData().assignments.push(assignment);
      newAssignmentInput.value = '';
      assignmentFileInput.value = '';
      saveCourseData();
      renderAssignments();
    });
  } else {
    getCourseData().assignments.push(assignment);
    newAssignmentInput.value = '';
    saveCourseData();
    renderAssignments();
  }
};

// ========== MISC ==========
function renderMisc() {
  miscTextarea.value = getCourseData().misc || '';
}

miscTextarea.oninput = () => {
  getCourseData().misc = miscTextarea.value;
  saveCourseData();
};

// ========== DATA HELPERS ==========
function getCourseData() {
  if (!courseData[currentUser]) courseData[currentUser] = {};
  if (!courseData[currentUser][currentCourse]) {
    courseData[currentUser][currentCourse] = {
      calendarEvents: {},
      checklist: [],
      notes: '',
      files: [],
      assignments: [],
      misc: ''
    };
  }
  return courseData[currentUser][currentCourse];
}

function saveCourseData() {
  // In-memory persistence only
}

// ========== INIT ==========
showPage('loginPage');
renderUsers();
