// Current user role
let currentRole = '';

// Sample data
const sampleTimetable = [
    { day: 'Monday', slots: [
        { time: '9:00-10:00', subject: 'CS101', type: 'class', room: 'Room 301' },
        { time: '10:00-11:00', subject: 'MATH202', type: 'class', room: 'Room 205' },
        { time: '11:00-12:00', subject: 'Free Time', type: 'free', room: '' },
        { time: '12:00-1:00', subject: 'PHYS103', type: 'class', room: 'Lab 102' }
    ]},
    { day: 'Tuesday', slots: [
        { time: '9:00-10:00', subject: 'ENG151', type: 'class', room: 'Room 110' },
        { time: '10:00-11:00', subject: 'CS101', type: 'class', room: 'Room 301' },
        { time: '11:00-12:00', subject: 'MATH202', type: 'class', room: 'Room 205' },
        { time: '12:00-1:00', subject: 'Free Time', type: 'free', room: '' }
    ]}
];

const sampleActivities = [
    { id: 1, title: 'Complete Python Assignment', type: 'assignment', subject: 'CS101', duration: '45 min', priority: 'high' },
    { id: 2, title: 'Solve LeetCode Array Problems', type: 'leetcode', subject: 'CS101', duration: '30 min', priority: 'medium' },
    { id: 3, title: 'Study for Physics Quiz', type: 'study', subject: 'PHYS103', duration: '60 min', priority: 'high' },
    { id: 4, title: 'Read Chapter 5 of Calculus', type: 'reading', subject: 'MATH202', duration: '40 min', priority: 'medium' }
];

const attendanceData = [
    { date: '2023-10-01', course: 'CS101', status: 'Present', time: '9:05 AM' },
    { date: '2023-10-01', course: 'MATH202', status: 'Present', time: '10:10 AM' },
    { date: '2023-10-01', course: 'PHYS103', status: 'Late', time: '12:15 PM' },
    { date: '2023-09-28', course: 'ENG151', status: 'Present', time: '9:02 AM' },
    { date: '2023-09-28', course: 'CS101', status: 'Absent', time: '--' }
];

// Face Recognition Elements
const faceVideo = document.getElementById('faceVideo');
const faceCanvas = document.getElementById('faceCanvas');
const startCameraBtn = document.getElementById('startCamera');
const captureFaceBtn = document.getElementById('captureFace');
const faceFeedback = document.getElementById('faceFeedback');
const locationStatus = document.getElementById('locationStatus');

// Check for browser support
const isWebRTCSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
const isGeolocationSupported = !!navigator.geolocation;

// Login function
function login(role) {
    currentRole = role;
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('currentRole').textContent = capitalizeFirstLetter(role);
    
    // Set user name based on role
    const names = {
        student: 'Akhilesh',
        teacher: 'VR Mishra',
        admin: 'Admin User'
    };
    document.getElementById('currentUserName').textContent = names[role];
    
    // Show/hide elements based on role
    document.querySelectorAll('.teacher-only, .admin-only').forEach(el => {
        el.style.display = 'none';
    });
    
    if (role === 'teacher') {
        window.location.href = "TeacherDashBoard/teachers.html";
        return; // Exit early to prevent further execution
    }

    if (role === 'teacher' || role === 'admin') {
        document.querySelectorAll('.teacher-only').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    if (role === 'admin') {
        window.location.href = "admin.html";
        return; // Exit early to prevent further execution
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    // Initialize dashboard
    initializeDashboard();
    
    // Initialize face recognition if student
    if (role === 'student') {
        initializeFaceRecognition();
    }
}

// Logout function
function logout() {
    currentRole = '';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    
    // Stop camera if running
    if (faceVideo.srcObject) {
        faceVideo.srcObject.getTracks().forEach(track => track.stop());
    }
    
    // Clear any substitution alerts
    clearTimeout(substitutionAlertTimeout);
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show section
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(el => {
        el.style.display = 'none';
    });
    document.getElementById(section + 'Section').style.display = 'block';
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.nav-link[data-section="${section}"]`).classList.add('active');
    
    // If showing timetable and user is student, initialize it
    if (section === 'timetable' && currentRole === 'student') {
        initTimetable();
    }
}

// Switch to Face Recognition tab
function switchToFaceRecognition() {
    window.location.href = "FaceScan/face-recognition.html";

}

// Switch to QR Code tab
function switchToQRCode() {
    document.getElementById('qr-tab').click();
}

// Initialize dashboard
function initializeDashboard() {
    // Populate today's schedule
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todaySchedule = sampleTimetable[0]; // For demo, always show Monday
    
    let scheduleHTML = `<h6 class="mb-3">${todaySchedule.day}</h6>`;
    todaySchedule.slots.forEach(slot => {
        scheduleHTML += `
            <div class="timetable-slot ${slot.type}">
                <div class="d-flex justify-content-between">
                    <span class="fw-bold">${slot.time}</span>
                    <span class="badge ${slot.type === 'class' ? 'bg-primary' : 'bg-success'}">${slot.type === 'class' ? 'Class' : 'Free'}</span>
                </div>
                <div>${slot.subject} ${slot.room ? `- ${slot.room}` : ''}</div>
            </div>
        `;
    });
    document.getElementById('todaySchedule').innerHTML = scheduleHTML;
    
    // Populate suggested activities
    let activitiesHTML = '';
    sampleActivities.forEach(activity => {
        activitiesHTML += `
            <div class="activity-card p-3 border-start border-${getPriorityColor(activity.priority)}">
                <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${activity.title}</h6>
                    <span class="badge bg-${getPriorityColor(activity.priority)}">${activity.priority}</span>
                </div>
                <div class="text-muted small mt-1">
                    <i class="fas fa-book me-1"></i> ${activity.subject} 
                    <i class="fas fa-clock ms-2 me-1"></i> ${activity.duration}
                </div>
            </div>
        `;
    });
    document.getElementById('suggestedActivities').innerHTML = activitiesHTML;
    
    // Populate attendance history
    let attendanceHTML = '';
    attendanceData.forEach(record => {
        attendanceHTML += `
            <tr>
                <td>${record.date}</td>
                <td>${record.course}</td>
                <td><span class="badge ${getStatusBadge(record.status)}">${record.status}</span></td>
                <td>${record.time}</td>
            </tr>
        `;
    });
    document.getElementById('attendanceHistory').innerHTML = attendanceHTML;
    
    // Initialize attendance chart
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Late', 'Absent'],
            datasets: [{
                data: [75, 15, 10],
                backgroundColor: ['#1cc88a', '#f6c23e', '#e74a3b'],
                hoverBackgroundColor: ['#17a673', '#dda20a', '#be2617'],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize face recognition
function initializeFaceRecognition() {
    if (!isWebRTCSupported) {
        faceFeedback.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Your browser does not support camera access. Please use a modern browser.';
        faceFeedback.className = 'face-feedback alert alert-danger';
        startCameraBtn.disabled = true;
    }
    
    if (!isGeolocationSupported) {
        locationStatus.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Geolocation is not supported by your browser';
        locationStatus.className = 'location-status bg-danger text-white';
    }
    
    // Initialize camera
    startCameraBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user" 
                } 
            });
            
            faceVideo.srcObject = stream;
            startCameraBtn.disabled = true;
            captureFaceBtn.disabled = false;
            
            faceFeedback.innerHTML = '<i class="fas fa-check-circle me-2"></i>Camera started. Position your face in the frame.';
            faceFeedback.className = 'face-feedback alert alert-success';
            
            // Check location
            checkLocation();
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            faceFeedback.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Could not access camera. Please check permissions.';
            faceFeedback.className = 'face-feedback alert alert-danger';
        }
    });
    
    // Capture face and mark attendance
    captureFaceBtn.addEventListener('click', () => {
        // Draw current video frame to canvas
        const context = faceCanvas.getContext('2d');
        faceCanvas.width = faceVideo.videoWidth;
        faceCanvas.height = faceVideo.videoHeight;
        context.drawImage(faceVideo, 0, 0, faceCanvas.width, faceCanvas.height);
        
        // Simulate face recognition process
        faceFeedback.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing face recognition...';
        faceFeedback.className = 'face-feedback alert alert-info';
        
        // Simulate processing delay
        setTimeout(() => {
            // Check if user is in correct location (simulated)
            const isInClassroom = Math.random() > 0.3; // 70% chance of being in classroom
            
            if (isInClassroom) {
                // Simulate face recognition success (80% success rate)
                const isFaceRecognized = Math.random() > 0.2;
                
                if (isFaceRecognized) {
                    faceFeedback.innerHTML = '<i class="fas fa-check-circle me-2"></i>Attendance marked successfully! Face recognized.';
                    faceFeedback.className = 'face-feedback alert alert-success';
                    
                    // Show success alert
                    showAlert('Attendance marked successfully!', 'success');
                    
                    // Update attendance history
                    const now = new Date();
                    const newRecord = {
                        date: now.toISOString().split('T')[0],
                        course: 'CS101',
                        status: 'Present',
                        time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                    };
                    
                    // Add to attendance history table
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>${newRecord.date}</td>
                        <td>${newRecord.course}</td>
                        <td><span class="badge bg-success">${newRecord.status}</span></td>
                        <td>${newRecord.time}</td>
                    `;
                    document.getElementById('attendanceHistory').prepend(newRow);
                } else {
                    faceFeedback.innerHTML = '<i class="fas fa-times-circle me-2"></i>Face not recognized. Please try again.';
                    faceFeedback.className = 'face-feedback alert alert-danger';
                }
            } else {
                faceFeedback.innerHTML = '<i class="fas fa-times-circle me-2"></i>You are not in the classroom. Attendance not allowed.';
                faceFeedback.className = 'face-feedback alert alert-danger';
            }
        }, 2000);
    });
}

// Check user's location
function checkLocation() {
    if (!isGeolocationSupported) return;
    
    locationStatus.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Checking your location...';
    locationStatus.className = 'location-status bg-info text-white';
    
    // Simulate location check (in a real app, this would use navigator.geolocation)
    setTimeout(() => {
        // Simulate 80% chance of being in classroom
        const isInClassroom = Math.random() > 0.2;
        
        if (isInClassroom) {
            locationStatus.innerHTML = '<i class="fas fa-check-circle me-2"></i>You are in the classroom';
            locationStatus.className = 'location-status bg-success text-white';
        } else {
            locationStatus.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>You are not in the classroom';
            locationStatus.className = 'location-status bg-warning text-dark';
        }
    }, 1500);
}

// Show alert function
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.card-body').prepend(alertDiv);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Get priority color
function getPriorityColor(priority) {
    switch(priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'secondary';
    }
}

// Get status badge
function getStatusBadge(status) {
    switch(status) {
        case 'Present': return 'bg-success';
        case 'Late': return 'bg-warning';
        case 'Absent': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// Start QR scanner
function startQRScanner() {
    window.location.href="index.html";
    document.getElementById('currentClassInfo').textContent = "CS101 - Introduction to Programming (9:00-10:00 AM)";
    document.getElementById('attendanceStatus').innerHTML = `
        <div class="alert alert-success mt-3">
            <i class="fas fa-check-circle me-2"></i>Attendance marked successfully at 9:05 AM
        </div>
    `;
}

// Generate QR code
function generateQRCode() {
    const course = document.getElementById('courseSelect').value;
    const duration = document.getElementById('qrDuration').value;
    
    if (!course) {
        alert("Please select a course first.");
        return;
    }
    
    // Clear previous QR code
    document.getElementById('qrcode').innerHTML = '';
    
    // Generate QR code
    const qr = new QRCode(document.getElementById('qrcode'), {
        text: `ATTENDANCE:${course}:${Date.now()}`,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    
    document.getElementById('qrInfo').textContent = `QR for ${course} - Valid for ${duration} minutes`;
    
    // Simulate countdown
    let timeLeft = duration;
    const countdown = setInterval(() => {
        timeLeft--;
        document.getElementById('qrTimeRemaining').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            document.getElementById('qrcode').innerHTML = '';
            document.getElementById('qrInfo').textContent = 'QR code expired';
        }
    }, 60000);
}

// Global variable to track substitution alert timeout
let substitutionAlertTimeout = null;

// Initialize timetable section
function initTimetable() {
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentDate = new Date().toLocaleDateString('en-US', options);
    document.getElementById('currentDate').textContent = currentDate;
    
    // Day selector functionality
    const dayButtons = document.querySelectorAll('.day-btn');
    const timetableRows = document.querySelectorAll('.timetable tbody tr');
    
    dayButtons.forEach(button => {
        button.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            
            // Update active button
            dayButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding row in timetable
            timetableRows.forEach(row => {
                if (row.cells[0].textContent.toLowerCase() === day) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
    
    // Show Monday by default
    document.querySelector('.day-btn[data-day="monday"]').click();
    
    // Highlight current time slot
    function highlightCurrentTime() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const totalMinutes = currentHour * 60 + currentMinutes;
        
        // Define time slots (in minutes)
        const timeSlots = [
            { start: 9*60, end: 10*60 },
            { start: 10*60, end: 11*60 },
            { start: 11*60, end: 12*60 },
            { start: 12*60, end: 13*60 },
            { start: 13*60, end: 14*60 },
            { start: 14*60, end: 15*60 },
            { start: 15*60, end: 16*60 }
        ];
        
        // Find current time slot
        let currentSlotIndex = -1;
        for (let i = 0; i < timeSlots.length; i++) {
            if (totalMinutes >= timeSlots[i].start && totalMinutes < timeSlots[i].end) {
                currentSlotIndex = i;
                break;
            }
        }
        
        // Remove previous highlights
        document.querySelectorAll('.current-time').forEach(el => {
            el.classList.remove('current-time');
        });
        
        // Remove previous current time indicators
        document.querySelectorAll('.current-time-indicator').forEach(el => {
            el.remove();
        });
        
        // Add highlight to current time slot
        if (currentSlotIndex >= 0) {
            const rows = document.querySelectorAll('.timetable tbody tr');
            rows.forEach(row => {
                const cell = row.cells[currentSlotIndex + 1]; // +1 to skip day cell
                if (cell) {
                    cell.classList.add('current-time');
                    const subjectCard = cell.querySelector('.subject-card');
                    if (subjectCard) {
                        subjectCard.innerHTML += '<div class="current-time-indicator">Current Class</div>';
                    }
                }
            });
        }
    }
    
    // Initial highlight and set interval to update
    highlightCurrentTime();
    setInterval(highlightCurrentTime, 60000); // Update every minute
    
    // Simulate real-time notifications for substitutions - ONLY if we're in the timetable section
    function simulateSubstitutionAlert() {
        // Check if we're in the timetable section and user is a student
        if (document.getElementById('timetableSection').style.display !== 'block' || currentRole !== 'student') {
            return;
        }
        
        const alertContainer = document.querySelector('.alert-container');
        if (!alertContainer) return;
        
        // Create new alert
        const newAlert = document.createElement('div');
        newAlert.className = 'alert alert-warning alert-dismissible fade show';
        newAlert.innerHTML = `
            <div class="d-flex">
                <div class="me-3">
                    <i class="fas fa-bell fa-2x"></i>
                </div>
                <div>
                    <h5 class="alert-heading">New Substitution</h5>
                    <p class="mb-1">Your Computer Science class tomorrow has been substituted.</p>
                    <small>Just now</small>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to container
        alertContainer.prepend(newAlert);
    }
    
    // Clear any existing timeout
    if (substitutionAlertTimeout) {
        clearTimeout(substitutionAlertTimeout);
    }
    
    // Set new timeout only if we're in the student timetable section
    if (currentRole === 'student') {
        substitutionAlertTimeout = setTimeout(simulateSubstitutionAlert, 10000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up default dashboard data
    document.getElementById('attendancePercent').textContent = '85%';
    document.getElementById('classesToday').textContent = '4';
    document.getElementById('freeTime').textContent = '2h';
    document.getElementById('activitiesCompleted').textContent = '12';
    
    // Initialize chart
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent', 'Late'],
            datasets: [{
                data: [85, 10, 5],
                backgroundColor: ['#4e73df', '#e74a3b', '#f6c23e']
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Initialize navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
});

// Activities Section Functionality
function initActivitiesSection() {
    // Filter activities by status
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const filter = this.getAttribute('data-filter');
            filterActivities(filter);
        });
    });
    
    // Sort activities
    document.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const sortBy = this.getAttribute('data-sort');
            sortActivities(sortBy);
        });
    });
    
    // Initialize activities
    updateActivityStats();
}

function filterActivities(filter) {
    const activities = document.querySelectorAll('.activity-card');
    
    activities.forEach(activity => {
        if (filter === 'all') {
            activity.style.display = 'block';
        } else {
            // This is a simplified filter - you would need to add data attributes to your activities
            // For a real implementation, you would check the actual status of each activity
            activity.style.display = 'block';
        }
    });
}

function sortActivities(sortBy) {
    // This would implement sorting logic based on the selected criteria
    console.log('Sorting activities by:', sortBy);
}

function updateActivityStats() {
    // Update statistics based on current activities
    const totalActivities = document.querySelectorAll('.activity-card').length;
    document.getElementById('totalActivities').textContent = totalActivities;
    
    // You would calculate these values based on actual activity data
    document.getElementById('pendingActivities').textContent = '3';
    document.getElementById('completedActivities').textContent = '2';
    document.getElementById('overdueActivities').textContent = '3';
}

// Initialize activities when the section is shown
document.addEventListener('DOMContentLoaded', function() {
    const activitiesSection = document.getElementById('activitiesSection');
    
    // Initialize when activities section is shown
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (activitiesSection.style.display !== 'none') {
                    initActivitiesSection();
                }
            }
        });
    });
    
    observer.observe(activitiesSection, { attributes: true });
});


// Dummy student data for reports
const studentsData = [
    { id: 'S001', name: 'Akhilesh Kumar', course: 'CS101', attendance: 92, activities: 12, grade: 85, status: 'Good' },
    { id: 'S002', name: 'Priya Sharma', course: 'CS101', attendance: 88, activities: 10, grade: 78, status: 'Good' },
    { id: 'S003', name: 'Rahul Verma', course: 'MATH202', attendance: 65, activities: 8, grade: 72, status: 'Warning' },
    { id: 'S004', name: 'Sneha Patel', course: 'PHYS103', attendance: 95, activities: 11, grade: 88, status: 'Excellent' },
    { id: 'S005', name: 'Vikram Singh', course: 'ENG151', attendance: 72, activities: 9, grade: 68, status: 'Needs Improvement' },
    { id: 'S006', name: 'Anjali Gupta', course: 'CS101', attendance: 90, activities: 12, grade: 82, status: 'Good' },
    { id: 'S007', name: 'Mohit Agarwal', course: 'MATH202', attendance: 58, activities: 7, grade: 65, status: 'At Risk' },
    { id: 'S008', name: 'Neha Reddy', course: 'PHYS103', attendance: 96, activities: 12, grade: 91, status: 'Excellent' },
    { id: 'S009', name: 'Karan Malhotra', course: 'ENG151', attendance: 84, activities: 10, grade: 76, status: 'Good' },
    { id: 'S010', name: 'Divya Joshi', course: 'CS101', attendance: 79, activities: 9, grade: 74, status: 'Satisfactory' }
];

// Initialize reports section
function initReportsSection() {
    // Populate students table
    populateStudentsTable(studentsData);
    
    // Initialize charts
    initReportsCharts();
    
    // Set up filter handlers
    setupFilters();
    
    // Set up search functionality
    document.getElementById('searchStudents').addEventListener('input', function(e) {
        filterStudents(e.target.value);
    });
    
    // Set up attendance threshold slider
    document.getElementById('attendanceThreshold').addEventListener('input', function(e) {
        document.getElementById('thresholdValue').textContent = 
            `Show students with attendance ≥ ${e.target.value}%`;
    });
}

// Populate students table
function populateStudentsTable(students) {
    const tableBody = document.getElementById('studentsTableBody');
    tableBody.innerHTML = '';
    
    students.forEach(student => {
        const statusClass = getStatusClass(student.status);
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.course}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="progress attendance-progress flex-grow-1 me-2">
                        <div class="progress-bar bg-success" role="progressbar" 
                            style="width: ${student.attendance}%" 
                            aria-valuenow="${student.attendance}" 
                            aria-valuemin="0" 
                            aria-valuemax="100">
                        </div>
                    </div>
                    <span>${student.attendance}%</span>
                </div>
            </td>
            <td>${student.activities}/12</td>
            <td>${student.grade}%</td>
            <td><span class="badge badge-attendance ${statusClass}">${student.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-report" data-id="${student.id}">
                    <i class="fas fa-eye me-1"></i>View
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-report').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.getAttribute('data-id');
            viewStudentReport(studentId);
        });
    });
}

// Initialize reports charts
function initReportsCharts() {
    // Attendance distribution chart
    const attendanceCtx = document.getElementById('attendanceDistChart').getContext('2d');
    new Chart(attendanceCtx, {
        type: 'doughnut',
        data: {
            labels: ['Excellent (90-100%)', 'Good (75-89%)', 'Needs Improvement (60-74%)', 'At Risk (<60%)'],
            datasets: [{
                data: [35, 45, 15, 5],
                backgroundColor: ['#1cc88a', '#4e73df', '#f6c23e', '#e74a3b'],
                hoverBackgroundColor: ['#17a673', '#3a5fc8', '#dda20a', '#be2617'],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Performance by course chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'bar',
        data: {
            labels: ['CS101', 'MATH202', 'PHYS103', 'ENG151'],
            datasets: [{
                label: 'Average Grade',
                data: [82, 76, 85, 72],
                backgroundColor: '#4e73df',
                borderColor: '#4e73df',
                borderWidth: 1
            }, {
                label: 'Average Attendance',
                data: [87, 73, 89, 78],
                backgroundColor: '#1cc88a',
                borderColor: '#1cc88a',
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 100
                }
            }
        }
    });
}

// Set up filter handlers
function setupFilters() {
    // Apply filters button
    document.getElementById('applyFilters').addEventListener('click', function() {
        applyFilters();
    });
}

// Apply filters to student data
function applyFilters() {
    const courseFilter = document.getElementById('courseFilter').value;
    const attendanceThreshold = parseInt(document.getElementById('attendanceThreshold').value);
    
    let filteredStudents = studentsData;
    
    // Filter by course
    if (courseFilter !== 'all') {
        filteredStudents = filteredStudents.filter(student => student.course === courseFilter);
    }
    
    // Filter by attendance threshold
    filteredStudents = filteredStudents.filter(student => student.attendance >= attendanceThreshold);
    
    // Update summary cards
    updateSummaryCards(filteredStudents);
    
    // Repopulate table with filtered students
    populateStudentsTable(filteredStudents);
}

// Filter students based on search input
function filterStudents(searchTerm) {
    const filteredStudents = studentsData.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    populateStudentsTable(filteredStudents);
}

// Update summary cards with filtered data
function updateSummaryCards(students) {
    document.getElementById('totalStudents').textContent = students.length;
    
    // Calculate average attendance
    const avgAttendance = students.reduce((sum, student) => sum + student.attendance, 0) / students.length;
    document.getElementById('avgAttendance').textContent = `${avgAttendance.toFixed(0)}%`;
    
    // Count students with low attendance (<75%)
    const lowAttendanceCount = students.filter(student => student.attendance < 75).length;
    document.getElementById('lowAttendance').textContent = lowAttendanceCount;
    
    // Calculate average activities completed
    const avgActivities = students.reduce((sum, student) => sum + student.activities, 0) / students.length;
    document.getElementById('activitiesCompleted').textContent = `${((avgActivities / 12) * 100).toFixed(0)}%`;
}

// Get CSS class for status badge
function getStatusClass(status) {
    switch(status) {
        case 'Excellent': return 'bg-success';
        case 'Good': return 'bg-primary';
        case 'Satisfactory': return 'bg-info';
        case 'Needs Improvement': return 'bg-warning';
        case 'Warning': return 'bg-warning';
        case 'At Risk': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// View detailed student report
function viewStudentReport(studentId) {
    // In a real application, this would navigate to a detailed student report page
    // For this demo, we'll just show an alert
    const student = studentsData.find(s => s.id === studentId);
    alert(`Viewing detailed report for ${student.name} (${studentId})\n\nThis would open a detailed student report page with comprehensive analytics.`);
}

// Initialize the reports section when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initReportsSection();
});