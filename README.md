# FaMEMEly - Meme Gaming App

A cross-platform meme gaming app where friends compete to create the funniest memes. Built with React Native (Expo), Firebase, and Stripe.

## Features

- **Meme Editor**: Create memes with text overlays, stickers, filters, and templates
- **Multiplayer Games**: Cards Against Humanity style gameplay - judge picks the winner each round
- **In-Game Chat**: Real-time chat during games
- **Champion Cards**: Collect trophy cards of your winning memes
- **Social Sharing**: Share your best memes to social platforms

## Tech Stack

- **Frontend**: Expo SDK 54+ (managed workflow)
- **State Management**: Zustand
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Payments**: Stripe React Native SDK

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Firebase project
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/famemely.git
cd famemely
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Firebase and Stripe credentials:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

4. Start the development server:
```bash
npm start
```

### Running on Device/Simulator

- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run web`

## Project Structure

```
famemely/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Auth flow (login, signup)
│   ├── (tabs)/              # Main tab navigation
│   │   ├── index.tsx        # Home/feed
│   │   ├── play.tsx         # Game lobby
│   │   ├── create.tsx       # Meme editor
│   │   ├── cards.tsx        # Champion cards
│   │   └── profile.tsx      # User profile
│   └── game/                # Game screens
├── components/
│   ├── editor/              # Meme editor components
│   ├── game/                # Game components
│   ├── chat/                # Chat components
│   └── ui/                  # Shared UI components
├── lib/
│   ├── firebase.ts          # Firebase config
│   ├── stripe.ts            # Stripe config
│   └── utils.ts             # Utility functions
├── stores/                  # Zustand stores
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types
└── assets/                  # Static assets
```

## Game Flow

1. **Create/Join**: Host creates a game and shares the code, players join
2. **Round Start**: Judge is selected, prompt is displayed
3. **Create Meme**: Non-judges create memes for the prompt
4. **Judging**: Judge picks the funniest meme
5. **Winner**: Winner gets a point and a Champion Card
6. **Repeat**: Judge rotates, new round begins
7. **Game End**: Most points wins!

## Firebase Setup

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /games/{gameId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    match /games/{gameId}/chat/{messageId} {
      allow read, write: if request.auth != null;
    }

    match /championCards/{cardId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /memes/{userId}/{filename} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

## License

MIT License - see LICENSE file for details.
