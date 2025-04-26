package com.namratha.Attendence.service;

import com.namratha.Attendence.model.Attendance;
import com.namratha.Attendence.model.Student;
import com.namratha.Attendence.repository.AttendanceRepository;
import com.namratha.Attendence.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepo;
    private final StudentRepository studentRepo;

    public AttendanceService(AttendanceRepository attendanceRepo, StudentRepository studentRepo) {
        this.attendanceRepo = attendanceRepo;
        this.studentRepo = studentRepo;
    }

    public Attendance markAttendance(String rollNumber, LocalDate date, boolean present) {
        Student student = studentRepo.findByRollNumber(rollNumber);
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        Attendance existing = attendanceRepo.findByStudentAndDate(student, date);
        if (existing != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attendance already marked for this date");
        }
        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setDate(date);
        attendance.setPresent(present);
        return attendanceRepo.save(attendance);
    }

    public List<Attendance> getAttendanceByStudent(String rollNumber) {
        Student student = studentRepo.findByRollNumber(rollNumber);
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        return attendanceRepo.findByStudent(student);
    }

    public List<Student> getAbsentStudents(LocalDate date) {
        List<Attendance> attendanceRecords = attendanceRepo.findAll().stream()
                .filter(record -> record.getDate().equals(date))
                .toList();
        // Only consider students (exclude teachers and admins)
        List<Student> allStudents = studentRepo.findAll().stream()
                .filter(student -> "student".equals(student.getRole()))
                .toList();
        return allStudents.stream()
                .filter(student -> attendanceRecords.stream()
                        .noneMatch(record -> record.getStudent().equals(student) && record.isPresent()))
                .toList();
    }

    public void sendAbsenceNotifications(LocalDate date) {
        List<Student> absentStudents = getAbsentStudents(date);
        absentStudents.forEach(student -> {
            System.out.println("Email to " + student.getName() + " (" + student.getRollNumber() + "): Absent on " + date);
        });
    }

    public void deleteAttendanceByStudent(Student student) {
        List<Attendance> attendanceRecords = attendanceRepo.findByStudent(student);
        attendanceRepo.deleteAll(attendanceRecords);
    }
}