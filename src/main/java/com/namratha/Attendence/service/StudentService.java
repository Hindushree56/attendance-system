package com.namratha.Attendence.service;

import com.namratha.Attendence.model.Student;
import com.namratha.Attendence.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepo;
    private final AttendanceService attendanceService;

    public StudentService(StudentRepository studentRepo, AttendanceService attendanceService) {
        this.studentRepo = studentRepo;
        this.attendanceService = attendanceService;
    }

    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    public Student addStudent(Student student, String loggedInRole) {
        if (!"admin".equals(loggedInRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can add students");
        }
        String rollNumber = student.getRollNumber().trim();
        if (studentRepo.findByRollNumber(rollNumber) != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student with roll number already exists");
        }
        student.setRollNumber(rollNumber);
        return studentRepo.save(student);
    }

    public Student login(String rollNumber, String password) {
        Student student = studentRepo.findByRollNumber(rollNumber);
        if (student == null || !student.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid roll number or password");
        }
        return student;
    }

    public void deleteStudent(String rollNumber, String loggedInRole) {
        if (!"admin".equals(loggedInRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can delete students");
        }
        Student student = studentRepo.findByRollNumber(rollNumber);
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        // Delete associated attendance records
        attendanceService.deleteAttendanceByStudent(student);
        // Delete the student
        studentRepo.delete(student);
    }
}