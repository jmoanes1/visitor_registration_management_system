import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ScanFace } from 'lucide-react';
import PageHeader from '@/components/PageHeader.jsx';
import PhotoInput from '@/components/PhotoInput.jsx';
import { TextAreaField, TextField } from '@/components/FormFields.jsx';
import Loading from '@/components/Loading.jsx';
import { visitorsApi } from '@/services/visitors.js';
import { apiErrorMessage } from '@/utils/apiError.js';
import { VISITOR_TYPES } from '@shared/visitorStatuses.js';

const PURPOSE_PRESETS = ['Friend', 'Visitor', 'Others'];
const OTHER_PURPOSE_PREFIX = 'Others:';
const MEGABYTE = 1024 * 1024;

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
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [registeredVisitor, setRegisteredVisitor] = useState(null);
  const [faceScan, setFaceScan] = useState({ status: null, score: null });
  const navigate = useNavigate();

  // A stored record can carry a free-text purpose that is not one of the presets;
  // keep it selectable so editing does not silently overwrite it.
  const purposeChoices =
    form.purpose && !PURPOSE_PRESETS.includes(form.purpose)
      ? [...PURPOSE_PRESETS, form.purpose]
      : PURPOSE_PRESETS;

  useEffect(() => {
    if (!id) return undefined;

    let isStale = false;

    const loadVisitor = async () => {
      setIsLoading(true);
      try {
        const response = await visitorsApi.get(id);
        if (isStale) return;

        const visitor = response.data.data;
        const isOtherPurpose = visitor.purpose?.startsWith(`${OTHER_PURPOSE_PREFIX} `);

        setForm({
          ...emptyForm,
          firstName: visitor.firstName || '',
          lastName: visitor.lastName || '',
          address: visitor.address || '',
          roomOrUnit: visitor.roomOrUnit || '',
          profilePicture: visitor.profilePicture || '',
          idPicture: visitor.idPicture || '',
          contactNumber: visitor.contactNumber || '',
          email: visitor.email || '',
          personToVisit: visitor.personToVisit || '',
          purpose: isOtherPurpose ? 'Others' : visitor.purpose || 'Visitor',
          otherPurpose: isOtherPurpose ? visitor.purpose.slice(OTHER_PURPOSE_PREFIX.length).trim() : '',
          notes: visitor.notes || '',
        });

        setFaceScan({
          status: visitor.faceVerified ? 'verified' : null,
          score: visitor.faceMatchScore ?? null,
        });
      } catch (error) {
        if (!isStale) {
          alert(apiErrorMessage(error, 'Failed to load visitor record'));
          navigate('/visitors');
        }
      } finally {
        if (!isStale) setIsLoading(false);
      }
    };

    loadVisitor();

    return () => {
      isStale = true;
    };
  }, [id, navigate]);

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  // Any photo change invalidates a previous face comparison.
  const setPhoto = (field) => (dataUrl) => {
    setForm((current) => ({ ...current, [field]: dataUrl || '' }));
    setFaceScan({ status: null, score: null });
  };

  const runFaceComparison = () => {
    setFaceScan({ status: 'scanning', score: null });

    // Demo only: a real deployment would call a face-matching service with both
    // images instead of inventing a score.
    setTimeout(() => {
      setFaceScan({ status: 'verified', score: Math.floor(Math.random() * 8) + 92 });
    }, 1500);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!form.roomOrUnit.trim()) nextErrors.roomOrUnit = 'Room or Unit is required';
    if (!form.personToVisit.trim()) nextErrors.personToVisit = 'Host name is required';
    if (!form.purpose) nextErrors.purpose = 'Purpose of visit is required';

    if (form.purpose === 'Others' && !form.otherPurpose.trim()) {
      nextErrors.otherPurpose = 'Please specify the visit purpose';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Please enter a valid email address';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    try {
      const { otherPurpose, ...fields } = form;

      const payload = {
        ...fields,
        company: form.roomOrUnit,
        purpose:
          form.purpose === 'Others' && otherPurpose.trim()
            ? `${OTHER_PURPOSE_PREFIX} ${otherPurpose.trim()}`
            : form.purpose,
        faceVerified: faceScan.status === 'verified',
        faceMatchScore: faceScan.score,
      };

      if (isEdit) {
        // department and visitorType are left out so the stored values survive.
        await visitorsApi.update(id, payload);
        navigate('/visitors');
        return;
      }

      const response = await visitorsApi.create({
        ...payload,
        department: 'General',
        visitorType: VISITOR_TYPES[0],
      });

      setRegisteredVisitor(response.data.data);
      setForm(emptyForm);
      setFaceScan({ status: null, score: null });
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert(apiErrorMessage(error, 'Registration failed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading label="Loading visitor record..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Visitor Registration' : 'Register New Visitor'}
        description={
          isEdit
            ? 'Update visitor credentials, destination room/unit, and identity verification.'
            : 'Complete visitor credentials, destination room/unit, and identity verification.'
        }
      />

      <Link
        to="/visitors"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E3A5F] transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Visitor Management</span>
      </Link>

      {registeredVisitor && (
        <div className="card !p-5 border-l-4 border-l-emerald-600 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {registeredVisitor.profilePicture ? (
                <img
                  src={registeredVisitor.profilePicture}
                  alt="Visitor"
                  className="w-12 h-12 rounded-lg object-cover border border-[#E2E8F0]"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} />
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#0F172A]">Visitor Registered Successfully</h3>
                <p className="text-xs text-[#475569]">
                  {registeredVisitor.firstName} {registeredVisitor.lastName} — Room / Unit:{' '}
                  <span className="font-semibold text-[#0F172A]">
                    {registeredVisitor.roomOrUnit}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-semibold bg-[#F1F5F9] text-[#1E3A5F] px-2 py-0.5 rounded border border-[#E2E8F0]">
                    Ref: {registeredVisitor.referenceNumber}
                  </span>
                  {registeredVisitor.faceVerified && (
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                      Face Match: {registeredVisitor.faceMatchScore}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/visitors')}
              className="btn-secondary !h-9 whitespace-nowrap"
            >
              View in Directory
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2.5">
              <ScanFace size={18} className="text-[#1E3A5F]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Identity & Face Recognition</h2>
            </div>
            {faceScan.status === 'verified' && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified: {faceScan.score}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhotoInput
              id="profile-photo"
              label="Visitor Face Photo"
              hint="Front-facing photo"
              value={form.profilePicture}
              onChange={setPhoto('profilePicture')}
            />
            <PhotoInput
              id="id-photo"
              variant="id-card"
              label="ID Document / Card"
              hint="Driver's License or ID"
              value={form.idPicture}
              onChange={setPhoto('idPicture')}
              maxBytes={3 * MEGABYTE}
            />
          </div>

          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left space-y-0.5">
              <p className="text-xs font-bold text-[#0F172A]">Biometric Comparison</p>
              <p className="text-[11px] text-[#64748B]">
                Verify visitor facial features match the uploaded ID document
              </p>
            </div>

            <button
              type="button"
              disabled={
                faceScan.status === 'scanning' || !form.profilePicture || !form.idPicture
              }
              onClick={runFaceComparison}
              className="btn-primary !h-9 text-xs whitespace-nowrap"
            >
              {faceScan.status === 'scanning'
                ? 'Scanning Biometrics...'
                : faceScan.status === 'verified'
                  ? `Verified Match (${faceScan.score}%)`
                  : 'Run Face Recognition'}
            </button>
          </div>
        </div>

        <div className="card space-y-5">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h2 className="text-sm font-bold text-[#0F172A]">Personal Information</h2>
            <p className="text-xs text-[#64748B]">
              Visitor credentials, address, and contact info
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="firstName"
              label="First Name"
              required
              placeholder="e.g. John"
              value={form.firstName}
              onChange={updateField('firstName')}
              error={errors.firstName}
            />
            <TextField
              id="lastName"
              label="Last Name"
              required
              placeholder="e.g. Smith"
              value={form.lastName}
              onChange={updateField('lastName')}
              error={errors.lastName}
            />
            <TextField
              id="address"
              label="Visitor Address"
              className="sm:col-span-2"
              placeholder="Street address, city, or postal code"
              value={form.address}
              onChange={updateField('address')}
            />
            <TextField
              id="email"
              label="Email Address"
              type="email"
              placeholder="john.smith@example.com"
              value={form.email}
              onChange={updateField('email')}
              error={errors.email}
            />
            <TextField
              id="contactNumber"
              label="Contact Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.contactNumber}
              onChange={updateField('contactNumber')}
            />
          </div>
        </div>

        <div className="card space-y-5">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h2 className="text-sm font-bold text-[#0F172A]">Destination & Host Details</h2>
            <p className="text-xs text-[#64748B]">Destination room/unit and host person</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="roomOrUnit"
              label="Room or Unit"
              required
              placeholder="e.g. Room 402 / Unit 12B"
              value={form.roomOrUnit}
              onChange={updateField('roomOrUnit')}
              error={errors.roomOrUnit}
            />
            <TextField
              id="personToVisit"
              label="Host / Person to Visit"
              required
              placeholder="e.g. Sarah Jenkins"
              value={form.personToVisit}
              onChange={updateField('personToVisit')}
              error={errors.personToVisit}
            />

            <div className="sm:col-span-2 space-y-2">
              <p className="text-xs font-semibold text-[#1E293B]">
                Purpose of Visit<span className="text-[#DC2626]"> *</span>
              </p>
              <div className="grid grid-cols-3 gap-3">
                {purposeChoices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    title={choice}
                    aria-pressed={form.purpose === choice}
                    onClick={() => setForm((current) => ({ ...current, purpose: choice }))}
                    className={`h-10 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                      form.purpose === choice
                        ? 'bg-[#EFF6FF] border-[#1E3A5F] text-[#1E3A5F]'
                        : 'bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="block truncate">{choice}</span>
                  </button>
                ))}
              </div>

              {form.purpose === 'Others' && (
                <TextField
                  id="otherPurpose"
                  label="Specify purpose"
                  className="pt-1"
                  placeholder="Please specify visit purpose"
                  value={form.otherPurpose}
                  onChange={updateField('otherPurpose')}
                  error={errors.otherPurpose}
                />
              )}
            </div>

            <TextAreaField
              id="notes"
              label="Special Notes / Remarks"
              className="sm:col-span-2"
              placeholder="Optional instructions or notes"
              value={form.notes}
              onChange={updateField('notes')}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/visitors')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="btn-primary">
            {isSaving
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
