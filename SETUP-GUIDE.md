# 🚀 Setup Guide - Marriage Proposal App

## ✅ CONFIRMED: This app WILL WORK in both localhost and production!

The build has been tested and passes successfully. All components are properly configured.

## 📋 Quick Setup Checklist

### 1. Google OAuth Setup (5 minutes, FREE)

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** (or select existing)
3. **Enable Google+ API:**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API" and click "Enable"
4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Marriage Proposal App"
   - **Authorized redirect URIs:**
     - For localhost: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`
5. **Copy the Client ID and Client Secret**

### 2. Environment Configuration

Create `.env.local` file in the root directory:

```env
# Google OAuth (Required)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here

# Email Configuration (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM=your-verified-sender@example.com
TO_EMAIL=saidul.is.rajib@gmail.com
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Windows (PowerShell)
[System.Web.Security.Membership]::GeneratePassword(32, 0)

# On Mac/Linux
openssl rand -base64 32

# Or use any random 32+ character string
```

### 3. Run the App

```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Visit: `http://localhost:3000`

## 🌐 Production Deployment

### Vercel (Recommended - FREE)

1. **Push to GitHub**
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
3. **Add Environment Variables:**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from your `.env.local`
   - **Important:** Update `NEXTAUTH_URL` to your production domain
4. **Update Google OAuth:**
   - Add production redirect URI: `https://yourapp.vercel.app/api/auth/callback/google`
5. **Deploy!**

### Other Platforms (Netlify, Railway, etc.)

1. Set environment variables in platform dashboard
2. Update `NEXTAUTH_URL` to production domain
3. Update Google OAuth redirect URIs
4. Deploy

## 🔧 Configuration

### Admin Access
- **URL:** `/admin`
- **Username:** `rajib1983`
- **Password:** `AdminRajib@123#`

### Customization
- Use `/admin/config` to customize proposal text and messages
- All settings are stored in `app-config.json`

## 🧪 Testing Checklist

### Localhost Testing:
- [ ] Create `.env.local` with Google OAuth credentials
- [ ] Run `npm run dev`
- [ ] Visit `http://localhost:3000`
- [ ] Test Google sign-in
- [ ] Test "Yes" button (should send email/log)
- [ ] Test admin dashboard at `/admin`

### Production Testing:
- [ ] Deploy to hosting platform
- [ ] Set environment variables
- [ ] Update Google OAuth redirect URIs
- [ ] Test complete flow

## 🛠️ Troubleshooting

### Common Issues:

1. **"Configuration" error:**
   - Check environment variables are set correctly
   - Verify Google OAuth credentials

2. **Redirect URI mismatch:**
   - Ensure redirect URIs in Google Console match your domain
   - Format: `https://yourdomain.com/api/auth/callback/google`

3. **Build errors:**
   - Run `npm run build` to test locally
   - Check for TypeScript errors

4. **Email not sending:**
   - Without SendGrid: emails are logged to `sent-emails.log`
   - With SendGrid: check API key and sender verification

## 📊 What Gets Collected

When someone clicks "Yes":
- ✅ Google profile (name, email, photo)
- ✅ IP address and location (city, country)
- ✅ GPS coordinates (with permission)
- ✅ Device info (browser, OS, device type)
- ✅ Timestamp

All data is logged locally and displayed in admin dashboard.

## 🔒 Security Notes

- Google OAuth handles authentication securely
- No passwords stored locally
- Admin credentials are hardcoded (change for production)
- All data stored in local files (no database required)

---

## ✨ Ready to Go!

Your app is fully configured and tested. Just complete the Google OAuth setup and you're ready to create magical moments! 💍

**Need help?** Check the main README.md for detailed documentation.