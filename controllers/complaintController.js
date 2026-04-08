const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
exports.createComplaint = async (req, res) => {
  const { complaint_type, description, block, room_no_no } = req.body;

  try {
    const complaint = await Complaint.create({
      student_id: req.user.id,
      complaint_type,
      description,
      block,
      room_no_no,
      status: 'Pending',
    });

    // Notify Warden (simplified: notify all wardens or a specific one)
    const wardens = await User.findAll({ where: { role: 'warden' } });
    for (const warden of wardens) {
      await Notification.create({
        user_id: warden.id,
        message: `New complaint submitted: ${complaint_type} in Block ${block}, Room ${room_no_no}`,
      });
    }

    res.status(201).json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all complaints (Role-based)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  let query = {};
  if (req.user.role === 'student') query = { student_id: req.user.id };
  else if (req.user.role === 'staff') query = { staff_id: req.user.id };
  // Wardens and Admins see all

  try {
    const complaints = await Complaint.findAll({
      where: query,
      include: [
        { model: User, as: 'Student', attributes: ['username', 'name'] },
        { model: User, as: 'Warden', attributes: ['username', 'name'] },
        { model: User, as: 'Staff', attributes: ['username', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Assign complaint to maintenance staff
// @route   PUT /api/complaints/:id/assign
// @access  Private (Warden)
exports.assignComplaint = async (req, res) => {
  const { staff_id, priority } = req.body;

  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.staff_id = staff_id;
    complaint.warden_id = req.user.id;
    complaint.priority = priority;
    complaint.status = 'In Progress';
    complaint.assigned_at = new Date();
    await complaint.save();

    // Notify Staff
    await Notification.create({
      user_id: staff_id,
      message: `A new complaint task has been assigned to you: ${complaint.complaint_type}`,
    });

    // Notify Student
    await Notification.create({
      user_id: complaint.student_id,
      message: `Your complaint about ${complaint.complaint_type} is now In Progress.`,
    });

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Resolve complaint
// @route   PUT /api/complaints/:id/resolve
// @access  Private (Staff/Warden)
exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = 'Resolved';
    complaint.resolved_at = new Date();
    await complaint.save();

    // Notify Student
    await Notification.create({
      user_id: complaint.student_id,
      message: `Your complaint about ${complaint.complaint_type} has been Resolved.`,
    });

    // Notify Warden
    await Notification.create({
      user_id: complaint.warden_id,
      message: `Complaint #${complaint.id} has been resolved by maintenance staff.`,
    });

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reject complaint
// @route   PUT /api/complaints/:id/reject
// @access  Private (Warden)
exports.rejectComplaint = async (req, res) => {
  const { rejection_reason } = req.body;

  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = 'Rejected';
    complaint.rejection_reason = rejection_reason;
    await complaint.save();

    // Notify Student
    await Notification.create({
      user_id: complaint.student_id,
      message: `Your complaint about ${complaint.complaint_type} was Rejected. Reason: ${rejection_reason}`,
    });

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    General status update (flexible)
// @route   PUT /api/complaints/:id/status
// @access  Private (Warden/Admin)
exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = status;
    
    // If set back to Pending, clear assignment data
    if (status === 'Pending') {
      complaint.staff_id = null;
      complaint.assigned_at = null;
      complaint.priority = 'Low';
    }

    await complaint.save();

    // Notify Student
    await Notification.create({
      user_id: complaint.student_id,
      message: `Your complaint about ${complaint.complaint_type} has been moved to status: ${status}`,
    });

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
