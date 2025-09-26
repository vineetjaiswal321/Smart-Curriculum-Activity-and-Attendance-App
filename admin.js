// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
    setupAdminNavigation();
    initializeAttendanceChart();
    initializeAttendanceDetailChart();
});

// Initialize admin dashboard
function initializeAdminDashboard() {
    // Set admin username
    document.getElementById('adminUserName').textContent = "Admin User";
    
    // Initialize charts
    initializeAttendanceChart();
    initializeAttendanceDetailChart();
    
    console.log("Admin dashboard initialized");
}

// Set up admin navigation
function setupAdminNavigation() {
    const navLinks = document.querySelectorAll('.admin-sidebar .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the section to show
            const section = this.getAttribute('data-section');
            
            // Show the corresponding section
            showAdminSection(section);
        });
    });
}

// Show admin section
function showAdminSection(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(sec => sec.style.display = 'none');
    
    // Show the requested section
    const targetSection = document.getElementById(section + 'Section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// Initialize attendance chart
function initializeAttendanceChart() {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent', 'Late'],
            datasets: [{
                data: [625, 65, 30],
                backgroundColor: [
                    'rgba(28, 200, 138, 0.9)',
                    'rgba(231, 74, 59, 0.9)',
                    'rgba(246, 194, 62, 0.9)'
                ],
                borderColor: [
                    'rgba(28, 200, 138, 1)',
                    'rgba(231, 74, 59, 1)',
                    'rgba(246, 194, 62, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
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

// Initialize attendance detail chart
function initializeAttendanceDetailChart() {
    const ctx = document.getElementById('attendanceDetailChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['CS FY A', 'CS FY B', 'CS SY A', 'CS SY B', 'EE FY', 'EE SY', 'EE TY', 'ME FY', 'ME SY', 'ME TY', 'CE FY', 'CE SY'],
            datasets: [{
                label: 'Attendance Rate (%)',
                data: [92, 88, 85, 90, 82, 79, 86, 84, 88, 91, 89, 93],
                backgroundColor: 'rgba(78, 115, 223, 0.7)',
                borderColor: 'rgba(78, 115, 223, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Attendance Rate (%)'
                    }
                }
            }
        }
    });
}

// Add new branch
function addNewBranch() {
    const name = document.getElementById('branchName').value;
    const code = document.getElementById('branchCode').value;
    const description = document.getElementById('branchDescription').value;
    
    if (!name || !code) {
        alert('Please fill all required fields');
        return;
    }
    
    // In a real application, this would make an API call
    console.log("Adding new branch:", {name, code, description});
    
    // For demo purposes, we'll just show an alert and close the modal
    alert(`Branch ${name} (${code}) added successfully!`);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addBranchModal'));
    modal.hide();
    
    // Reset the form
    document.getElementById('addBranchForm').reset();
    
    // Update the total branches count
    const totalBranches = parseInt(document.getElementById('totalBranches').textContent);
    document.getElementById('totalBranches').textContent = totalBranches + 1;
}

// Add new class
function addNewClass() {
    const name = document.getElementById('className').value;
    const branch = document.getElementById('classBranch').value;
    const year = document.getElementById('classYear').value;
    const capacity = document.getElementById('classCapacity').value;
    
    if (!name || !branch || !year || !capacity) {
        alert('Please fill all required fields');
        return;
    }
    
    // In a real application, this would make an API call
    console.log("Adding new class:", {name, branch, year, capacity});
    
    // For demo purposes, we'll just show an alert and close the modal
    alert(`Class ${name} added successfully!`);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addClassModal'));
    modal.hide();
    
    // Reset the form
    document.getElementById('addClassForm').reset();
    
    // Update the total classes count
    const totalClasses = parseInt(document.getElementById('totalClasses').textContent);
    document.getElementById('totalClasses').textContent = totalClasses + 1;
    
    // Update the total students count
    const totalStudents = parseInt(document.getElementById('totalStudents').textContent);
    document.getElementById('totalStudents').textContent = totalStudents + parseInt(capacity);
}

// Generate report
function generateReport() {
    const branch = document.getElementById('reportBranch').value;
    const classId = document.getElementById('reportClass').value;
    const date = document.getElementById('reportDate').value;
    
    // In a real application, this would make an API call
    console.log("Generating report for:", {branch, classId, date});
    
    // For demo purposes, we'll just show an alert
    alert(`Report generated for ${branch !== 'all' ? branch : 'all branches'} on ${date}`);
}

// Logout function
function logout() {
    // In a real application, this would clear sessions/tokens
    alert("Logging out...");
    // For demo purposes, we'll just reload the page
    window.location.reload();
}

// Initialize the admin dashboard with the first section visible
showAdminSection('adminDashboard');