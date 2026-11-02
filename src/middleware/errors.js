export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Request data is invalid.', details: Object.values(error.errors).map(({ message }) => message) });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'The supplied id is invalid.' });
  }

  console.error(error);
  res.status(500).json({ message: 'Something went wrong.' });
}
