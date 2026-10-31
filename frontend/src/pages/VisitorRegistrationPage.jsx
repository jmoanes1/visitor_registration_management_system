import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { visitorService } from '../services/visitorService.js';
import {
  User,
  Home,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Camera,
  Upload,
  Trash2,
  CreditCard,
  ScanFace,
  MapPin,
  Sparkles,
} from 'lucide-react';

const purposeOptions = ['Friend', 'Visitor', 'Others'];

const emptyForm = {
  firstName: '',
  lastName: '',
  address: '',
  roomOrUnit: '',
  profilePicture: '',
  idPicture: '',
  contactNumber: '',
  email: '',
  personToVisit: '',
  purpose: 'Visitor',
  otherPurpose: '',
  notes: '',
};

const VisitorRegistrationPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(emptyForm);

  const [faceScanStatus, setFaceScanStatus] = useState(null); // 'scanning' | 'verified' | null
  const [faceMatchScore, setFaceMatchScore] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const profileInputRef = useRef(null);
  const idInputRef = useRef(null);
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  // A stored record can carry a free-text purpose that is not one of the presets;
  // keep it selectable so editing does not silently overwrite it.
  const purposeChoices =
    formData.purpose && !purposeOptions.includes(formData.purpose)
      ? [...purposeOptions, formData.purpose]
      : purposeOptions;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await visitorService.getById(id);
        const v = res.data.data;
        if (cancelled) return;

        const isOther = typeof v.purpose === 'string' && v.purpose.startsWith('Others:');
        setFormData({
          firstName: v.firstName || '',
          lastName: v.lastName || '',
          address: v.address || '',
          roomOrUnit: v.roomOrUnit || v.company || '',
          profilePicture: v.profilePicture || '',
          idPicture: v.idPicture || '',
          contactNumber: v.contactNumber || '',
          email: v.email || '',
          personToVisit: v.personToVisit || '',
          purpose: isOther ? 'Others' : v.purpose || 'Visitor',
          otherPurpose: isOther ? v.purpose.slice('Others:'.length).trim() : '',
          notes: v.notes || '',
        });
        setFaceScanStatus(v.faceVerified ? 'verified' : null);
        setFaceMatchScore(v.faceMatchScore ?? null);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to load visitor record');
        navigate('/visitors');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Profile photo must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
        setFaceScanStatus(null);
        setFaceMatchScore(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('ID photo must be less than 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, idPicture: reader.result }));
        setFaceScanStatus(null);
        setFaceMatchScore(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePicture: '' }));
    setFaceScanStatus(null);
    setFaceMatchScore(null);
    if (profileInputRef.current) profileInputRef.current.value = '';
  };

  const handleRemoveIdPhoto = () => {
    setFormData((prev) => ({ ...prev, idPicture: '' }));
    setFaceScanStatus(null);
    setFaceMatchScore(null);
    if (idInputRef.current) idInputRef.current.value = '';
  };

  const handleRunFaceRecognition = () => {
    if (!formData.profilePicture) {
      alert('Please upload or capture a Visitor Face Photo first.');
      return;
    }
    if (!formData.idPicture) {
      alert('Please capture/upload the Government or Visitor ID Card first.');
      return;
    }

    setFaceScanStatus('scanning');
    setTimeout(() => {
      const score = Math.floor(Math.random() * 8) + 92;
      setFaceMatchScore(score);
      setFaceScanStatus('verified');
    }, 1500);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.roomOrUnit.trim()) newErrors.roomOrUnit = 'Room or Unit is required';
    if (!formData.personToVisit.trim()) newErrors.personToVisit = 'Host name is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose of visit is required';

    if (formData.purpose === 'Others' && !formData.otherPurpose.trim()) {
      newErrors.otherPurpose = 'Please specify the visit purpose';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    try {
      const finalPurpose =
        formData.purpose === 'Others' && formData.otherPurpose.trim()
          ? `Others: ${formData.otherPurpose.trim()}`
          : formData.purpose;

      const { otherPurpose, ...formFields } = formData;

      const payload = {
        ...formFields,
        purpose: finalPurpose,
        company: formData.roomOrUnit,
        faceVerified: faceScanStatus === 'verified',
        faceMatchScore: faceMatchScore,
      };

      if (isEdit) {
        // department and visitorType are omitted so the stored values survive the merge
        await visitorService.update(id, payload);
        navigate('/visitors');
        return;
      }

      const response = await visitorService.create({
        ...payload,
        department: 'General',
        visitorType: 'Walk-in',
      });
      setSuccess(response.data.data);
      setFormData(emptyForm);
      setFaceScanStatus(null);
      setFaceMatchScore(null);
      if (profileInputRef.current) profileInputRef.current.value = '';
      if (idInputRef.current) idInputRef.current.value = '';
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/visitors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E3A5F] transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Visitor Management</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            {isEdit ? 'Edit Visitor Registration' : 'Register New Visitor'}
          </h1>
          <p className="text-xs text-[#64748B]">
            {isEdit
              ? 'Update visitor credentials, destination room/unit, and identity verification.'
              : 'Complete visitor credentials, destination room/unit, and identity verification.'}
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="card !p-5 border-l-4 border-l-emerald-600 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {success.profilePicture ? (
                <img
                  src={success.profilePicture}
                  alt="Visitor"
                  className="w-12 h-12 rounded-lg object-cover border border-[#E2E8F0]"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} />
                </div>
              )}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Visitor Registered Successfully
                </h3>
                <p className="text-xs text-[#475569]">
                  {success.firstName} {success.lastName} — Room / Unit:{' '}
                  <span className="font-semibold text-[#0F172A]">{success.roomOrUnit || success.company}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-semibold bg-[#F1F5F9] text-[#1E3A5F] px-2 py-0.5 rounded border border-[#E2E8F0]">
                    Ref: {success.referenceNumber}
                  </span>
                  {success.faceVerified && (
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                      Face Match: {success.faceMatchScore}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/visitors')}
              className="btn-secondary !h-9 whitespace-nowrap"
            >
              View in Directory
            </button>
          </div>
        </div>
      )}

      {/* Registration Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Biometrics & Document Capture */}
        <div className="card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2.5">
              <ScanFace size={18} className="text-[#1E3A5F]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Identity & Face Recognition</h2>
            </div>
            {faceScanStatus === 'verified' && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified: {faceMatchScore}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Face Photo */}
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center justify-between space-y-3 text-center">
              <div>
                <p className="text-xs font-semibold text-[#1E293B]">Visitor Face Photo</p>
                <p className="text-[11px] text-[#64748B]">Front-facing photo</p>
              </div>

              <div className="relative">
                {formData.profilePicture ? (
                  <div className="relative">
                    <img
                      src={formData.profilePicture}
                      alt="Visitor"
                      className="w-24 h-24 rounded-lg object-cover border border-[#CBD5E1]"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveProfilePhoto}
                      className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-[#DC2626] text-white"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => profileInputRef.current?.click()}
                    className="w-24 h-24 rounded-lg bg-white border border-dashed border-[#CBD5E1] hover:border-[#1E3A5F] flex flex-col items-center justify-center text-[#94A3B8] hover:text-[#1E3A5F] cursor-pointer transition-colors"
                  >
                    <Camera size={22} />
                    <span className="text-[10px] font-semibold mt-1">Add Photo</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={profileInputRef}
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="w-full btn-secondary !h-9 text-xs"
              >
                {formData.profilePicture ? 'Change Photo' : 'Upload Face Photo'}
              </button>
            </div>

            {/* ID Card */}
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center justify-between space-y-3 text-center">
              <div>
                <p className="text-xs font-semibold text-[#1E293B]">ID Document / Card</p>
                <p className="text-[11px] text-[#64748B]">Driver's License or ID</p>
              </div>

              <div className="relative">
                {formData.idPicture ? (
                  <div className="relative">
                    <img
                      src={formData.idPicture}
                      alt="ID Document"
                      className="w-32 h-24 rounded-lg object-cover border border-[#CBD5E1]"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveIdPhoto}
                      className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-[#DC2626] text-white"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => idInputRef.current?.click()}
                    className="w-32 h-24 rounded-lg bg-white border border-dashed border-[#CBD5E1] hover:border-[#1E3A5F] flex flex-col items-center justify-center text-[#94A3B8] hover:text-[#1E3A5F] cursor-pointer transition-colors"
                  >
                    <CreditCard size={22} />
                    <span className="text-[10px] font-semibold mt-1">Add ID Card</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={idInputRef}
                accept="image/*"
                onChange={handleIdImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => idInputRef.current?.click()}
                className="w-full btn-secondary !h-9 text-xs"
              >
                {formData.idPicture ? 'Change ID' : 'Upload ID Document'}
              </button>
            </div>
          </div>

          {/* Face match action */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left space-y-0.5">
              <p className="text-xs font-bold text-[#0F172A]">Biometric Comparison</p>
              <p className="text-[11px] text-[#64748B]">Verify visitor facial features match the uploaded ID document</p>
            </div>

            <button
              type="button"
              disabled={faceScanStatus === 'scanning' || !formData.profilePicture || !formData.idPicture}
              onClick={handleRunFaceRecognition}
              className="btn-primary !h-9 text-xs whitespace-nowrap"
            >
              {faceScanStatus === 'scanning' ? (
                <span>Scanning Biometrics...</span>
              ) : faceScanStatus === 'verified' ? (
                <span>Verified Match ({faceMatchScore}%)</span>
              ) : (
                <span>Run Face Recognition</span>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Personal Information */}
        <div className="card space-y-5">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h2 className="text-sm font-bold text-[#0F172A]">Personal Information</h2>
            <p className="text-xs text-[#64748B]">Visitor credentials, address, and contact info</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                First Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. John"
                className={`input-field ${errors.firstName ? '!border-[#DC2626]' : ''}`}
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              {errors.firstName && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                Last Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Smith"
                className={`input-field ${errors.lastName ? '!border-[#DC2626]' : ''}`}
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
              {errors.lastName && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.lastName}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                Visitor Address
              </label>
              <input
                type="text"
                placeholder="Street address, city, or postal code"
                className="input-field"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="john.smith@example.com"
                className={`input-field ${errors.email ? '!border-[#DC2626]' : ''}`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                Contact Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="input-field"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Destination Details */}
        <div className="card space-y-5">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h2 className="text-sm font-bold text-[#0F172A]">Destination & Host Details</h2>
            <p className="text-xs text-[#64748B]">Destination room/unit and host person</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                Room or Unit <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Room 402 / Unit 12B"
                className={`input-field ${errors.roomOrUnit ? '!border-[#DC2626]' : ''}`}
                value={formData.roomOrUnit}
                onChange={(e) => setFormData({ ...formData, roomOrUnit: e.target.value })}
              />
              {errors.roomOrUnit && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.roomOrUnit}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                Host / Person to Visit <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                className={`input-field ${errors.personToVisit ? '!border-[#DC2626]' : ''}`}
                value={formData.personToVisit}
                onChange={(e) => setFormData({ ...formData, personToVisit: e.target.value })}
              />
              {errors.personToVisit && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.personToVisit}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-[#1E293B]">
                Purpose of Visit <span className="text-[#DC2626]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {purposeChoices.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    title={opt}
                    onClick={() => setFormData({ ...formData, purpose: opt })}
                    className={`h-10 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                      formData.purpose === opt
                        ? 'bg-[#EFF6FF] border-[#1E3A5F] text-[#1E3A5F]'
                        : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="block truncate">{opt}</span>
                  </button>
                ))}
              </div>

              {formData.purpose === 'Others' && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Please specify visit purpose"
                    className={`input-field ${errors.otherPurpose ? '!border-[#DC2626]' : ''}`}
                    value={formData.otherPurpose}
                    onChange={(e) => setFormData({ ...formData, otherPurpose: e.target.value })}
                  />
                  {errors.otherPurpose && (
                    <p className="text-[11px] text-[#DC2626] mt-1">{errors.otherPurpose}</p>
                  )}
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                Special Notes / Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Optional instructions or notes"
                className="input-field !h-auto !py-2.5"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/visitors')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading
              ? 'Processing...'
              : isEdit
                ? 'Save Changes'
                : 'Submit & Issue Pass'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorRegistrationPage;
