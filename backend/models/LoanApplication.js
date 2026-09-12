// models/LoanApplication.js
import mongoose from 'mongoose';

const loanApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicationNumber: { type: String, required: true, unique: true, index: true },

    firstName:   { type: String, default: '' },
    lastName:    { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    ssn:         { type: String, default: '' },
    email:       { type: String, default: '' },
    phone:       { type: String, default: '' },

    street:        { type: String, default: '' },
    city:          { type: String, default: '' },
    state:         { type: String, default: '' },
    zip:           { type: String, default: '' },
    housingStatus: { type: String, default: 'Rent' },
    monthlyHousing:{ type: Number, default: 0 },

    employmentStatus: { type: String, default: 'Employed' },
    employerName:     { type: String, default: '' },
    jobTitle:         { type: String, default: '' },
    yearsEmployed:    { type: Number, default: 0 },
    annualIncome:     { type: Number, default: 0 },
    additionalIncome: { type: Number, default: 0 },

    loanType:       { type: String, default: 'Personal' },
    loanAmount:     { type: Number, required: true, min: 0.01 },
    loanTermMonths: { type: Number, default: 36 },
    loanPurpose:    { type: String, default: '' },

    authorizeCredit: { type: Boolean, default: false },
    agreeTerms:      { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    adminNote:  { type: String, default: '' },
    reviewedAt: { type: Date,   default: null },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

loanApplicationSchema.index({ userId: 1, submittedAt: -1 });

export default mongoose.model('LoanApplication', loanApplicationSchema);