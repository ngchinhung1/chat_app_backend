import { User } from '../feature/auth/entities/user.entity';

declare module 'express' {
    interface Request {
        language?: string;
        user?: Partial<User>;
    }
}