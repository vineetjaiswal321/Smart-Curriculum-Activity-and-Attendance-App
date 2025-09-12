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
        window.location.href = "TeacherDashBoard/index.html";
    }

    if (role === 'teacher' || role === 'admin') {
        document.querySelectorAll('.teacher-only').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    if (role === 'admin') {
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

// Initialize navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const section = this.getAttribute('data-section');
        showSection(section);
    });
});