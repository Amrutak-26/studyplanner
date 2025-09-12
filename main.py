# Import the main app from the backend directory
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'frontend', 'backend'))

from main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
