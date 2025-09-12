# Study Planner Backend Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Backend Deployment on Render

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Configure the following settings:**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.9+

4. **Set Environment Variables:**
   - `HF_TOKEN`: Your Hugging Face API token (optional - fallback plan will work without it)

### 2. Frontend Deployment on Render

1. **Create a new Static Site on Render**
2. **Connect your GitHub repository**
3. **Configure the following settings:**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

### 3. Test Your Deployment

1. **Test Backend**: Visit `https://your-backend-url.onrender.com/health`
2. **Test Frontend**: Visit `https://your-frontend-url.onrender.com`
3. **Check Connection**: Look for "Connected ✅" in the frontend header

## 🔧 Troubleshooting

### Backend Issues:
- Check Render logs for errors
- Ensure `requirements.txt` is in the backend folder
- Verify environment variables are set

### Frontend Issues:
- Check browser console for errors
- Verify backend URL is correct
- Test backend endpoints directly

### CORS Issues:
- Backend is configured to allow all origins
- If still having issues, check Render logs

## 📁 File Structure

```
frontend/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── start.sh            # Startup script
│   └── test_connection.html # Connection test tool
└── src/
    └── App.js              # React frontend
```

## 🧪 Testing

Use the `test_connection.html` file to test your backend:
1. Open the file in your browser
2. Click the test buttons
3. Check the results

## 📞 Support

If you're still having issues:
1. Check Render deployment logs
2. Test backend endpoints directly
3. Verify environment variables
4. Check browser console for errors
