# Contributing to DSA Sync

Thank you for your interest in contributing to DSA Sync! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We do not tolerate harassment or discrimination of any kind.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers
- Focus on what's best for the community
- Show empathy towards others

## 🚀 Getting Started

### Prerequisites

Before contributing, make sure you have:

- Node.js 18+ installed
- Git installed
- MongoDB running (local or Atlas)
- Groq API key (free tier available)
- Basic knowledge of Next.js, React, and TypeScript

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/dsa-sync.git
   cd dsa-sync
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/dsa-sync.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 How to Contribute

### Reporting Bugs

Found a bug? Help us fix it!

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Your environment (OS, browser, Node version)

**Template**:
```markdown
**Bug Description**
A clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., v18.17.0]
```

### Suggesting Features

Have an idea? We'd love to hear it!

1. **Check existing feature requests** first
2. **Create a new issue** with:
   - Clear feature description
   - Use case / motivation
   - Proposed implementation (optional)
   - Mockups / wireframes (if applicable)

### Pull Requests

Ready to contribute code? Follow these steps:

#### 1. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/bug-description
```

**Branch naming conventions**:
- `feature/add-dark-mode` - New features
- `fix/login-error` - Bug fixes
- `docs/update-readme` - Documentation
- `refactor/cleanup-api` - Code refactoring
- `test/add-unit-tests` - Tests

#### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

#### 3. Test Your Changes

```bash
# Run the app
npm run dev

# Build to check for errors
npm run build

# Test manually:
# - Register/login
# - Add problems
# - Test affected features
```

#### 4. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Good commit messages:
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve login authentication error"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify analytics calculation"
git commit -m "test: add unit tests for auth endpoints"
```

**Commit types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

#### 5. Push Changes

```bash
git push origin feature/your-feature-name
```

#### 6. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template:

**PR Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Related Issues
Closes #123

## Changes Made
- Added dark mode toggle
- Updated user settings API
- Modified theme context

## Testing Done
- [x] Tested on Chrome
- [x] Tested on Firefox
- [x] Tested on mobile
- [ ] Added unit tests

## Screenshots
If applicable

## Checklist
- [x] Code follows project style
- [x] Self-review completed
- [x] Documentation updated
- [x] No new warnings
```

4. Submit the PR

#### 7. PR Review Process

- Maintainers will review your PR
- Address any feedback
- Make requested changes
- Once approved, it will be merged!

**Updating your PR**:
```bash
# Make changes
git add .
git commit -m "fix: address review comments"
git push origin feature/your-feature-name
```

## 💻 Code Guidelines

### TypeScript

- Use TypeScript for all new files
- Define proper types/interfaces
- Avoid `any` type

**Good**:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = (id: string): Promise<User> => {
  // ...
}
```

**Bad**:
```typescript
const getUser = (id: any): any => {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use meaningful prop names

**Good**:
```typescript
interface ProblemCardProps {
  problem: Problem;
  onDelete: (id: string) => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onDelete }) => {
  // ...
}
```

### API Routes

- Use proper HTTP status codes
- Return consistent response format
- Handle errors gracefully

**Good**:
```typescript
export async function POST(req: Request) {
  try {
    const data = await req.json();
    // validation
    const result = await createProblem(data);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Follow mobile-first approach
- Maintain consistent spacing

**Good**:
```tsx
<div className="flex flex-col gap-4 p-4 md:flex-row md:p-6">
  <button className="btn-primary">Click Me</button>
</div>
```

### File Organization

```
✅ Good Structure:
app/
  dashboard/
    page.tsx           # Route page
    loading.tsx        # Loading state
    error.tsx          # Error boundary

components/
  Dashboard/
    StatsCard.tsx      # Component
    StatsCard.test.tsx # Tests

❌ Bad Structure:
app/
  dashboard.tsx
  dashboard-stats.tsx
  dashboard-chart.tsx
```

## 🧪 Testing

### Manual Testing Checklist

Before submitting PR, test:

- [ ] Register new user
- [ ] Login with existing user
- [ ] Add problem
- [ ] Mark problem for revision
- [ ] View dashboard
- [ ] View analytics
- [ ] Send friend request
- [ ] AI features (if applicable)
- [ ] Mobile responsive design
- [ ] PWA installation

### Future: Automated Tests

We plan to add:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)

Contributions to testing infrastructure are welcome!

## 📚 Documentation

### Code Comments

- Add comments for complex logic
- Explain "why" not "what"
- Keep comments up-to-date

**Good**:
```typescript
// Calculate XP bonus for solving under median time
// This encourages faster problem solving
const timeBonus = timeTaken < medianTime ? 5 : 0;
```

**Bad**:
```typescript
// Add 5 to bonus
const timeBonus = timeTaken < medianTime ? 5 : 0;
```

### Documentation Files

Update docs when:
- Adding new API endpoint → `docs/API_DOCUMENTATION.md`
- Changing database schema → `docs/DATABASE_SCHEMA.md`
- Adding new feature → `README.md`
- Updating setup process → `docs/SETUP_GUIDE.md`

## 🎨 Design Guidelines

### UI/UX Principles

- **Mobile First**: Design for mobile, enhance for desktop
- **Consistency**: Follow existing patterns
- **Accessibility**: Use semantic HTML, ARIA labels
- **Feedback**: Show loading states, success/error messages

### Color Palette

Stick to the existing theme:
- Primary: Blue (`#0ea5e9`)
- Dark backgrounds: `#0a0f1a` to `#1e293b`
- Accents: Purple, Green, Orange

### Spacing

Use Tailwind spacing scale:
- `gap-2` (8px) - Tight spacing
- `gap-4` (16px) - Normal spacing
- `gap-6` (24px) - Loose spacing

## 🏷️ Labels

We use these labels on issues/PRs:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority
- `priority: low` - Low priority
- `wontfix` - Won't be worked on

## 🎯 Areas to Contribute

### High Priority

- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Improve error handling
- [ ] Add rate limiting
- [ ] Performance optimizations

### Features

- [ ] Export data (CSV/JSON)
- [ ] Problem tags/categories
- [ ] Notes on problems
- [ ] Problem difficulty rating
- [ ] Custom challenges
- [ ] Leaderboards
- [ ] Notifications

### Documentation

- [ ] Video tutorials
- [ ] Architecture diagram
- [ ] Contributing examples
- [ ] API Postman collection

### UI/UX

- [ ] Light mode theme
- [ ] Animations
- [ ] Better mobile navigation
- [ ] Accessibility improvements

## 🐛 Common Issues

### MongoDB Connection

If you get connection errors:
```bash
# Check MongoDB is running
sudo systemctl status mongodb

# Or use MongoDB Atlas
```

### TypeScript Errors

```bash
# Check for type errors
npm run build

# If stuck, delete .next
rm -rf .next
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 🙏 Recognition

Contributors will be:
- Listed in Contributors section
- Mentioned in release notes
- Given credit in documentation

## 📞 Communication

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas
- **Pull Requests**: Code contributions

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

Feel free to:
- Open an issue
- Start a discussion
- Reach out to maintainers

---

**Thank you for contributing to DSA Sync!** 🎉

Every contribution, no matter how small, makes a difference!
