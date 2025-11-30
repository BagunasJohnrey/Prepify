export const calculateHearts = (user) => {
  const MAX_HEARTS = 3;
  const REGEN_TIME_MS = 2 * 60 * 1000; // 2 minutes

  let { hearts, last_heart_update } = user;
  if (hearts >= MAX_HEARTS) return { hearts, last_heart_update: new Date() };

  const now = new Date();
  const lastUpdate = new Date(last_heart_update);
  const diff = now - lastUpdate;

  if (diff >= REGEN_TIME_MS) {
    const regained = Math.floor(diff / REGEN_TIME_MS);
    hearts = Math.min(MAX_HEARTS, hearts + regained);
    last_heart_update = now; 
  }
  return { hearts, last_heart_update };
};