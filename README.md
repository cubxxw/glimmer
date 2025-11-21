# 回响 · Echo

<div align="center">

**An AI-powered emotional companion app that turns fragmented emotions into moments of resonance**

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![AI SDK](https://img.shields.io/badge/AI_SDK-4.3.19-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.9-38bdf8)

</div>

## 📖 About

Echo is an innovative emotional wellness application that combines AI conversational capabilities with mindful design to help users:

- **Process emotions** through empathetic AI conversations
- **Receive personalized suggestions** tailored to emotional states
- **Track emotional patterns** via an intuitive journal interface
- **Build emotional awareness** with cognitive shifts and micro-actions

Built with modern web technologies and powered by Groq's LLaMA 3.3 70B model, Echo provides a safe, judgment-free space for emotional exploration.

## ✨ Features

### 🤖 AI-Powered Conversations
- Natural, empathetic dialogue with Echo AI
- 3-4 round conversations designed for emotional exploration
- Real-time streaming responses for fluid interaction
- Voice input simulation for hands-free expression

### 💡 Intelligent Emotion Recognition
- Automatic detection of 5 core emotional states:
  - 焦虑 (Anxiety)
  - 渴望 (Envy)
  - 疲惫 (Fatigue)
  - 迷茫 (Confusion)
  - 触动 (Neutral/Touch)

### 🎯 Personalized Action Library
- **Cognitive Shifts**: Reframe thinking patterns
- **Micro Actions**: Small, actionable steps for immediate relief
- Curated suggestions based on emotional analysis
- Evidence-based psychological techniques

### 📊 Tracking & Visualization
- **Timeline View**: Chronological history of emotional moments
- **Collection View**: Visual card-based gallery
- **Calendar View**: Monthly mood calendar with completion tracking
- **Statistics Dashboard**: Weekly resonance metrics and emotional distribution

### 🎨 Beautiful UI/UX
- Mobile-first responsive design (optimized for 414x896px)
- Smooth animations and transitions
- Receipt-inspired interaction design
- Privacy blur mode for sensitive content
- Dark/light theme support

### 📱 Core Screens

#### Space (主空间)
- Weekly resonance statistics
- Quick action items timeline
- AI conversation starter
- Completion tracking

#### Journal (情绪日记)
- Monthly mood calendar
- Historical timeline with visual indicators
- Entry management and review

#### Me (我的档案)
- User level progression system
- Achievement tracking
- Privacy settings
- Data management

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** 9.x or higher
- **Groq API Key** ([Get one here](https://console.groq.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd glimmer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Groq API key:
   ```env
   GROQ_API_KEY=your_actual_groq_api_key
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 16.0.3](https://nextjs.org/)** - React framework with App Router
- **[React 19.2.0](https://react.dev/)** - UI library with latest features
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Type-safe development

### AI & API
- **[Vercel AI SDK 4.3.19](https://sdk.vercel.ai/)** - Streaming AI responses
- **[@ai-sdk/groq](https://www.npmjs.com/package/@ai-sdk/groq)** - Groq provider integration
- **[LLaMA 3.3 70B](https://groq.com/)** - Large language model via Groq

### UI Components
- **[Tailwind CSS 4.1.9](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[class-variance-authority](https://cva.style/)** - Component variants
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Merge Tailwind classes

### Form & Validation
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms
- **[Zod](https://zod.dev/)** - Schema validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Form resolver integration

### Additional Libraries
- **[sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management
- **[date-fns](https://date-fns.org/)** - Date utilities
- **[embla-carousel-react](https://www.embla-carousel.com/)** - Carousel component

## 📁 Project Structure

```
glimmer/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI chat API endpoint
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main application page
├── components/
│   ├── ui/                        # Reusable UI components
│   └── theme-provider.tsx         # Theme context
├── lib/
│   └── utils.ts                   # Utility functions
├── public/                        # Static assets
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## 🎯 Key Components

### ChatInterface
Real-time streaming chat with Echo AI, including:
- Message history management
- Streaming text responses
- Voice input simulation
- Loading states and animations

### ActionItemCard
Displays emotional moments with:
- Completion toggle
- Delete functionality
- Emotion indicators
- Timestamp display

### ResonanceCard
Beautiful receipt-style visualization showing:
- Trigger phrase
- Detected emotion
- Suggested action (cognitive shift or micro action)
- Action metadata

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API key for LLaMA access | Yes |

## 🧠 AI Configuration

The app uses Groq's LLaMA 3.3 70B Versatile model with the following parameters:

```typescript
{
  model: "llama-3.3-70b-versatile",
  maxTokens: 150,
  temperature: 0.7,
  systemPrompt: "Empathetic emotional companion"
}
```

### Conversation Flow
1. **Rounds 1-2**: Open-ended listening and exploration
2. **Rounds 3-4**: Deep dive into triggers and causes
3. **Rounds 5-6**: Summary and conversation closure
4. **Analysis**: Emotion detection → Action suggestion

## 📊 Data Management

### Local Storage
- Conversation history
- Action items
- User settings
- Completion status

### Data Structure
```typescript
interface HistoryItem {
  id: number
  trigger: string
  emotion: EmotionType
  suggestion: Suggestion
  date: string
  completed: boolean
  conversation: Array<{ role: "user" | "assistant"; content: string }>
}
```

## 🎨 Design System

### Color Palette
- **Primary**: Teal-400 to Blue-500 gradient
- **Neutral**: Gray scale from 50 to 900
- **Accent**: Rose for warnings, Teal for success

### Typography
- **Headings**: Serif font family for elegance
- **Body**: Sans-serif for readability
- **Monospace**: For technical content

### Spacing
- Mobile-first design (max-width: 448px)
- Consistent padding scale (4px base)
- Smooth animations (300-500ms)

## 🚧 Future Enhancements

- [ ] Multi-language support (English, Spanish, French)
- [ ] Data export functionality (JSON, CSV)
- [ ] Advanced analytics and insights
- [ ] Integration with calendar apps
- [ ] Social features (anonymous sharing)
- [ ] Progressive Web App (PWA) capabilities
- [ ] Voice input with speech recognition
- [ ] Customizable action library
- [ ] Therapist referral system
- [ ] Mood prediction algorithms

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
1. Follow the existing code style
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Vercel** for the AI SDK and Next.js framework
- **Groq** for lightning-fast LLM inference
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first styling approach
- All open-source contributors who made this possible

## 📞 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [your-docs-url]

---

<div align="center">

**Made with ❤️ for emotional wellness**

*"Not every thought needs to be heavy. Sometimes, just let it echo."*

</div>
