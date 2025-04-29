let loggedInRollNumber = null;
let loggedInRole = null;

// Login
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const rollNumber = document.getElementById('loginRollNumber').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!rollNumber || !password) {
        alert('Roll number and password are required.');
        return;
    }

    fetch('http://localhost:8081/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber, password })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Login failed');
                });
            }
            return response.json();
        })
        .then(data => {
            loggedInRollNumber = rollNumber;
            loggedInRole = data.role || 'student';
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('mainContent').classList.remove('hidden');

            // Hide/Show sections based on role
            const addStudentCard = document.getElementById('addStudentCard');
            const studentListCard = document.getElementById('studentListCard');
            const markAttendanceCard = document.getElementById('markAttendanceCard');
            const viewAttendanceCard = document.getElementById('viewAttendanceCard');
            const reportCard = document.getElementById('reportCard');
            const attendanceDropdown = document.getElementById('attendanceDropdown');
            const studentAttendanceFilter = document.getElementById('studentAttendanceFilter');

            if (loggedInRole === 'student') {
                addStudentCard.classList.add('hidden');
                studentListCard.classList.add('hidden');
                markAttendanceCard.classList.add('hidden');
                reportCard.classList.add('hidden');
                viewAttendanceCard.classList.remove('hidden');
                attendanceDropdown.classList.add('hidden');
                studentAttendanceFilter.classList.remove('hidden');
                viewAttendance(loggedInRollNumber);
            } else if (loggedInRole === 'teacher') {
                addStudentCard.classList.remove('hidden');
                markAttendanceCard.classList.remove('hidden');
                studentListCard.classList.add('hidden');
                reportCard.classList.remove('hidden'); // Teachers can now view the absence report
                viewAttendanceCard.classList.remove('hidden');
                attendanceDropdown.classList.remove('hidden');
                studentAttendanceFilter.classList.add('hidden');
                const roleSelect = document.getElementById('role');
                roleSelect.innerHTML = '<option value="student">Student</option>'; // Restrict to student role
                roleSelect.disabled = true;
            } else if (loggedInRole === 'admin') {
                addStudentCard.classList.remove('hidden');
                studentListCard.classList.remove('hidden');
                markAttendanceCard.classList.remove('hidden');
                reportCard.classList.remove('hidden');
                viewAttendanceCard.classList.remove('hidden');
                attendanceDropdown.classList.remove('hidden');
                studentAttendanceFilter.classList.add('hidden');
                document.getElementById('role').disabled = false;
            }

            fetchStudents();
            populateStudentSelect();
        })
        .catch(error => {
            console.error('Error logging in:', error.message);
            alert(error.message);
        });
});

// Logout
document.getElementById('logoutButton').addEventListener('click', function () {
    loggedInRollNumber = null;
    loggedInRole = null;
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('loginForm').reset();
});

// Fetch and display users in separate lists
function fetchStudents() {
    fetch('http://localhost:8081/students')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched users:', data);
            const studentList = document.getElementById('studentsList');
            const teacherList = document.getElementById('teachersList');
            const adminList = document.getElementById('adminsList');
            if (!studentList || !teacherList || !adminList) {
                console.error('List elements not found');
                return;
            }
            studentList.innerHTML = '';
            teacherList.innerHTML = '';
            adminList.innerHTML = '';

            const students = data.filter(user => user.role === 'student');
            const teachers = data.filter(user => user.role === 'teacher');
            const admins = data.filter(user => user.role === 'admin');

            // Populate Students List
            if (students.length > 0) {
                students.forEach(user => {
                    const item = document.createElement('li');
                    const userInfo = document.createElement('span');
                    userInfo.textContent = `Name: ${user.name}, Roll Number: ${user.rollNumber}`;
                    item.appendChild(userInfo);

                    if (loggedInRole === 'admin') {
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Delete';
                        deleteButton.className = 'delete-button';
                        deleteButton.onclick = () => deleteStudent(user.rollNumber);
                        item.appendChild(deleteButton);
                    }

                    studentList.appendChild(item);
                });
            } else {
                studentList.innerHTML = '<li>No students found</li>';
            }

            // Populate Teachers List
            if (teachers.length > 0) {
                teachers.forEach(user => {
                    const item = document.createElement('li');
                    const userInfo = document.createElement('span');
                    userInfo.textContent = `Name: ${user.name}, Roll Number: ${user.rollNumber}`;
                    item.appendChild(userInfo);

                    if (loggedInRole === 'admin') {
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Delete';
                        deleteButton.className = 'delete-button';
                        deleteButton.onclick = () => deleteStudent(user.rollNumber);
                        item.appendChild(deleteButton);
                    }

                    teacherList.appendChild(item);
                });
            } else {
                teacherList.innerHTML = '<li>No teachers found</li>';
            }

            // Populate Admins List
            if (admins.length > 0) {
                admins.forEach(user => {
                    const item = document.createElement('li');
                    const userInfo = document.createElement('span');
                    userInfo.textContent = `Name: ${user.name}, Roll Number: ${user.rollNumber}`;
                    item.appendChild(userInfo);

                    if (loggedInRole === 'admin') {
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Delete';
                        deleteButton.className = 'delete-button';
                        deleteButton.onclick = () => deleteStudent(user.rollNumber);
                        item.appendChild(deleteButton);
                    }

                    adminList.appendChild(item);
                });
            } else {
                adminList.innerHTML = '<li>No admins found</li>';
            }
        })
        .catch(error => {
            console.error('Error fetching users:', error.message);
            const studentList = document.getElementById('studentsList');
            const teacherList = document.getElementById('teachersList');
            const adminList = document.getElementById('adminsList');
            if (studentList) studentList.innerHTML = '<li>Error loading students: ' + error.message + '</li>';
            if (teacherList) teacherList.innerHTML = '<li>Error loading teachers: ' + error.message + '</li>';
            if (adminList) adminList.innerHTML = '<li>Error loading admins: ' + error.message + '</li>';
        });
}

// Delete a user
function deleteStudent(rollNumber) {
    if (!confirm(`Are you sure you want to delete the user with roll number ${rollNumber}?`)) {
        return;
    }

    fetch(`http://localhost:8081/students/${rollNumber}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || 'Failed to delete user');
                });
            }
            return response;
        })
        .then(() => {
            console.log(`User ${rollNumber} deleted successfully`);
            alert('User deleted successfully');
            fetchStudents(); // Refresh the lists
            populateStudentSelect(); // Refresh the dropdown
        })
        .catch(error => {
            console.error('Error deleting user:', error.message);
            alert(error.message);
        });
}

// Check if roll number already exists
async function checkRollNumberExists(rollNumber) {
    try {
        const response = await fetch('http://localhost:8081/students');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const users = await response.json();
        return users.some(user => user.rollNumber === rollNumber);
    } catch (error) {
        console.error('Error checking roll number:', error.message);
        return false; // Assume it doesn't exist if the fetch fails
    }
}

// Add a new user with validation
document.getElementById('studentForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const nameInput = document.getElementById('name');
    const rollInput = document.getElementById('rollNumber');
    const passwordInput = document.getElementById('password');
    const roleInput = document.getElementById('role');
    const name = nameInput.value.trim();
    const rollNumber = rollInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleInput.value;

    if (!name || !rollNumber || !password || !role) {
        alert('All fields are required.');
        return;
    }

    // Client-side validation for roll number uniqueness
    const rollNumberExists = await checkRollNumberExists(rollNumber);
    if (rollNumberExists) {
        rollInput.classList.add('input-error');
        let errorMsg = document.getElementById('rollError');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.id = 'rollError';
            errorMsg.style.color = 'red';
            errorMsg.style.marginTop = '5px';
            rollInput.insertAdjacentElement('afterend', errorMsg);
        }
        errorMsg.textContent = `A user with the roll number '${rollNumber}' already exists`;
        return;
    }

    const user = { name, rollNumber, password, role };

    rollInput.classList.remove('input-error');
    let errorMsg = document.getElementById('rollError');
    if (errorMsg) errorMsg.remove();

    fetch('http://localhost:8081/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || err.error || 'Unknown error');
                }).catch(() => response.text().then(text => {
                    throw new Error(text || 'Server error');
                }));
            }
            return response.json();
        })
        .then(data => {
            console.log('User added:', data);
            fetchStudents();
            populateStudentSelect();
            document.getElementById('studentForm').reset();
        })
        .catch(error => {
            console.error('Error adding user:', error.message);
            rollInput.classList.add('input-error');
            const errorElement = document.createElement('div');
            errorElement.id = 'rollError';
            errorElement.textContent = error.message;
            errorElement.style.color = 'red';
            errorElement.style.marginTop = '5px';
            rollInput.insertAdjacentElement('afterend', errorElement);
        });
});

// Populate user select for attendance
function populateStudentSelect() {
    fetch('http://localhost:8081/students')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch users for dropdown: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Users for dropdown:', data);
            const select = document.getElementById('attendanceStudent');
            const viewSelect = document.getElementById('viewAttendanceStudent');
            if (!select || !viewSelect) {
                console.error('Dropdown elements not found');
                return;
            }
            select.innerHTML = '<option value="">Select a student</option>';
            viewSelect.innerHTML = '<option value="">Select a student</option>';
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(user => {
                    if ((loggedInRole === 'teacher' || loggedInRole === 'admin') && user.role === 'student') {
                        const option = document.createElement('option');
                        option.value = user.rollNumber;
                        option.textContent = `${user.name} (${user.rollNumber})`;
                        select.appendChild(option);
                        const viewOption = document.createElement('option');
                        viewOption.value = user.rollNumber;
                        viewOption.textContent = `${user.name} (${user.rollNumber})`;
                        viewSelect.appendChild(viewOption);
                    }
                });
            } else {
                select.innerHTML = '<option value="">No students available</option>';
                viewSelect.innerHTML = '<option value="">No students available</option>';
            }
        })
        .catch(error => {
            console.error('Error populating user select:', error.message);
            const select = document.getElementById('attendanceStudent');
            const viewSelect = document.getElementById('viewAttendanceStudent');
            if (select) select.innerHTML = '<option value="">Error loading users</option>';
            if (viewSelect) viewSelect.innerHTML = '<option value="">Error loading users</option>';
        });
}

// Mark attendance
document.getElementById('attendanceForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const rollNumber = document.getElementById('attendanceStudent').value;
    const date = document.getElementById('attendanceDate').value;
    const present = document.getElementById('attendanceStatus').checked;

    if (!rollNumber || !date) {
        alert('Student and date are required.');
        return;
    }

    fetch(`http://localhost:8081/attendance/${rollNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, present })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Failed to mark attendance');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Attendance marked:', data);
            alert('Attendance marked successfully');
            document.getElementById('attendanceForm').reset();
            if (document.getElementById('viewAttendanceStudent').value === rollNumber) {
                viewAttendance(rollNumber);
            }
        })
        .catch(error => {
            console.error('Error marking attendance:', error.message);
            alert(error.message);
        });
});

// View attendance
function viewAttendance(rollNumber, filterDate = null) {
    const attendanceList = document.getElementById('attendanceList');
    if (!rollNumber) {
        attendanceList.innerHTML = '<li>Please select a student to view attendance</li>';
        return;
    }
    fetch(`http://localhost:8081/attendance/${rollNumber}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch attendance: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched attendance:', data);
            attendanceList.innerHTML = '';
            let filteredData = data;
            if (filterDate) {
                filteredData = data.filter(record => record.date === filterDate);
            }
            if (Array.isArray(filteredData) && filteredData.length > 0) {
                filteredData.forEach(record => {
                    const item = document.createElement('li');
                    item.textContent = `Date: ${record.date}, Status: ${record.present ? 'Present' : 'Absent'}`;
                    attendanceList.appendChild(item);
                });
            } else {
                attendanceList.innerHTML = '<li>No attendance records found' + (filterDate ? ' for this date' : '') + '</li>';
            }
        })
        .catch(error => {
            console.error('Error fetching attendance:', error.message);
            attendanceList.innerHTML = '<li>Error loading records: ' + error.message + '</li>';
        });
}

document.getElementById('viewAttendanceStudent').addEventListener('change', function () {
    if (loggedInRole === 'student') {
        viewAttendance(loggedInRollNumber); // Restrict to own attendance
    } else {
        viewAttendance(this.value);
    }
});

document.getElementById('filterAttendance').addEventListener('click', function () {
    const date = document.getElementById('attendanceDateFilter').value;
    if (date) {
        viewAttendance(loggedInRollNumber, date);
    } else {
        viewAttendance(loggedInRollNumber);
    }
});

// Generate absence report
document.getElementById('reportForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const date = document.getElementById('reportDate').value;

    if (!date) {
        alert('Date is required.');
        return;
    }

    fetch(`http://localhost:8081/attendance/reports/absent?date=${date}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch report: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched absent students:', data);
            const absentList = document.getElementById('absentList');
            absentList.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(student => {
                    const item = document.createElement('li');
                    item.textContent = `Name: ${student.name}, Roll Number: ${student.rollNumber}`;
                    absentList.appendChild(item);
                });
                // Notify absentees
                fetch('http://localhost:8081/attendance/reports/notify-absent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date })
                })
                    .then(() => console.log('Notifications sent'))
                    .catch(error => console.error('Error sending notifications:', error));
            } else {
                absentList.innerHTML = '<li>No absentees found</li>';
            }
        })
        .catch(error => {
            console.error('Error fetching report:', error.message);
            const absentList = document.getElementById('absentList');
            absentList.innerHTML = '<li>Error loading report: ' + error.message + '</li>';
        });
});