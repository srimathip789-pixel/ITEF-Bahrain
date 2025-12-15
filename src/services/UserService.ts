export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // In a real app, never store plain text passwords!
}

const USERS_KEY = 'lms_users';
const CURRENT_USER_KEY = 'lms_current_user';

export const UserService = {
    getUsers: (): User[] => {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    },

    saveUser: (user: User): void => {
        const users = UserService.getUsers();
        users.push(user);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    },

    login: (email: string, password: string): User | null => {
        const users = UserService.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _password, ...userWithoutPassword } = user;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
            return userWithoutPassword as User;
        }
        return null;
    },

    logout: (): void => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUser: (): User | null => {
        const userJson = localStorage.getItem(CURRENT_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    },

    emailExists: (email: string): boolean => {
        const users = UserService.getUsers();
        return users.some(u => u.email === email);
    }
};
