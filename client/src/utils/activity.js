const USER_KEY = 'syncspace_user';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function updateStreak(user) {
  if (!user) return user;

  const today = new Date().toDateString();
  const last = user.lastActive ? new Date(user.lastActive).toDateString() : null;
  let streak = user.streak || 0;

  if (last === today) {
    // already counted today
  } else if (last === new Date(Date.now() - 86400000).toDateString()) {
    streak += 1;
  } else {
    streak = 1;
  }

  const updated = {
    ...user,
    streak,
    lastActive: new Date().toISOString(),
  };
  saveUser(updated);
  return updated;
}