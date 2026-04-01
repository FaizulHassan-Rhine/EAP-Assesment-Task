import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

export function requireAuth(roles) {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.token;
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.sub).lean();
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      if (roles?.length && !roles.includes(user.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
      next();
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}
