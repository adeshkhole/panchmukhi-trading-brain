# Contributing to Panchmukhi Trading Brain Pro

Welcome to the Panchmukhi Trading Brain Pro project! We're excited to have you contribute. This document provides guidelines and instructions for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Support](#support)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Pledge

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards community members

### Unacceptable Behavior

- Harassment, discrimination, or abusive language
- Trolling or inflammatory comments
- Unwelcome sexual attention
- Publishing private information

---

## Getting Started

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/panchmukhi-trading-brain.git
cd panchmukhi-trading-brain
```

### 2. Add Upstream Remote

```bash
# Keep your fork in sync with main repo
git remote add upstream https://github.com/ORIGINAL_OWNER/panchmukhi-trading-brain.git
git fetch upstream
```

### 3. Create Feature Branch

```bash
# Always branch from develop for new features
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

---

## Development Setup

### Prerequisites

- Node.js 18.x+
- Python 3.10+
- Docker & Docker Compose
- Git

### Local Environment Setup

**1. Install dependencies:**

```bash
# Backend
cd backend
npm install

# Frontend (if needed)
cd ../frontend
# No build step - served as-is

# ML Services
cd ../ml-services
pip install -r requirements.txt
```

**2. Set up environment:**

```bash
cp .env.example .env
# Edit .env with your local settings
```

**3. Start development servers:**

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: ML Services
cd ml-services && uvicorn app:app --reload

# Terminal 3: Frontend (optional, use Live Server)
cd frontend && python -m http.server 3000
```

**4. Verify setup:**

```bash
# Check endpoints
curl http://localhost:8081/health
curl http://localhost:8000/docs
# Frontend: http://localhost:3000
```

### Docker Development

```bash
# Start entire stack
docker-compose up -d

# View logs
docker-compose logs -f

# Run specific service
docker-compose up -d backend
```

---

## Coding Standards

### JavaScript/Node.js

**Style Guide:**
- ✅ ES6+ syntax (const/let, arrow functions, destructuring)
- ✅ Single quotes for strings
- ✅ No semicolons (Prettier format)
- ✅ 2-space indentation
- ✅ JSDoc comments for functions

**Example:**

```javascript
/**
 * Calculate trading signal confidence
 * @param {number} score - ML score 0-100
 * @param {string} symbol - Stock symbol
 * @returns {Object} Signal with confidence
 */
const calculateConfidence = (score, symbol) => {
  const confidence = score / 100
  return {
    signal: score > 50 ? 'BUY' : 'SELL',
    confidence,
    symbol
  }
}
```

**Linting:**
```bash
cd backend
npm run lint           # Check
npm run lint:fix      # Auto-fix
```

### Python

**Style Guide:**
- ✅ PEP 8 compliance
- ✅ Type hints for functions
- ✅ Google-style docstrings
- ✅ 4-space indentation
- ✅ Black formatter

**Example:**

```python
def predict_price(symbol: str, lookback_days: int = 60) -> dict:
    """
    Predict next day's price using LSTM model.
    
    Args:
        symbol: Stock symbol (e.g., 'RELIANCE')
        lookback_days: Historical data window
    
    Returns:
        Dictionary with direction, confidence, price
    """
    data = get_ohlcv_data(symbol, lookback_days)
    prediction = model.predict(data)
    return format_prediction(prediction)
```

**Formatting:**
```bash
# Format
black ml-services/

# Check
flake8 ml-services/
```

### React Native

**Style Guide:**
- ✅ Functional components with hooks
- ✅ PascalCase for component names
- ✅ camelCase for variables/functions
- ✅ PropTypes or TypeScript
- ✅ Memoize expensive components

**Example:**

```javascript
import React, { useState, useMemo } from 'react'
import { View, Text } from 'react-native'

const PriceCard = ({ symbol, price, change }) => {
  const textColor = useMemo(() => 
    change > 0 ? '#00c851' : '#ff4444'
  , [change])
  
  return (
    <View>
      <Text>{symbol}</Text>
      <Text style={{ color: textColor }}>{price}</Text>
    </View>
  )
}

export default React.memo(PriceCard)
```

### Multi-Language Support

**Critical Rule:** All user-facing text must support all 5 languages.

**Implementation:**

```javascript
// ✅ CORRECT: User selects language
const text = translations[userLanguage]['key']

// ❌ WRONG: Hard-coded English
const text = "Dashboard"

// ✅ Database-driven for real-time updates
const text = await db.query('SELECT text FROM translations WHERE language = ?')
```

### Voice Feature

**When adding features that could benefit from voice:**

```javascript
// ✅ Check voice support first
if (!window.speechSynthesis) {
  console.warn('Speech not supported')
  return
}

// ✅ Respect user's language preference
const voice = voiceSettings.language // 'mr', 'hi', 'en', etc.
speakText(text, voice)

// ❌ DON'T: Assume English or force voice
```

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style (no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvement
- **test**: Test addition/modification
- **chore**: Build, dependency update
- **revert**: Revert previous commit

### Scopes

- **frontend**: UI/UX changes
- **backend**: API/server changes
- **ml**: Machine learning services
- **mobile**: React Native app
- **infra**: Docker/deployment
- **core**: Core functionality
- **docs**: Documentation

### Examples

```bash
# Feature
git commit -m "feat(frontend): add Marathi language support for alerts"

# Bug fix
git commit -m "fix(backend): resolve WebSocket connection timeout issues

- Increased timeout from 5s to 30s
- Added auto-reconnect logic
- Prevents premature disconnections for slow networks

Fixes #245"

# Documentation
git commit -m "docs: add ML model training guide"

# Multi-line with footer
git commit -m "refactor(backend): optimize price caching strategy

Previously cached all symbols equally regardless of trading volume.
Now implements weighted TTL based on symbol popularity and volume.

This reduces Redis memory by 40% without impacting performance.

Fixes #189
Breaking-Change: Cache TTL structure modified"
```

### Commit Best Practices

- ✅ Commit frequently, logically group changes
- ✅ Write descriptive messages
- ✅ Reference issues when applicable
- ✅ Keep commits atomic (one feature per commit)
- ✅ Verify changes before committing

---

## Pull Request Process

### Before Creating PR

1. **Sync with upstream:**
```bash
git fetch upstream
git rebase upstream/develop
```

2. **Test locally:**
```bash
npm test                  # Backend/ML tests
npm run lint             # Code quality
```

3. **Verify multi-language:**
- [ ] All UI text in translations object
- [ ] Voice alerts work in all 5 languages
- [ ] Theme toggle doesn't break UI

### Creating a PR

**1. Push to your fork:**
```bash
git push origin feature/your-feature-name
```

**2. Create PR on GitHub:**
- Target: `develop` branch (never `main`)
- Title: Clear, descriptive, follows commit format
- Description: Explain what, why, and how

**PR Description Template:**

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing Done
- [ ] Manual testing
- [ ] Unit tests added
- [ ] Integration tests
- [ ] Mobile testing (if applicable)

## Screenshots (if applicable)
[Add before/after screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Multi-language support verified (if applicable)
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Tests pass locally
```

### Review Process

- Maintainers will review within 48 hours
- Address feedback and re-request review
- All checks must pass (linting, tests, coverage)
- At least 1 approval required

### Merge

Once approved:
- Squash and merge preferred for small PRs
- Keep commit history for large features
- Ensure all tests pass

---

## Testing Requirements

### Unit Tests

**Coverage Requirements:**
- Backend: 85%+ coverage
- ML Services: 80%+ coverage
- Frontend: 70%+ coverage
- Mobile: 75%+ coverage

**Run Tests:**

```bash
# Backend
cd backend && npm test

# ML Services
cd ml-services && pytest --cov

# Frontend
cd frontend && npm test

# Mobile
cd mobile-app && npm test
```

### Writing Tests

**Backend Example:**

```javascript
describe('Signal Service', () => {
  it('should generate BUY signal for oversold stock', async () => {
    const signal = await generateSignal('RELIANCE', { rsi: 25 })
    
    expect(signal.type).toBe('BUY')
    expect(signal.confidence).toBeGreaterThan(0.7)
  })
  
  it('should handle all 5 languages', async () => {
    const languages = ['mr', 'hi', 'en', 'gu', 'kn']
    
    for (const lang of languages) {
      const text = await getSignalText(lang)
      expect(text).toBeTruthy()
    }
  })
})
```

**ML Example:**

```python
def test_marathi_sentiment():
    """Test Marathi sentiment analysis"""
    text = "रिलायंस शेअर खूप बरोबर वाढला"
    score = analyzer.analyze(text, language='mr')
    
    assert -1 <= score <= 1
    assert score > 0.5  # Positive text
```

### Manual Testing

**Critical Paths to Test:**

```
User Registration → Login with 2FA → View Dashboard
  ↓
Select Language (Marathi) → Voice Alert (Should speak Marathi)
  ↓
Create Alert → Receive notification (Multi-language)
  ↓
Toggle Theme (Dark/Light) → UI consistent
  ↓
Mobile App → Same flow on React Native
```

---

## Documentation

### Code Documentation

- JSDoc for JavaScript functions
- Docstrings for Python functions
- Inline comments for complex logic
- README in each module

### Repository Documentation

- **README.md**: Project overview ✅ (updated)
- **Module READMEs**: Setup, features, API ✅ (created)
- **ARCHITECTURE.md**: System design ✅ (exists)
- **CONTRIBUTING.md**: This file (you're reading it!)

### When Documenting

1. **New Feature:** Update relevant README
2. **API Change:** Update backend README
3. **Database Schema:** Update ARCHITECTURE.md
4. **New Language Support:** Document in all module READMEs
5. **Breaking Change:** Add to CHANGELOG.md

---

## Project Organization

### Repository Structure

```
main branch (production)
  ↓
develop branch (staging)
  ↓ (merge after testing)
feature/* branches (development)
```

### Release Process

1. Features merged to `develop`
2. Test on develop for 1 week
3. Version bump + CHANGELOG
4. Create release PR to `main`
5. Tag release: `v1.2.0`
6. Deploy to production

---

## Common Tasks

### Adding New Language Support

1. **Backend:**
```javascript
// Add to translations
const translations = {
  'new_lang': {
    'key': 'translation'
  }
}
```

2. **ML Services:**
```python
# Add language-specific processor
from nlp.new_lang_processor import NewLangProcessor
models['new_lang'] = NewLangProcessor()
```

3. **Frontend:**
```html
<!-- Add language option -->
<option value="new_lang">New Language</option>
```

4. **Mobile:**
```javascript
// Add to Redux UI slice
const languages = ['mr', 'hi', 'en', 'gu', 'kn', 'new_lang']
```

### Fixing a Bug

1. **Create issue** with reproduction steps
2. **Create bugfix branch** from develop: `git checkout -b bugfix/issue-description`
3. **Write test** that reproduces bug
4. **Fix code** to pass test
5. **Submit PR** with test included

### Adding API Endpoint

1. **Backend:**
   - Create controller function
   - Add Joi validation schema
   - Create route
   - Add tests

2. **Frontend/Mobile:**
   - Add API client method
   - Test with real backend

### Database Schema Change

1. **Create migration** file with timestamp
2. **Write up() and down()** functions
3. **Test migration** locally
4. **Document** in ARCHITECTURE.md

---

## Performance Guidelines

### Frontend
- ✅ First contentful paint < 2s
- ✅ Interactive < 3s
- ✅ Image optimization required
- ✅ Lazy load off-screen content

### Backend
- ✅ API response < 200ms (p95)
- ✅ Cache frequently accessed data
- ✅ Database queries indexed
- ✅ Async processing for long tasks

### ML Services
- ✅ Inference < 100ms for predictions
- ✅ Sentiment analysis < 50ms
- ✅ Model caching for repeated queries

### Mobile
- ✅ Cold start < 3s
- ✅ Smooth 60fps animations
- ✅ Efficient memory usage
- ✅ Background tasks optimized

---

## Security Guidelines

### Never Commit

- ❌ API keys, passwords, secrets
- ❌ Private keys or certificates
- ❌ User credentials
- ❌ Database backups

### Use

- ✅ Environment variables for secrets
- ✅ `.env.example` with placeholder values
- ✅ `.gitignore` for local overrides
- ✅ Encrypted secrets in CI/CD

### Code Review Focus

- Input validation
- SQL injection prevention
- XSS prevention (React escapes by default)
- Authentication/authorization checks
- Sensitive data exposure

---

## Troubleshooting

### Build Fails

```bash
# Clear cache
npm cache clean --force
pip cache purge
docker-compose down -v

# Reinstall
npm install
pip install -r requirements.txt
docker-compose up -d
```

### Tests Fail Locally

```bash
# Update dependencies
npm update
pip install --upgrade -r requirements.txt

# Run specific test
npm test -- specific-test.test.js

# Check for environment issues
echo $DATABASE_URL
echo $REDIS_HOST
```

### Git Issues

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- .

# Reset to upstream
git reset --hard upstream/develop
```

---

## Resources

### Getting Help

- 💬 **Discussions**: GitHub Discussions for questions
- 🐛 **Issues**: GitHub Issues for bugs
- 📚 **Docs**: See README files in each module
- 🤝 **Community**: Be respectful and help others

### References

- [Git Basics](https://git-scm.com/book/en/v2)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Google Style Guides](https://google.github.io/styleguide/)
- [PEP 8](https://www.python.org/dev/peps/pep-0008/)

---

## Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md` file
- GitHub contributors page
- Release notes

Thank you for contributing! 🙏

---

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

**Questions? Create an issue or start a discussion!**

[⬆ back to top](#contributing-to-panchmukhi-trading-brain-pro)
