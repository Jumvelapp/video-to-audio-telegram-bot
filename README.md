# Telegisto

A service that converts videos from various sources (YouTube, Twitch, Instagram, Facebook, etc.) to audio format and delivers them via Telegram, allowing users to enjoy content as podcasts without the data costs of streaming video.

## Try It Now

Use our Telegram bot: [@Telegisto_bot](https://t.me/Telegisto_bot)

Simply send a video link to the bot, and it will convert it to audio format for you to listen to like a podcast.

## Features

- Convert videos from multiple platforms to audio for podcast-like listening
- Save on mobile data by consuming audio-only content
- No need for premium subscriptions to listen to content offline
- Deliver audio files via Telegram for easy access and sharing
- Support for starting conversion from specific timestamps
- AI-enhanced audio quality for better listening experience
- Multiple subscription tiers
- Referral system

## Benefits

- **Save on Data**: Audio files are significantly smaller than video, reducing data usage
- **Listen Offline**: Access converted audio anytime without needing premium subscriptions
- **Podcast Experience**: Turn any video content into podcast-like audio for on-the-go listening
- **Battery Efficiency**: Audio playback consumes less battery than video streaming
- **Background Listening**: Continue listening while using other apps or when your screen is off

## Architecture

The application is built using a microservices architecture with the following components:

- **Telegram Bot Service**: Handles user interactions via Telegram
- **Conversion Service**: Manages the video download and audio conversion process
- **User Management Service**: Handles user authentication, subscription management
- **Web Application**: Provides a user interface for account management and subscription
- **Payment Service**: Handles payment processing

## Tech Stack

- Node.js for backend services
- Next.js for the web application
- MongoDB for data storage
- Docker and Kubernetes for containerization and orchestration
- AWS for cloud hosting
- Stripe for payment processing

## Getting Started

See the documentation in each service directory for setup instructions.

## License

MIT 