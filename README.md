# PM Kata

A 60-minute sandbox for evaluating AI-native senior PM candidates.

## Features

- **Landing Page**: Start a new PM Kata session
- **Session Page**: 3-panel interface with:
  - Left panel: Client brief, discovery transcript, internal email
  - Center panel: Markdown editor with preview toggle
  - Right panel: Chat with 3 AI personas (Sarah Client, Marcus Engineer, Priya Designer)
  - Timer and submit functionality
  - Pyramid summary modal at submission
- **Report Page**: Hiring manager evaluation with:
  - Radar chart of 10 dimension scores
  - Overall score and summary
  - Highlights and red flags
  - Final deliverable and pyramid summary

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- @anthropic-ai/sdk (Claude AI)
- recharts (Radar chart)
- react-markdown (Markdown rendering)
- In-memory JSON persistence (no database)

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
   
   **If you encounter corrupted node_modules errors on Windows:**
   
   Close any editors/IDEs and terminate any running Node processes, then:
   ```bash
   # Method 1: Using cmd (run as Administrator if needed)
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   
   # Method 2: If that fails, try PowerShell as Administrator
   Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
   Remove-Item package-lock.json -ErrorAction SilentlyContinue
   npm install --force
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your Anthropic API key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env` file in the root directory:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Note**: The app will work without an API key using mock fallback data.

## Usage

1. Click "Start PM Kata" on the landing page
2. Review the client brief in the left panel
3. Work on your solution in the center markdown editor
4. Chat with the AI personas in the right panel to gather information
5. Submit your work when ready
6. View the generated evaluation report

## API Routes

- `POST /api/session` - Create or save a session
- `GET /api/session?id={id}` - Fetch a session
- `POST /api/agent` - Send message to AI persona
- `POST /api/evaluate` - Generate evaluation report

## Model Configuration

- Agent Model: `claude-sonnet-4-6`
- Evaluator Model: `claude-opus-4-7`

## Project Structure

```
app/
├── api/
│   ├── agent/route.ts      # AI persona chat
│   ├── evaluate/route.ts   # Evaluation generation
│   └── session/route.ts    # Session management
├── globals.css
├── layout.tsx
├── page.tsx                # Landing page
├── report/[id]/page.tsx    # Evaluation report
└── session/[id]/page.tsx   # Candidate sandbox
lib/
├── mock-data.ts            # Fallback data and in-memory storage
└── types.ts                # TypeScript types
```

## License

MIT
