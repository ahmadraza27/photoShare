📸 PhotoShare

PhotoShare is a full-stack, cloud-native photo-sharing platform (Instagram clone) designed for both creators and consumers. It allows users to discover, upload, rate, and engage with stunning visual content. Built with a modern React.js frontend and a robust Django REST Framework backend, the entire platform is deployed securely on Microsoft Azure.
🌟 Key Features
🎭 Role-Based Access Control
<img width="1829" height="957" alt="Screenshot from 2026-01-05 15-57-26" src="https://github.com/user-attachments/assets/4b26e436-6683-4caf-a914-61517a5dd825" />
<img width="1829" height="957" alt="Screenshot from 2026-01-05 16-00-36" src="https://github.com/user-attachments/assets/30523a42-38b9-426e-bcd3-2c5145e91a3a" />

    For Creators: Dedicated upload dashboards, photo metadata management (titles, captions, locations), and performance tracking.
<img width="1829" height="957" alt="Screenshot from 2026-01-05 15-58-38" src="https://github.com/user-attachments/assets/fc41c68e-f223-4b55-904c-7dcf585f0123" />

    For Consumers: Global community access to discover, rate, and comment on amazing photography.

🖼️ Core Functionality

    Visual Gallery: Browse trending and latest photos with an infinite-scroll style feed.
    <img width="1829" height="957" alt="Screenshot from 2026-01-05 16-13-58" src="https://github.com/user-attachments/assets/3fa997c0-6046-4b48-b8cd-824796b62194" />


    Advanced Search & Filtering: Search for specific creators or keywords, and filter results by relevance, rating, or view count.
<img width="1829" height="957" alt="Screenshot from 2026-01-05 16-35-54" src="https://github.com/user-attachments/assets/445b6cd6-ba10-4095-891f-357616be7b23" />

    Photo Interactions: View, rate (out of 5 stars), comment, share, and download images.
<img width="1829" height="957" alt="Screenshot from 2026-01-05 16-43-48" src="https://github.com/user-attachments/assets/6a1ce4a6-8c00-4da7-ac5f-d0f9f2bd9032" />

    Seamless Uploads: Easy-to-use photo upload portal supporting location tagging and instant publishing.

💻 Tech Stack
Frontend

    Framework: React.js

    Hosting: Azure Storage / Azure Static Web Apps (frontendstorage12.z38.web.core.windows.net)

Backend

    Framework: Python, Django 5.0.1, Django REST Framework (DRF)

    Authentication: Token-based Auth (rest_framework.authtoken) with a Custom User Model.

    Database: PostgreSQL hosted on Azure.

    Media Storage: Azure Blob Storage (django-storages package).

    Hosting: Azure App Service (student-django-api-...azurewebsites.net).

🚀 Getting Started (Local Development)

Follow these instructions to set up the backend environment on your local machine.
Prerequisites

    Python 3.10+

    Node.js & npm (for the React frontend)

    PostgreSQL (or fallback to SQLite for local-only testing)

    An Azure Storage Account (for media uploads)

Backend Setup

1. Clone the repository:
Bash

git clone https://github.com/your-username/PhotoShare.git
cd PhotoShare/backend

2. Create and activate a virtual environment:
Bash

python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

3. Install dependencies:
Bash

pip install -r requirements.txt

4. Set up Environment Variables:
Create a .env file in your root backend directory and configure the following variables (matching the settings.py expectations):
Code snippet

DEBUG=True
SECRET_KEY=your_django_secret_key
# Database
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
# Azure Blob Storage
AZURE_ACCOUNT_NAME=your_azure_storage_name
AZURE_ACCOUNT_KEY=your_azure_storage_key

5. Apply Migrations:
Bash

python manage.py makemigrations
python manage.py migrate

6. Create a Superuser:
Bash

python manage.py createsuperuser

7. Run the backend server:
Bash

python manage.py runserver

The API will be available at http://127.0.0.1:8000/.
Frontend Setup

(Assuming your React code is in a frontend folder)

1. Navigate to the frontend directory:
Bash

cd ../frontend

2. Install node modules:
Bash

npm install

3. Start the development server:
Bash

npm start

The React app will typically run on http://localhost:3000/. Ensure your frontend environment variables point to http://localhost:8000 for API calls during development.
