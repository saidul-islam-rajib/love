# Marriage Proposal App 💍

A beautiful, interactive marriage proposal application with Google OAuth authentication, email notifications, and admin dashboard.

## Features

- 🔐 **Google OAuth Authentication** - Users must sign in with Google (FREE)
- 💕 **Interactive Proposal** - "Yes/No" buttons with moving "No" button
- 📧 **Email Notifications** - Automatic email alerts when someone says "Yes"
- 📊 **Admin Dashboard** - View all responses with user details and analytics
- ⚙️ **Admin Configuration** - Customize title, description, and success messages
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- 🎉 **Celebration Animation** - Beautiful success animation with confetti

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Google OAuth Setup (FREE)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Copy the Client ID and Client Secret

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google OAuth (Required)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here

# Email Configuration (Optional - for real email sending)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM=your-verified-sender@example.com
TO_EMAIL=recipient@example.com
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000`

## How It Works

1. **User Experience:**
   - User visits the site and is prompted to sign in with Google
   - After authentication, they see the proposal question
   - "No" button moves away when they try to click it
   - "Yes" button triggers celebration and sends notification

2. **Admin Features:**
   - Access admin at `/admin` (username: `rajib1983`, password: `AdminRajib@123#`)
   - View all responses with user details, location, and device info
   - Configure proposal text and success messages at `/admin/config`

3. **Data Collection:**
   - User's Google profile (name, email, photo)
   - IP-based location (city, country)
   - GPS location (with permission)
   - Device and browser information
   - Timestamp of response

## Email Configuration (Optional)

If you want to send real emails instead of just logging:

1. Sign up for [SendGrid](https://sendgrid.com) (free tier available)
2. Get your API key and verify a sender email
3. Add the credentials to your `.env.local` file

Without SendGrid, all notifications are logged to `sent-emails.log` file.

## Admin Access

- **URL:** `/admin`
- **Username:** `rajib1983`
- **Password:** `AdminRajib@123#`

## File Structure

```
├── app/
│   ├── admin/           # Admin dashboard and configuration
│   ├── api/             # API routes (auth, email, logs, config)
│   ├── auth/            # Authentication pages
│   ├── page.tsx         # Main proposal page
│   └── layout.tsx       # Root layout with providers
├── public/              # Static assets
└── .env.example         # Environment variables template
```

## Customization

Use the admin configuration panel at `/admin/config` to customize:
- Proposal title and description
- Success celebration messages
- Email recipient address

## Security Notes

- Google OAuth handles all user authentication securely
- Admin credentials are hardcoded (change in production)
- All user data is logged locally in files
- No database required - uses file-based storage

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update Google OAuth redirect URIs to include your production domain

### Other Platforms

Make sure to:
- Set all environment variables
- Update `NEXTAUTH_URL` to your production domain
- Update Google OAuth redirect URIs

## Support

For issues or questions, check the code comments or create an issue in the repository.

---

Made with 💕 for special moments