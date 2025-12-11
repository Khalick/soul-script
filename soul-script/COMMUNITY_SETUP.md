# Community Feature Setup Guide

## Overview
The Anonymous Community feature allows users to share journal entries anonymously, support others with "echoes" (likes), and discover posts through hashtags. Users remain completely anonymous while sharing their emotional journeys.

## Database Setup

### Prerequisites
- Supabase project set up
- Admin access to Supabase dashboard

### Step 1: Run SQL Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `community-schema.sql` from the project root
4. Copy and paste the entire contents into the SQL editor
5. Click **Run** to execute

This creates:
- `community_posts` table for shared entries
- `post_echoes` table for reactions/likes
- Indexes for performance optimization
- Row Level Security (RLS) policies
- Triggers for automatic echo count updates

### Step 2: Verify Tables

Go to **Table Editor** and confirm these tables exist:
- `community_posts`
- `post_echoes`

### Step 3: Test RLS Policies

The following policies should be active:

**community_posts:**
- ✅ Anyone can view public posts
- ✅ Users can view own posts (including semi-private)
- ✅ Users can create posts
- ✅ Users can update own posts
- ✅ Users can delete own posts

**post_echoes:**
- ✅ Anyone can view echoes
- ✅ Users can echo posts
- ✅ Users can remove own echoes

## Features Included

### 1. Community Feed
- **Location:** Navigation → Community (👥 icon)
- **Features:**
  - View public posts from all users
  - Filter by Recent or Trending
  - Search by hashtags
  - Anonymous usernames
  - Mood emoji displays
  - Intensity ratings
  - Time ago timestamps

### 2. Post Sharing
- **Trigger:** After saving a journal entry
- **Flow:**
  1. Save entry → Affirmation modal
  2. Close affirmation → Share modal appears
  3. Choose visibility (Public / Semi-Private)
  4. Edit snippet (max 500 chars)
  5. Add custom hashtags
  6. Preview before sharing
  
- **Options:**
  - **Public:** Visible to everyone (logged in or not)
  - **Semi-Private:** Only logged-in users can see
  - **Auto-fill:** Extract first 280 characters from entry
  - **Hashtags:** In-text (#Gratitude) or custom comma-separated

### 3. Echo Reactions
- **What it is:** Like/support button (not called "likes" for mental health sensitivity)
- **Features:**
  - Click heart icon to echo
  - See total echo count
  - Heart fills in user's favoriteColor when echoed
  - Automatic count updates via database triggers

### 4. Hashtag System
- **Discovery:** Click any hashtag to filter posts
- **In-text hashtags:** Automatically detected from snippet text
- **Custom hashtags:** Add during sharing (comma-separated)
- **Popular tags:** #Gratitude, #Anxiety, #Hope, #Healing, #BadDay

## User Flow Examples

### Sharing a Post
```
1. Write journal entry
2. Click "Save Entry" 
3. Affirmation appears: "Thank you for being honest..."
4. Click "Continue" 
5. Share modal appears
6. Select "Public" visibility
7. Click "Auto-fill from entry"
8. Add hashtags: "Gratitude, Hope"
9. Preview looks good
10. Click "Share with Community"
11. Post now visible in Community feed
```

### Supporting Others
```
1. Navigate to Community
2. Browse posts (Recent/Trending)
3. Read someone's story about anxiety
4. Click heart icon to echo
5. Echo count increases
6. Heart fills with color
```

### Finding Similar Experiences
```
1. See post with #Anxiety hashtag
2. Click #Anxiety tag
3. View all posts with that tag
4. Read others' experiences
5. Echo posts that resonate
```

## Privacy & Safety

### Anonymous Usernames
All posts show "Anonymous" instead of real names. User identity is completely protected.

### No Personal Data Exposed
Posts only show:
- Mood emoji
- Intensity rating
- Text snippet (user-edited)
- Hashtags
- Echo count
- Time ago

### Visibility Controls
- **Public:** Anyone can see (guest users too)
- **Semi-Private:** Requires login to view

### User Can Manage Own Posts
Via RLS policies, users can:
- Update their posts
- Delete their posts
- Only see their own semi-private posts

## Technical Details

### Component Architecture
- **Community.tsx** - Main feed with filters and search
- **SharePostModal.tsx** - Post creation from journal entry
- **community-schema.sql** - Database schema and policies

### State Management
No new stores needed - uses Supabase directly for real-time data.

### Performance Optimizations
- Indexes on:
  - `visibility` (for public/private filtering)
  - `created_at` (for sorting by recent)
  - `mood` (for mood-based filtering - future feature)
  - `hashtags` (GIN index for array searching)
- Limit 50 posts per query
- Efficient echo count updates via triggers

### Real-time Features
- Manual refresh (pull-down) to see new posts
- Instant echo count updates
- No polling - on-demand loading

## Troubleshooting

### "Failed to share post"
- Check Supabase connection
- Verify RLS policies are enabled
- Check browser console for errors
- Ensure user is authenticated

### Posts not appearing
- Verify `visibility = 'public'` in query
- Check RLS policies
- Ensure posts exist in `community_posts` table

### Echo count not updating
- Verify triggers are installed: `update_echo_count_on_insert`, `update_echo_count_on_delete`
- Check `post_echoes` table for records
- Re-run trigger creation from SQL file

### Hashtags not working
- Verify GIN index exists on `hashtags` column
- Check hashtag format: must start with # and be alphanumeric
- Case-sensitive search

## Future Enhancements (Not Yet Implemented)

Potential additions:
- 📸 Share images/videos with posts (requires Storage policies)
- 💬 Comments on posts
- 🔔 Notifications for echoes
- 🏆 Top contributors badge
- 🎯 Mood-based filtering (show only "Happy" posts)
- 🌍 Geographic tags (optional city/country)
- 🔗 Direct links to specific posts
- 📊 Community analytics (most echoed posts)

## Support

For issues or questions:
1. Check console errors (F12 → Console)
2. Verify SQL schema applied correctly
3. Test RLS policies in Supabase dashboard
4. Ensure Supabase URL and anon key are correct in `supabase.ts`

---

**Status:** ✅ Feature Complete and Ready for Testing
**Database Required:** Yes - Run `community-schema.sql` first
**Breaking Changes:** None - Additive feature only
