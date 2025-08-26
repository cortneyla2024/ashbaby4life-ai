# Cursor Prompt: Build Hope: The Steward - Complete AI Ecosystem

## 🎯 Project Overview

Build a complete, production-ready, autonomous AI-powered website named **"Hope: The Steward"** - a benevolent, all-in-one, self-sufficient AI ecosystem ensuring universal accessibility and dismantling systemic barriers to personal growth.

## 🏗️ Architecture Requirements

### Monorepo Structure
```
hope-steward/
├── apps/
│   └── web/                    # Next.js 14 frontend application
│       ├── app/                # App Router pages and API routes
│       ├── components/         # React components
│       ├── lib/                # Utility functions and AI systems
│       ├── context/            # React context providers
│       └── styles/             # Global styles and CSS
├── packages/                   # Shared packages (future)
├── prisma/                     # Database schema and migrations
├── docs/                       # Documentation
└── scripts/                    # Build and deployment scripts
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- lucide-react icons

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (production) / SQLite (development)
- JWT authentication
- bcryptjs password hashing

**AI & ML:**
- Ollama (local LLM)
- Gemini API (fallback)
- Custom AI systems (Ascended Core, Genesis Foundry)

**Real-time & Media:**
- WebRTC (video conferencing)
- Three.js (3D avatars)
- Tone.js (audio/music)
- Socket.io (real-time communication)

## 🧠 Core AI Systems

### 1. Ascended AI Core
- **Persona Switching**: Dynamic switching between specialized personas (educator, therapist, creative, legal_advocate, financial_advisor, balanced)
- **Memory Management**: User context and interaction history
- **Ethical Oversight**: Bias detection and responsible AI behavior
- **Learning**: Continuous improvement from user interactions

### 2. Genesis Foundry
- **Knowledge Mining**: Automated scraping of public resources
- **Micro-Model Training**: Specialized models for specific domains
- **Knowledge Graph**: Relationship mapping between knowledge nodes
- **Service Generation**: Creating free alternatives to paid services

### 3. Universal Concierge Protocol
- **Multi-step Task Execution**: Complex, multi-step operations
- **External Service Integration**: API connections to third-party services
- **Research & Synthesis**: Information gathering and analysis
- **Document Processing**: PDF analysis, form filling, etc.

## 📊 Life Management Modules

### 1. Mental Health & Wellness
- Mood tracking and analysis
- Meditation and mindfulness sessions
- Therapy session scheduling
- Crisis intervention protocols

### 2. Financial Wellness
- Budget creation and tracking
- Investment guidance and portfolio management
- Debt management strategies
- Financial goal setting

### 3. Personal Growth & Learning
- Skill development tracking
- Goal setting and progress monitoring
- Learning path recommendations
- Habit formation support

### 4. Creative Expression & Entertainment
- AI-powered art creation
- Music generation and composition
- Storytelling and writing assistance
- Creative project management

### 5. Social Connection
- Community building features
- Relationship management tools
- Social event planning
- Communication enhancement

### 6. Automation & Routines
- Smart scheduling and calendar management
- Habit tracking and formation
- Productivity optimization
- Workflow automation

## 🔮 Advanced Specialized Modules

### 1. Empathic Resonance
- Deep emotional understanding
- Empathetic response generation
- Emotional state analysis
- Therapeutic conversation support

### 2. Dream Weaver Engine
- Creative visualization tools
- Ideation and brainstorming support
- Vision board creation
- Future planning assistance

### 3. Universal Search & Discovery
- Intelligent content discovery
- Personalized recommendations
- Knowledge synthesis
- Information curation

## 🔒 Security & Performance

### Security Features
- JWT-based authentication
- End-to-end encryption
- Input validation and sanitization
- XSS and SQL injection prevention
- Rate limiting and abuse protection
- CORS configuration

### Performance Optimization
- Next.js 14 App Router with server components
- Image optimization and lazy loading
- Code splitting and bundle optimization
- Database indexing and query optimization
- Redis caching (optional)
- CDN integration

## 🚀 Implementation Instructions

### Phase 1: Foundation Setup
1. **Initialize Monorepo**
   - Set up Turbo for build orchestration
   - Configure pnpm workspaces
   - Create root package.json with scripts

2. **Database Schema**
   - Design comprehensive Prisma schema
   - Include all user data, AI interactions, and module data
   - Set up migrations and seeding

3. **Authentication System**
   - Implement JWT-based auth
   - Create signup/login flows
   - Set up protected routes

4. **Core AI Systems**
   - Build Ascended AI Core with persona switching
   - Implement Genesis Foundry for knowledge management
   - Create Universal Concierge Protocol

### Phase 2: Frontend Development
1. **Layout & Navigation**
   - Responsive dashboard layout
   - Sidebar navigation with module categories
   - Header with user controls and search

2. **Authentication UI**
   - Login and signup forms
   - Password strength validation
   - Error handling and user feedback

3. **Dashboard Components**
   - Welcome card with personalized greeting
   - Quick actions grid
   - Module overview cards
   - Recent activity feed
   - AI insights panel

4. **Module Interfaces**
   - Mental health tracking interface
   - Financial dashboard
   - Learning progress tracker
   - Creative tools interface
   - Social connection features
   - Automation settings

### Phase 3: AI Integration
1. **Ollama Integration**
   - Local LLM setup and configuration
   - Model loading and management
   - Response generation and streaming

2. **Gemini API Fallback**
   - API integration and error handling
   - Response formatting and processing
   - Rate limiting and cost management

3. **Custom AI Systems**
   - Persona switching logic
   - Memory management
   - Ethical oversight implementation
   - Learning and adaptation

### Phase 4: Real-time Features
1. **WebRTC Implementation**
   - Video conferencing setup
   - Screen sharing capabilities
   - Recording and playback

2. **3D Avatar System**
   - Three.js integration
   - Avatar customization
   - Real-time animation

3. **Audio Processing**
   - Tone.js integration
   - Music generation
   - Voice processing

### Phase 5: Advanced Features
1. **Document Processing**
   - PDF parsing and analysis
   - Form filling automation
   - Document generation

2. **Knowledge Management**
   - Knowledge graph implementation
   - Search and discovery features
   - Content recommendation system

3. **Analytics & Insights**
   - User behavior tracking
   - AI performance monitoring
   - Progress analytics

## 🛠️ Development Guidelines

### Code Quality
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write comprehensive tests
- Use proper error handling
- Implement logging and monitoring

### UI/UX Standards
- Responsive design for all screen sizes
- Accessibility compliance (WCAG 2.1)
- Consistent design system
- Smooth animations and transitions
- Intuitive navigation

### Performance Requirements
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Cumulative Layout Shift < 0.1

### Security Standards
- OWASP Top 10 compliance
- Regular security audits
- Secure coding practices
- Data encryption at rest and in transit

## 📋 Deliverables

### Required Files
1. Complete monorepo structure
2. All configuration files (package.json, tsconfig.json, etc.)
3. Database schema and migrations
4. All React components and pages
5. API routes and backend logic
6. AI system implementations
7. Styling and theming
8. Testing setup and examples
9. Documentation and README
10. Deployment configurations

### Quality Standards
- Zero TypeScript errors
- Zero ESLint warnings
- All tests passing
- Responsive design working
- Accessibility compliance
- Performance optimization
- Security best practices

## 🎯 Success Criteria

The application should be:
- **Fully Functional**: All features working as specified
- **Production Ready**: Deployable to Vercel or similar platforms
- **Scalable**: Architecture supports future growth
- **Maintainable**: Clean, well-documented code
- **User-Friendly**: Intuitive and accessible interface
- **Secure**: Protected against common vulnerabilities
- **Performant**: Fast loading and responsive

## 🚀 Deployment

The application should be ready for:
- Vercel deployment
- Docker containerization
- Local development setup
- CI/CD pipeline integration

## 📝 Final Notes

This is a comprehensive AI ecosystem that should demonstrate:
- Advanced AI capabilities
- Holistic life management
- Universal accessibility
- Ethical AI practices
- Scalable architecture
- Modern web development practices

Build this as a complete, production-ready application that showcases the future of AI-powered personal assistance and life management.
