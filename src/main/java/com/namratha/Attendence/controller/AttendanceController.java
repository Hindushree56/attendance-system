package com.namratha.Attendence.controller;

import com.namratha.Attendence.model.Attendance;
import com.namratha.Attendence.model.Student;
import com.namratha.Attendence.service.AttendanceService;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/{rollNumber}")
    public Attendance markAttendance(@PathVariable String rollNumber,
                                     @RequestBody AttendanceRequest request) {
        return attendanceService.markAttendance(rollNumber, request.getDate(), request.isPresent());
    }

    @GetMapping("/{rollNumber}")
    public List<Attendance> getAttendanceByStudent(@PathVariable String rollNumber) {
        return attendanceService.getAttendanceByStudent(rollNumber);
    }

    @GetMapping("/reports/absent")
    public List<Student> getAbsentStudents(@RequestParam String date) {
        return attendanceService.getAbsentStudents(LocalDate.parse(date));
    }

    @PostMapping("/reports/notify-absent")
    public void notifyAbsent(@RequestBody NotifyRequest request) {
        attendanceService.sendAbsenceNotifications(LocalDate.parse(request.getDate()));
    }
}

class AttendanceRequest {
    private LocalDate date;
    private boolean present;

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public boolean isPresent() { return present; }
    public void setPresent(boolean present) { this.present = present; }
}

class NotifyRequest {
    private String date;

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}