import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { asyncHandler, sendSuccessResponse, sendErrorResponse } from '../middleware/errorMiddleware.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

const router = express.Router();

// Validation rules
const createGroupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('grade')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Grade cannot exceed 20 characters'),
  body('maxMembers')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max members must be between 1 and 100')
];

const joinGroupValidation = [
  body('code')
    .trim()
    .isLength({ min: 6, max: 10 })
    .withMessage('Group code must be between 6 and 10 characters')
    .isUppercase()
    .withMessage('Group code must be uppercase')
];

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private (Teachers only)
router.post('/', protect, authorize('teacher'), createGroupValidation, asyncHandler(async (req, res) => {
  const { name, subject, description, grade, maxMembers = 50 } = req.body;

  // Generate unique group code
  const code = await Group.generateCode();

  // Create group
  const group = await Group.create({
    name,
    code,
    subject,
    description,
    grade,
    maxMembers,
    createdBy: req.user._id
  });

  // Add creator as teacher member
  await group.addMember(req.user._id, 'teacher');

  // Populate creator info
  await group.populate('createdBy', 'name email');

  sendSuccessResponse(res, {
    group
  }, 'Group created successfully', 201);
}));

// @route   GET /api/groups
// @desc    Get all groups for current user
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  const query = {
    $or: [
      { createdBy: req.user._id },
      { 'members.user': req.user._id }
    ]
  };

  if (search) {
    query.$or.push(
      { name: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } }
    );
  }

  const groups = await Group.find(query)
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Group.countDocuments(query);

  sendSuccessResponse(res, {
    groups,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGroups: total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  }, 'Groups retrieved successfully');
}));

// @route   GET /api/groups/:id
// @desc    Get group by ID
// @access  Private (Group members only)
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email role avatar');

  if (!group) {
    return sendErrorResponse(res, 'Group not found', 404);
  }

  // Check if user is member or creator
  if (!group.isMember(req.user._id) && group.createdBy.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 'Not authorized to access this group', 403);
  }

  sendSuccessResponse(res, {
    group
  }, 'Group retrieved successfully');
}));

// @route   POST /api/groups/join
// @desc    Join a group by code
// @access  Private
router.post('/join', protect, joinGroupValidation, asyncHandler(async (req, res) => {
  const { code } = req.body;

  // Find group by code
  const group = await Group.findOne({ code, isActive: true });
  if (!group) {
    return sendErrorResponse(res, 'Invalid group code or group is inactive', 404);
  }

  // Check if user is already a member
  if (group.isMember(req.user._id)) {
    return sendErrorResponse(res, 'You are already a member of this group', 400);
  }

  // Check if group is full
  if (group.members.length >= group.maxMembers) {
    return sendErrorResponse(res, 'Group is at maximum capacity', 400);
  }

  // Add user to group
  await group.addMember(req.user._id, req.user.role);

  // Populate group info
  await group.populate('createdBy', 'name email');
  await group.populate('members.user', 'name email role');

  sendSuccessResponse(res, {
    group
  }, 'Successfully joined group');
}));

// @route   PUT /api/groups/:id
// @desc    Update group
// @access  Private (Group creator only)
router.put('/:id', protect, authorize('teacher'), createGroupValidation, asyncHandler(async (req, res) => {
  const { name, subject, description, grade, maxMembers } = req.body;

  const group = await Group.findById(req.params.id);
  if (!group) {
    return sendErrorResponse(res, 'Group not found', 404);
  }

  // Check if user is the creator
  if (group.createdBy.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 'Not authorized to update this group', 403);
  }

  // Update group
  const updatedGroup = await Group.findByIdAndUpdate(
    req.params.id,
    {
      name,
      subject,
      description,
      grade,
      maxMembers
    },
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email')
   .populate('members.user', 'name email role');

  sendSuccessResponse(res, {
    group: updatedGroup
  }, 'Group updated successfully');
}));

// @route   DELETE /api/groups/:id
// @desc    Delete group
// @access  Private (Group creator only)
router.delete('/:id', protect, authorize('teacher'), asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    return sendErrorResponse(res, 'Group not found', 404);
  }

  // Check if user is the creator
  if (group.createdBy.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 'Not authorized to delete this group', 403);
  }

  // Soft delete by setting isActive to false
  group.isActive = false;
  await group.save();

  sendSuccessResponse(res, null, 'Group deleted successfully');
}));

// @route   POST /api/groups/:id/leave
// @desc    Leave a group
// @access  Private
router.post('/:id/leave', protect, asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    return sendErrorResponse(res, 'Group not found', 404);
  }

  // Check if user is a member
  if (!group.isMember(req.user._id)) {
    return sendErrorResponse(res, 'You are not a member of this group', 400);
  }

  // Check if user is the creator
  if (group.createdBy.toString() === req.user._id.toString()) {
    return sendErrorResponse(res, 'Group creator cannot leave. Transfer ownership or delete the group.', 400);
  }

  // Remove user from group
  await group.removeMember(req.user._id);

  sendSuccessResponse(res, null, 'Successfully left group');
}));

// @route   POST /api/groups/:id/remove-member
// @desc    Remove member from group (Teachers only)
// @access  Private (Group creator only)
router.post('/:id/remove-member', protect, authorize('teacher'), asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return sendErrorResponse(res, 'User ID is required', 400);
  }

  const group = await Group.findById(req.params.id);
  if (!group) {
    return sendErrorResponse(res, 'Group not found', 404);
  }

  // Check if user is the creator
  if (group.createdBy.toString() !== req.user._id.toString()) {
    return sendErrorResponse(res, 'Not authorized to remove members from this group', 403);
  }

  // Check if user is a member
  if (!group.isMember(userId)) {
    return sendErrorResponse(res, 'User is not a member of this group', 400);
  }

  // Remove user from group
  await group.removeMember(userId);

  sendSuccessResponse(res, null, 'Member removed successfully');
}));

export default router; 