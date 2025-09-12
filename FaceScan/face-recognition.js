// Face Recognition Elements
const faceVideo = document.getElementById('faceVideo');
const faceCanvas = document.getElementById('faceCanvas');
const startCameraBtn = document.getElementById('startCamera');
const captureFaceBtn = document.getElementById('captureFace');
const faceFeedback = document.getElementById('faceFeedback');
const locationStatus = document.getElementById('locationStatus');
const enrollmentStatus = document.getElementById('enrollmentStatus');
const attendanceHistory = document.getElementById('attendanceHistory');

// Enrollment Elements
const enrollmentVideo = document.getElementById('enrollmentVideo');
const enrollmentCanvas = document.getElementById('enrollmentCanvas');
const startEnrollmentCameraBtn = document.getElementById('startEnrollmentCamera');
const captureEnrollmentBtn = document.getElementById('captureEnrollment');
const completeEnrollmentBtn = document.getElementById('completeEnrollment');
const faceSamplesContainer = document.getElementById('faceSamples');

// Location Modal Elements
const locationModal = document.getElementById('locationModal');
const locationPermissionCheckbox = document.getElementById('locationPermission');
const cancelLocationBtn = document.getElementById('cancelLocation');
const confirmLocationBtn = document.getElementById('confirmLocation');

// Real-time Location Elements
const locationDisplay = document.getElementById('locationDisplay');
const currentLatitude = document.getElementById('currentLatitude');
const currentLongitude = document.getElementById('currentLongitude');
const locationAccuracy = document.getElementById('locationAccuracy');
const locationTimestamp = document.getElementById('locationTimestamp');
const refreshLocationBtn = document.getElementById('refreshLocation');
const stopLocationBtn = document.getElementById('stopLocation');

// Check for browser support
const isWebRTCSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
const isGeolocationSupported = !!navigator.geolocation;

// Sample data
const attendanceData = [
    { date: '2023-10-01', course: 'CS101', status: 'Present', time: '9:05 AM', method: 'QR Code' },
    { date: '2023-10-01', course: 'MATH202', status: 'Present', time: '10:10 AM', method: 'QR Code' },
    { date: '2023-10-01', course: 'PHYS103', status: 'Late', time: '12:15 PM', method: 'Manual' },
    { date: '2023-09-28', course: 'ENG151', status: 'Present', time: '9:02 AM', method: 'QR Code' },
    { date: '2023-09-28', course: 'CS101', status: 'Absent', time: '--', method: '--' }
];

// Face database (simulated)
let faceDatabase = {
    'Akhilesh': {
        enrolled: false,
        samples: []
    }
};

// Classroom coordinates (simulated)
const classroomCoords = {
    latitude: 28.6129,  // Example: IIT Delhi coordinates
    longitude: 77.2295,
    accuracy: 50 // 50 meters accuracy
};

// Current user
const currentUser = 'Akhilesh';

// Location permission state
let locationPermissionGranted = false;
let locationWatchId = null;

// Initialize the page
function initPage() {
    // Check if user has enrolled face
    checkEnrollmentStatus();
    
    // Populate attendance history
    populateAttendanceHistory();
    
    // Initialize face recognition
    initializeFaceRecognition();
    
    // Initialize enrollment
    initializeEnrollment();
    
    // Initialize location modal
    initializeLocationModal();
    
    // Initialize location buttons
    initializeLocationButtons();
}

// Initialize location buttons
function initializeLocationButtons() {
    refreshLocationBtn.addEventListener('click', () => {
        checkLocation();
    });
    
    stopLocationBtn.addEventListener('click', () => {
        if (locationWatchId !== null) {
            navigator.geolocation.clearWatch(locationWatchId);
            locationWatchId = null;
            stopLocationBtn.disabled = true;
            refreshLocationBtn.disabled = false;
            locationStatus.innerHTML = '<i class="fas fa-pause me-2"></i>Location tracking stopped';
            locationStatus.className = 'location-status bg-secondary text-white';
        }
    });
}

// Initialize location permission modal
function initializeLocationModal() {
    cancelLocationBtn.addEventListener('click', () => {
        locationModal.style.display = 'none';
    });
    
    confirmLocationBtn.addEventListener('click', () => {
        if (locationPermissionCheckbox.checked) {
            locationPermissionGranted = true;
            locationModal.style.display = 'none';
            locationStatus.innerHTML = '<i class="fas fa-check-circle me-2"></i>Location access granted';
            locationStatus.className = 'location-status bg-success text-white';
            
            // Show location display
            locationDisplay.style.display = 'block';
            
            // Start location tracking
            startLocationTracking();
            
            // Now start the camera
            startFaceRecognitionCamera();
        } else {
            alert('Please enable location access to use face recognition attendance');
        }
    });
}

// Start continuous location tracking
function startLocationTracking() {
    if (!isGeolocationSupported) return;
    
    locationStatus.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Tracking your location...';
    locationStatus.className = 'location-status bg-info text-white';
    
    // Get initial position
    checkLocation();
    
    // Set up continuous tracking
    locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
            updateLocationDisplay(position);
            checkClassroomProximity(position);
        },
        (error) => {
            console.error('Error getting location:', error);
            locationStatus.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Could not determine your location';
            locationStatus.className = 'location-status bg-danger text-white';
        },
        { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 30000 
        }
    );
    
    // Enable stop button
    stopLocationBtn.disabled = false;
    refreshLocationBtn.disabled = true;
}

// Update location display with current coordinates
function updateLocationDisplay(position) {
    const userCoords = position.coords;
    currentLatitude.textContent = userCoords.latitude.toFixed(6);
    currentLongitude.textContent = userCoords.longitude.toFixed(6);
    locationAccuracy.textContent = userCoords.accuracy.toFixed(2);
    
    const now = new Date();
    locationTimestamp.textContent = now.toLocaleTimeString();
}

// Check enrollment status
function checkEnrollmentStatus() {
    const userData = faceDatabase[currentUser];
    
    if (userData && userData.enrolled && userData.samples.length > 0) {
        enrollmentStatus.innerHTML = '<i class="fas fa-check-circle me-2"></i>Your face is enrolled with ' + userData.samples.length + ' samples';
        enrollmentStatus.className = 'alert alert-success';
        startCameraBtn.disabled = false;
    } else {
        enrollmentStatus.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>You need to enroll your face before using face recognition';
        enrollmentStatus.className = 'alert alert-warning';
        startCameraBtn.disabled = true;
    }
}

// Populate attendance history
function populateAttendanceHistory() {
    let attendanceHTML = '';
    attendanceData.forEach(record => {
        attendanceHTML += `
            <tr>
                <td>${record.date}</td>
                <td>${record.course}</td>
                <td><span class="badge ${getStatusBadge(record.status)}">${record.status}</span></td>
                <td>${record.time}</td>
                <td>${record.method}</td>
            </tr>
        `;
    });
    attendanceHistory.innerHTML = attendanceHTML;
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
    startCameraBtn.addEventListener('click', () => {
        // Show location permission modal first
        if (!locationPermissionGranted) {
            locationModal.style.display = 'flex';
        } else {
            startFaceRecognitionCamera();
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
                // Check if user has enrolled face
                if (!faceDatabase[currentUser].enrolled) {
                    faceFeedback.innerHTML = '<i class="fas fa-times-circle me-2"></i>Face not enrolled. Please enroll your face first.';
                    faceFeedback.className = 'face-feedback alert alert-danger';
                    return;
                }
                
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
                        time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        method: 'Face Recognition'
                    };
                    
                    // Add to attendance data
                    attendanceData.unshift(newRecord);
                    
                    // Update UI
                    populateAttendanceHistory();
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

// Start face recognition camera
async function startFaceRecognitionCamera() {
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
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        faceFeedback.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Could not access camera. Please check permissions.';
        faceFeedback.className = 'face-feedback alert alert-danger';
    }
}

// Check user's location
function checkLocation() {
    if (!isGeolocationSupported) return;
    
    locationStatus.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Checking your location...';
    locationStatus.className = 'location-status bg-info text-white';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            updateLocationDisplay(position);
            checkClassroomProximity(position);
        },
        (error) => {
            console.error('Error getting location:', error);
            locationStatus.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Could not determine your location';
            locationStatus.className = 'location-status bg-danger text-white';
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Check if user is near the classroom
function checkClassroomProximity(position) {
    const userCoords = position.coords;
    const distance = calculateDistance(
        userCoords.latitude, 
        userCoords.longitude, 
        classroomCoords.latitude, 
        classroomCoords.longitude
    );
    
    // Check if user is within 100 meters of the classroom
    if (distance <= 100) {
        locationStatus.innerHTML = '<i class="fas fa-check-circle me-2"></i>You are in the classroom';
        locationStatus.className = 'location-status bg-success text-white';
        captureFaceBtn.disabled = !faceDatabase[currentUser].enrolled;
    } else {
        locationStatus.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>You are not in the classroom (' + Math.round(distance) + 'm away)';
        locationStatus.className = 'location-status bg-warning text-dark';
        captureFaceBtn.disabled = true;
    }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in meters
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Initialize enrollment
function initializeEnrollment() {
    startEnrollmentCameraBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user" 
                } 
            });
            
            enrollmentVideo.srcObject = stream;
            startEnrollmentCameraBtn.disabled = true;
            captureEnrollmentBtn.disabled = false;
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access camera. Please check permissions.');
        }
    });
    
    // Capture enrollment sample
    captureEnrollmentBtn.addEventListener('click', () => {
        const context = enrollmentCanvas.getContext('2d');
        enrollmentCanvas.width = enrollmentVideo.videoWidth;
        enrollmentCanvas.height = enrollmentVideo.videoHeight;
        context.drawImage(enrollmentVideo, 0, 0, enrollmentCanvas.width, enrollmentCanvas.height);
        
        // Convert canvas to data URL
        const imageData = enrollmentCanvas.toDataURL('image/png');
        
        // Add to face database
        faceDatabase[currentUser].samples.push(imageData);
        
        // Update UI
        const sampleElement = document.createElement('img');
        sampleElement.src = imageData;
        sampleElement.className = 'face-sample';
        faceSamplesContainer.appendChild(sampleElement);
        
        // Enable complete button if we have at least 3 samples
        if (faceDatabase[currentUser].samples.length >= 3) {
            completeEnrollmentBtn.disabled = false;
        }
        
        // Show message
        alert('Face sample captured! (' + faceDatabase[currentUser].samples.length + '/5)');
    });
    
    // Complete enrollment
    completeEnrollmentBtn.addEventListener('click', () => {
        faceDatabase[currentUser].enrolled = true;
        alert('Face enrollment completed with ' + faceDatabase[currentUser].samples.length + ' samples!');
        hideEnrollment();
        checkEnrollmentStatus();
    });
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

// Show enrollment section
function showEnrollment() {
    document.getElementById('attendanceSection').style.display = 'none';
    document.getElementById('enrollmentSection').style.display = 'block';
}

// Hide enrollment section
function hideEnrollment() {
    document.getElementById('enrollmentSection').style.display = 'none';
    document.getElementById('attendanceSection').style.display = 'block';
}

// Logout function
function logout() {
    alert('Logging out...');
    // In a real application, this would redirect to login page
}

// Initialize the page when loaded
window.onload = initPage;