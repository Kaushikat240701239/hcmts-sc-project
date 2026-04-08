const Complaint = require('../models/Complaint');
const User = require('../models/User');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

// @desc    Generate CSV report
// @route   GET /api/reports/csv
// @access  Private (Admin/Warden)
exports.generateCSV = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [{ model: User, as: 'Student', attributes: ['username', 'name'] }]
    });

    const data = complaints.map(c => ({
      ID: c.id,
      Student: c.Student ? c.Student.name || c.Student.username : 'Unknown',
      Type: c.complaint_type,
      Status: c.status,
      Block: c.block,
      Room: c.room_no_no,
      Date: c.createdAt.toISOString().split('T')[0]
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints_report.csv');

    csv.write(data, { headers: true }).pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Generate PDF report
// @route   GET /api/reports/pdf
// @access  Private (Admin/Warden)
exports.generatePDF = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [{ model: User, as: 'Student', attributes: ['username', 'name'] }]
    });

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints_report.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Hostel Complaint Management System (HCMTS)', { align: 'center' });
    doc.fontSize(14).text('Complaints Report', { align: 'center' });
    doc.moveDown();

    // Table Header
    doc.fontSize(10).text('ID', 30, doc.y, { width: 30 });
    doc.text('Date', 70, doc.y, { width: 70 });
    doc.text('Student', 150, doc.y, { width: 100 });
    doc.text('Issue', 260, doc.y, { width: 100 });
    doc.text('Status', 370, doc.y, { width: 70 });
    doc.text('Block/Room', 450, doc.y, { width: 100 });
    doc.moveDown();

    doc.moveTo(30, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Table Rows
    doc.fontSize(9);
    complaints.forEach(c => {
        const y = doc.y;
        doc.text(c.id.toString(), 30, y);
        doc.text(c.createdAt.toLocaleDateString(), 70, y);
        doc.text(c.Student ? c.Student.name || c.Student.username : 'Unknown', 150, y, { width: 100 });
        doc.text(c.complaint_type, 260, y, { width: 100 });
        doc.text(c.status, 370, y);
        doc.text(`${c.block} - ${c.room_no_no}`, 450, y);
        doc.moveDown(1.5);

        if (doc.y > 700) doc.addPage();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
