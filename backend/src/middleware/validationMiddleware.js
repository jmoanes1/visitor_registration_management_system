const validateVisitor = (req, res, next) => {
  // Support either roomOrUnit or legacy company
  if (req.body.roomOrUnit && !req.body.company) {
    req.body.company = req.body.roomOrUnit;
  }
  if (req.body.company && !req.body.roomOrUnit) {
    req.body.roomOrUnit = req.body.company;
  }

  // Defaults belong to creation only. Injecting them on PATCH would overwrite a
  // stored record's real department/type whenever the client omits them.
  if (req.method === 'POST') {
    if (!req.body.department) {
      req.body.department = 'General';
    }

    if (!req.body.visitorType) {
      req.body.visitorType = 'Walk-in';
    }
  }

  const { firstName, lastName, roomOrUnit, company, personToVisit, purpose } = req.body;

  const requiredFields = [
    { name: 'firstName', value: firstName },
    { name: 'lastName', value: lastName },
    { name: 'roomOrUnit', value: roomOrUnit || company },
    { name: 'personToVisit', value: personToVisit },
    { name: 'purpose', value: purpose },
  ];

  const missing = requiredFields.filter((f) => !f.value || f.value.trim() === '');

  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.map((f) => f.name).join(', ')}`);
    error.statusCode = 400;
    return next(error);
  }

  const validStatuses = ['Registered', 'Checked In', 'Checked Out', 'Expected', 'Cancelled'];
  const validTypes = ['Walk-in', 'Appointment'];

  if (req.body.status && !validStatuses.includes(req.body.status)) {
    const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    error.statusCode = 400;
    return next(error);
  }

  if (req.body.visitorType && !validTypes.includes(req.body.visitorType)) {
    const error = new Error(`Invalid visitor type. Must be one of: ${validTypes.join(', ')}`);
    error.statusCode = 400;
    return next(error);
  }

  next();
};

export default validateVisitor;
