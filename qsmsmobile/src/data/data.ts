// Dummy data and simple auth simulator for local development

export type User = {
  _id: string;
  name: string;
  email: string;
  password: string; // plaintext only for dummy/test; never do this in production
  role?: string;
};

// A small list of fake users
export const users: User[] = [
  {
    _id: "1",
    name: "Alice Example",
    email: "alice@example.com",
    password: "password123",
    role: "user",
  },
  {
    _id: "2",
    name: "Bob Example",
    email: "bob@example.com",
    password: "secret456",
    role: "admin",
  },
];

// Simple auth result shape
export type AuthResult = {
  user: Omit<User, 'password'>;
  token: string;
};

// Simulates a network delay
const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

// Simple authentication function
export async function authenticate(email: string, password: string, ms = 800): Promise<AuthResult> {
  await delay(ms);

  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!found) {
    const err: any = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const { password: _p, ...userWithoutPassword } = found;

  // Return a fake token
  return {
    user: userWithoutPassword,
    token: `fake-token-${found._id}-${Date.now()}`,
  };
}

// A simple test credential you can import into LoginScreen while developing.
// Usage example in LoginScreen:
// import { DEV_TEST_CREDENTIALS } from '../../../data/data';
// set initial form values or autofill inputs with DEV_TEST_CREDENTIALS.email / .password
export const DEV_TEST_CREDENTIALS = {
  email: users[0].email,
  password: users[0].password,
};

// Optional helper to return the user object (without password) for tests
export function getTestUser() {
  const { password: _p, ...u } = users[0];
  return u;
}
