const getProfile = async (user) => {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    address: user.address,
  };
};

module.exports = { getProfile };
