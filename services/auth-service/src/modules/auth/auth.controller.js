import * as authService from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const verifySignup = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifySignup(email, otp);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resendSignupOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendSignupOtp(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    await authService.deleteProfile(req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const result = await authService.resetPassword(email, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
