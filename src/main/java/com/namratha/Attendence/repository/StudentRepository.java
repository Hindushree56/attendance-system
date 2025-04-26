package com.namratha.Attendence.repository;

import com.namratha.Attendence.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Student findByRollNumber(String rollNumber);
}