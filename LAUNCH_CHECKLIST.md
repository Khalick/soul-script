# Soul Script - Launch Checklist

Use this checklist to ensure everything is set up correctly before deploying.

## ✅ Pre-Launch Checklist

### 1. Supabase Setup
- [ ] Created Supabase account
- [ ] Created new project
- [ ] Executed `supabase-schema.sql` in SQL Editor
- [ ] Created `journal-media` storage bucket (private)
- [ ] Created `avatars` storage bucket (public)
- [ ] Configured storage policies
- [ ] Copied Project URL
- [ ] Copied anon public key

### 2. Local Configuration
- [ ] Created `.env` file from `.env.example`
- [ ] Added `VITE_SUPABASE_URL` to `.env`
- [ ] Added `VITE_SUPABASE_ANON_KEY` to `.env`
- [ ] Ran `npm install`
- [ ] Tested `npm run dev`
- [ ] App loads at localhost:5173
- [ ] No console errors

### 3. Functionality Testing
- [ ] Sign up works
- [ ] Sign in works
- [ ] Emotion check-in displays correctly
- [ ] Can select emotion and intensity
- [ ] Tags can be added
- [ ] Journal editor opens
- [ ] Text entry works
- [ ] Photo upload works
- [ ] Video upload works
- [ ] Entry saves successfully
- [ ] Timeline displays entries
- [ ] Calendar shows mood indicators
- [ ] Can view entry details
- [ ] Logout works

### 4. Build & Production
- [ ] Ran `npm run build` successfully
- [ ] No build errors
- [ ] Tested `npm run preview`
- [ ] Production build works locally
- [ ] PWA manifest generated
- [ ] Service worker created

### 5. Deployment Preparation
- [ ] Chose hosting platform (Vercel/Netlify/Cloudflare)
- [ ] Created account on hosting platform
- [ ] Prepared custom domain (optional)
- [ ] Environment variables ready to add
- [ ] Git repository initialized
- [ ] Code committed to Git

### 6. Post-Deployment
- [ ] App deployed successfully
- [ ] HTTPS working
- [ ] Environment variables set
- [ ] Database connection working
- [ ] Can sign up on live site
- [ ] Can create entries on live site
- [ ] Media upload works on live site
- [ ] PWA installable on mobile

### 7. Mobile App (Optional)
- [ ] Decided on APK method (PWA Builder/Capacitor/TWA)
- [ ] Generated APK successfully
- [ ] Tested APK on Android device
- [ ] App opens correctly
- [ ] All features work in APK

### 8. Documentation
- [ ] Read README.md
- [ ] Reviewed SETUP_GUIDE.md
- [ ] Checked DEPLOYMENT.md
- [ ] Understood PROJECT_SUMMARY.md

### 9. Performance
- [ ] Lighthouse score tested
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] PWA score = 100

### 10. Security
- [ ] RLS policies enabled in Supabase
- [ ] Storage policies configured
- [ ] Environment variables not in Git
- [ ] HTTPS enforced
- [ ] No sensitive data exposed

## 🚀 Deployment Steps

### Quick Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### Quick Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Add environment variables in Netlify dashboard
```

## 📱 APK Generation

### Option 1: PWA Builder (5 minutes)
1. Deploy app to live URL
2. Go to pwabuilder.com
3. Enter your URL
4. Click "Package For Stores"
5. Select Android
6. Download APK

### Option 2: Capacitor (30 minutes)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npm run build
npx cap add android
npx cap open android
# Build in Android Studio
```

## 🎯 Success Metrics

After launch, monitor:
- [ ] User signups per day
- [ ] Daily active users
- [ ] Entries created per day
- [ ] Average session duration
- [ ] Database size growth
- [ ] Storage usage
- [ ] Error rates
- [ ] Page load times

## 🆘 Troubleshooting

### App won't start
- Check Node.js version (18.19.1+)
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Build fails
- Check for TypeScript errors
- Ensure all imports are correct
- Verify Tailwind config

### Supabase connection fails
- Verify credentials in `.env`
- Check project is not paused
- Test with Supabase dashboard

### Media upload fails
- Check storage buckets exist
- Verify storage policies
- Check file size limits
- Verify correct bucket names

### APK won't install
- Enable "Install from unknown sources"
- Check Android version (5.0+)
- Use signed APK for production

## 📞 Support Resources

- **Supabase**: https://supabase.com/docs
- **Vercel**: https://vercel.com/docs
- **Vite**: https://vitejs.dev
- **React**: https://react.dev
- **Tailwind**: https://tailwindcss.com

## 🎉 You're Ready!

Once all checkboxes above are complete, you're ready to launch Soul Script and start helping people with their emotional wellness journey!

---

**Remember**: Start small, iterate fast, and listen to your users. 💝

Good luck with your launch! 🚀
