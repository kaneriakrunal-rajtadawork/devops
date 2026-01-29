export function generateStrongPassword(length = 12) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const all = upper + lower + numbers + symbols
  let password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ]

  for (let i = password.length; i < length; i++) {
    password.push(all[Math.floor(Math.random() * all.length)])
  }

  // Shuffle password array
  password = password.sort(() => Math.random() - 0.5)

  return password.join('')
}

//Reusable function to change the value based on passed options and set it on passed function
export const handleOptionsChange = (key, value, setter) => {
  if (!key || !setter) return;

  setter((prev) => ({
    ...prev,
    [key]: value,
  }));
};

//Function to get the workitem base url
export function getWorkItemsBase(pathname) {
  const parts = pathname.split('/');
  const idx = parts.indexOf('work-items');
  return parts.slice(0, idx + 1).join('/');
}