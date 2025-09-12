// Initialize charts
document.addEventListener('DOMContentLoaded', function() {
    // Attendance Chart
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['CS101', 'CS202', 'CS305', 'CS401', 'MATH202', 'PHYS103'],
            datasets: [{
                label: 'Attendance Percentage',
                data: [92, 85, 78, 95, 88, 82],
                backgroundColor: [
                    '#4e73df',
                    '#1cc88a',
                    '#36b9cc',
                    '#f6c23e',
                    '#e74a3b',
                    '#6f42c1'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
});