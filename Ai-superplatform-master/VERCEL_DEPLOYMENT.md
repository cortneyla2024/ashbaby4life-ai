# Vercel Deployment Guide for Hope: The Steward

This guide will walk you through deploying the Hope: The Steward AI platform to Vercel with all necessary configurations.

## 🚀 Quick Deploy

### Option 1: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project root**
   ```bash
   cd Ai-superplatform-master
   vercel
   ```

### Option 2: Deploy via GitHub

1. **Push your code to GitHub**
2. **Connect repository to Vercel**
3. **Configure environment variables**
4. **Deploy automatically**

## 📋 Prerequisites

### Required Services

1. **PostgreSQL Database**
   - [Neon](https://neon.tech) (Recommended for Vercel)
   - [Supabase](https://supabase.com)
   - [PlanetScale](https://planetscale.com)
   - Or any PostgreSQL provider

2. **Ollama Setup** (For AI processing)
   - Self-hosted Ollama server
   - Or use cloud Ollama services

3. **Authentication Provider** (Optional)
   - Google OAuth
   - GitHub OAuth
   - Email/Password (built-in)

## ⚙️ Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://your-domain.vercel.app"

# AI Configuration
OLLAMA_BASE_URL="https://your-ollama-server.com"
OLLAMA_MODEL="llama2"

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

# Optional: External AI Provider (fallback)
OPENAI_API_KEY="your-openai-key"
GEMINI_API_KEY="your-gemini-key"

# Optional: Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Optional: File Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Vercel Environment Variables

Set these in your Vercel dashboard:

1. Go to your project in Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable from the list above

**Important**: Set `NEXTAUTH_SECRET` to a strong random string:
```bash
openssl rand -base64 32
```

## 🗄️ Database Setup

### Option 1: Neon (Recommended)

1. **Create Neon account** at [neon.tech](https://neon.tech)
2. **Create new project**
3. **Copy connection string**
4. **Set as `DATABASE_URL` in Vercel**

### Option 2: Supabase

1. **Create Supabase account** at [supabase.com](https://supabase.com)
2. **Create new project**
3. **Go to Settings → Database**
4. **Copy connection string**
5. **Set as `DATABASE_URL` in Vercel**

### Database Migration

After setting up the database:

1. **Install Prisma CLI**
   ```bash
   npm install -g prisma
   ```

2. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

3. **Push schema to database**
   ```bash
   npx prisma db push
   ```

4. **Seed database** (optional)
   ```bash
   npx prisma db seed
   ```

## 🤖 AI Setup

### Option 1: Self-hosted Ollama

1. **Deploy Ollama server** (VPS, Railway, Render, etc.)
2. **Install and run Ollama**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ollama serve
   ```

3. **Pull required models**
   ```bash
   ollama pull llama2
   ollama pull codellama
   ```

4. **Set `OLLAMA_BASE_URL`** to your server URL

### Option 2: Cloud Ollama Services

- **Railway**: Deploy Ollama on Railway
- **Render**: Deploy Ollama on Render
- **DigitalOcean**: Deploy on Droplet

### Option 3: External AI Providers

If you can't run Ollama, use external providers:

```env
# Set these instead of OLLAMA_BASE_URL
OPENAI_API_KEY="your-openai-key"
GEMINI_API_KEY="your-gemini-key"
```

## 🔧 Build Configuration

### Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "functions": {
    "apps/web/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Next.js Configuration

Ensure `apps/web/next.config.mjs` is configured:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  images: {
    domains: ['your-image-domain.com']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

## 🚀 Deployment Steps

### Step 1: Prepare Repository

1. **Ensure all files are committed**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verify package.json scripts**
   ```json
   {
     "scripts": {
       "build": "cd apps/web && next build",
       "start": "cd apps/web && next start",
       "dev": "cd apps/web && next dev"
     }
   }
   ```

### Step 2: Deploy to Vercel

1. **Connect repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Set environment variables**
   - Add all required environment variables
   - Ensure `NEXTAUTH_URL` matches your domain

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Step 3: Post-Deployment

1. **Verify deployment**
   - Check all pages load correctly
   - Test authentication flow
   - Verify API endpoints work

2. **Set up custom domain** (optional)
   - Go to Settings → Domains
   - Add your custom domain
   - Update DNS records

3. **Configure monitoring**
   - Set up Vercel Analytics
   - Configure error tracking
   - Set up performance monitoring

## 🔍 Troubleshooting

### Common Issues

#### Build Failures

1. **Prisma Client Generation**
   ```bash
   # Add to build script in package.json
   "build": "prisma generate && next build"
   ```

2. **Missing Dependencies**
   ```bash
   # Ensure all dependencies are in package.json
   npm install --save-dev @types/node
   ```

#### Runtime Errors

1. **Database Connection**
   - Verify `DATABASE_URL` is correct
   - Check database is accessible
   - Ensure Prisma schema is up to date

2. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches domain
   - Ensure OAuth providers are configured

3. **AI Service Errors**
   - Verify Ollama server is running
   - Check `OLLAMA_BASE_URL` is accessible
   - Ensure required models are installed

### Debug Commands

```bash
# Check build logs
vercel logs

# Check function logs
vercel logs --function=api/route

# Redeploy with debug info
vercel --debug

# Check environment variables
vercel env ls
```

## 📊 Performance Optimization

### Vercel Optimizations

1. **Enable Edge Functions**
   ```javascript
   export const runtime = 'edge'
   ```

2. **Use ISR for static pages**
   ```javascript
   export async function generateStaticParams() {
     return [{ slug: 'page' }]
   }
   ```

3. **Optimize images**
   ```javascript
   import Image from 'next/image'
   
   <Image
     src="/image.jpg"
     alt="Description"
     width={500}
     height={300}
     priority
   />
   ```

### Database Optimizations

1. **Add indexes**
   ```sql
   CREATE INDEX idx_user_email ON "User"(email);
   CREATE INDEX idx_transaction_date ON "Transaction"(date);
   ```

2. **Use connection pooling**
   ```env
   DATABASE_URL="postgresql://user:pass@host:port/db?connection_limit=5&pool_timeout=0"
   ```

## 🔒 Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable HTTPS only
- [ ] Configure CSP headers
- [ ] Set up monitoring and alerts
- [ ] Regular security updates
- [ ] Database backup strategy

## 📈 Monitoring & Analytics

### Vercel Analytics

1. **Enable Vercel Analytics**
   - Go to Settings → Analytics
   - Enable Web Analytics
   - Add tracking code to your app

2. **Set up error tracking**
   - Integrate Sentry or similar
   - Monitor API errors
   - Track performance metrics

### Health Checks

Create health check endpoints:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return Response.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy',
      error: error.message 
    }, { status: 500 })
  }
}
```

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📞 Support

If you encounter issues:

1. **Check Vercel documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Review build logs**: Use `vercel logs`
3. **Test locally**: Ensure app works with `npm run dev`
4. **Check environment variables**: Verify all required vars are set
5. **Database connectivity**: Test database connection separately

## 🎉 Success!

Once deployed, your Hope: The Steward platform will be available at your Vercel domain. Users can:

- Register and authenticate
- Access mental health tools
- Manage finances
- Track learning progress
- Use AI companion features
- Access all life management modules

Remember to:
- Monitor performance and errors
- Keep dependencies updated
- Backup your database regularly
- Test all features after deployment

---

**Happy deploying! 🚀**

Your benevolent AI companion is now ready to serve humanity.
