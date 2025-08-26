import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User schema validation
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(2),
  avatar: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Auth credentials schema
export const AuthCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>;

// Mock user database (in real app, this would be a database)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@vitality.ai',
    name: 'Demo User',
    avatar: '/avatars/demo.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock password hashes (in real app, these would be stored securely)
const mockPasswordHashes = {
  'demo@vitality.ai': '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
};

// JWT secret (in real app, this would be an environment variable)
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signUp(credentials: AuthCredentials): Promise<User> {
    // Validate input
    const validatedCredentials = AuthCredentialsSchema.parse(credentials);

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === validatedCredentials.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedCredentials.password, 10);

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: validatedCredentials.email,
      name: validatedCredentials.email.split('@')[0], // Use email prefix as name
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to mock database
    mockUsers.push(newUser);
    mockPasswordHashes[validatedCredentials.email] = hashedPassword;

    // Set as current user
    this.currentUser = newUser;

    return newUser;
  }

  async signIn(credentials: AuthCredentials): Promise<User> {
    // Validate input
    const validatedCredentials = AuthCredentialsSchema.parse(credentials);

    // Find user
    const user = mockUsers.find(u => u.email === validatedCredentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const hashedPassword = mockPasswordHashes[validatedCredentials.email];
    if (!hashedPassword) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(validatedCredentials.password, hashedPassword);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Set as current user
    this.currentUser = user;

    return user;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vitality-auth-token');
      localStorage.removeItem('vitality-user');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to get from localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('vitality-user');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
          return this.currentUser;
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }

    return null;
  }

  generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): { userId: string; email: string; name: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; name: string };
    } catch (error) {
      return null;
    }
  }

  // Store user in localStorage
  persistUser(user: User): void {
    if (typeof window !== 'undefined') {
      const token = this.generateToken(user);
      localStorage.setItem('vitality-auth-token', token);
      localStorage.setItem('vitality-user', JSON.stringify(user));
    }
  }

  // Load user from localStorage
  loadPersistedUser(): User | null {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('vitality-user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
    return null;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
