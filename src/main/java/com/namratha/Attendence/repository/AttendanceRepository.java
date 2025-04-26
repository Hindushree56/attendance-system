package com.namratha.Attendence.repository;

import com.namratha.Attendence.model.Attendance;
import com.namratha.Attendence.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudent(Student student);
    Attendance findByStudentAndDate(Student student, LocalDate date);
}