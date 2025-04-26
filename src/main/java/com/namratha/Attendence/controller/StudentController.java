package com.namratha.Attendence.controller;

import com.namratha.Attendence.model.Student;
import com.namratha.Attendence.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return studentService.addStudent(student, "admin"); // Hardcoded for simplicity
    }

    @PostMapping("/login")
    public Student login(@RequestBody LoginRequest request) {
        return studentService.login(request.getRollNumber(), request.getPassword());
    }

    @DeleteMapping("/{rollNumber}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String rollNumber) {
        studentService.deleteStudent(rollNumber, "admin"); // Hardcoded for simplicity
        return ResponseEntity.noContent().build();
    }
}

class LoginRequest {
    private String rollNumber;
    private String password;

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}