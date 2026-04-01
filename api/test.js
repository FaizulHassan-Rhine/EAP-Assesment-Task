export default function (req, res) {
  res.json({
    ok: true,
    method: req.method,
    url: req.url,
    mongoSet: !!process.env.MONGODB_URI,
    jwtSet: !!process.env.JWT_SECRET,
  });
}
