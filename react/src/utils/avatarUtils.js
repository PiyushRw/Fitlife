// Utility function to generate AI avatar initials
export const getAvatarInitials = (userName) => {
  if (!userName || userName === 'User' || userName === 'U') return 'U';
  
  const nameParts = userName.trim().split(' ');
  if (nameParts.length >= 2) {
    // If user has first and last name, show first letter of each
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  } else {
    // If only one name, show first letter
    return userName.charAt(0).toUpperCase();
  }
};

// Utility function to check if profile photo should show AI avatar
export const shouldShowAvatar = (profilePhoto) => {
  return !profilePhoto || profilePhoto === null || profilePhoto === undefined;
}; 