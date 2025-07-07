import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot be more than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Group code is required'],
    unique: true,
    uppercase: true,
    minlength: [6, 'Group code must be at least 6 characters'],
    maxlength: [10, 'Group code cannot be more than 10 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['teacher', 'student'],
      default: 'student'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  grade: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxMembers: {
    type: Number,
    default: 50,
    min: [1, 'Minimum 1 member'],
    max: [100, 'Maximum 100 members']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
groupSchema.index({ code: 1 });
groupSchema.index({ createdBy: 1 });
groupSchema.index({ 'members.user': 1 });

// Generate unique group code
groupSchema.statics.generateCode = async function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existingGroup = await this.findOne({ code });
    if (!existingGroup) {
      isUnique = true;
    }
  }
  
  return code;
};

// Add member to group
groupSchema.methods.addMember = async function(userId, role = 'student') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this group');
  }
  
  if (this.members.length >= this.maxMembers) {
    throw new Error('Group is at maximum capacity');
  }
  
  this.members.push({
    user: userId,
    role,
    joinedAt: new Date()
  });
  
  return await this.save();
};

// Remove member from group
groupSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  
  return await this.save();
};

// Check if user is member
groupSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Check if user is teacher
groupSchema.methods.isTeacher = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  return member && member.role === 'teacher';
};

const Group = mongoose.model('Group', groupSchema);

export default Group; 