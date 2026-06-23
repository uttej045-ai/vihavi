export const mockUsers = {
  'admin@vihavi.dev': {
    id: 'mock-admin-123',
    name: 'Admin User',
    email: 'admin@vihavi.dev',
    role: 'ADMIN',
    permissions: ['ALL_ACCESS', 'MANAGE_USERS', 'MANAGE_EVENTS'],
    token: 'mock-jwt-token-admin-999'
  },
  'organizer@vihavi.dev': {
    id: 'mock-organizer-456',
    name: 'Test Organizer',
    email: 'organizer@vihavi.dev',
    role: 'ORGANIZER',
    permissions: ['CREATE_EVENTS', 'VIEW_REPORTS'],
    token: 'mock-jwt-token-organizer-888'
  },
  'attendee@vihavi.dev': {
    id: 'mock-attendee-789',
    name: 'Test Attendee',
    email: 'attendee@vihavi.dev',
    role: 'USER',
    permissions: ['BOOK_TICKETS', 'VIEW_EVENTS'],
    token: 'mock-jwt-token-attendee-777'
  }
};
