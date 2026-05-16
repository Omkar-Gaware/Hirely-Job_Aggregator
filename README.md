# Job & Internship Aggregator

## 🚀 Overview

_Hirely_ is a powerful _Chrome extension_ designed to simplify your job search. Instead of switching between multiple platforms like LinkedIn, Wellfound, and Indeed, this extension aggregates job listings in one place. With intuitive search and filter options, users can find relevant opportunities faster and apply directly. _Extensions offer quick access and seamless integration_, saving time compared to traditional websites.

## 🌟 Why Choose a Chrome Extension?

- _Instant Access_: Access job listings without opening multiple tabs.
- _Efficiency_: Easily search and filter through jobs while browsing other sites.
- _Convenience_: Receive real-time notifications about new jobs matching your preferences.
- _Seamless Application_: Apply directly with one click from the extension.

## 🧑‍💻 Tech Stack

### _Frontend_

- _HTML, CSS, JavaScript_: Create a responsive and interactive extension interface.

### _Backend_

- _Node.js & Express.js_: Efficient server management.
- _Google APIs_: Role-based job categorization.
- _Third-Party Job APIs_: Seamless integration with LinkedIn, Wellfound, and Indeed.

### _Database_

- _MongoDB_: Stores job listings and user preferences.

## 🧠 How It Works

### _1. Fetching Job Data_

- The extension connects to external job APIs.
- Job details like title, company, location, and application links are gathered.

### _2. Role-Based Categorization_

- Google APIs analyze job descriptions.
- Jobs are categorized based on keywords and relevant user roles.

### _3. Personalized User Dashboard_

- Users select their preferred roles.
- AI-powered recommendations offer the most suitable jobs.
- Clicking on a listing redirects users to the application page.

## 🛠 How to Set Up

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB account
- Cloudinary account (optional, for image uploads)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/BlueBit-Hackathon.git
cd BlueBit-Hackathon
```

#### 2. Backend Setup

```bash
cd website/backend
npm install
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### 4. Configure Environment Variables

**Backend** - Create `website/backend/config/config.env`:

```bash
cp .env.example website/backend/config/config.env
```

Edit the file and add your credentials:

- MongoDB URI
- JWT Secret
- Cloudinary credentials
- Frontend URL

**Frontend** - Create `.env.local` in `website/frontend`:

```
VITE_API_URL=http://localhost:5000
```

#### 5. Run the Application

**Backend**:

```bash
cd website/backend
npm run dev
```

**Frontend** (in a new terminal):

```bash
cd website/frontend
npm run dev
```

**Extension**:

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" and select the `Extension` folder
4. Configure API keys:
   - Copy `Extension/config.example.js` to `Extension/config.local.js`
   - Add your Google API keys, Search Engine ID, and Gemini API key
   - The extension will load these keys from Chrome storage on startup

> ⚠️ **Security**: Never commit `config.local.js` - it's in `.gitignore`

## 📦 Project Structure

```
BlueBit-Hackathon/
├── Extension/          # Chrome extension files
├── website/
│   ├── backend/       # Express.js server
│   └── frontend/      # React + Vite frontend
└── README.md
```

## 🔐 Environment Variables & API Keys

- **Backend**: See `website/backend/.env.example`
- **Frontend**: See `.env.example`
- **Extension**: See `Extension/CONFIG_SETUP.md` for secure key management

## 🚀 Deployment

Ready to deploy? Check the deployment guides for:

- **Backend**: Deploy to Heroku, Railway, or Render
- **Frontend**: Deploy to Vercel or Netlify
- **Extension**: Publish to Chrome Web Store

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Authors

BlueBit Team - Your hackathon submission

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the team.

- Create a .env file.
- Add your API keys and database credentials.

4. _Run the Application_
   sh
   npm start

5. _Add as Chrome Extension_

- Go to chrome://extensions/
- Enable _Developer mode_.
- Click on _Load unpacked_.
- Select the project folder to load the extension.

## 🤝 How to Contribute

1. _Fork the Repository_
2. _Create a New Branch_
   sh
   git checkout -b feature/your-feature

3. _Make Changes & Commit_
   sh
   git commit -m "Add your feature"

4. _Submit a Pull Request_

## 📝 License

This project is licensed under the _MIT License_.

---

## 🖼 Interface Screenshots

### _1. Extension Popup_

![image](https://github.com/user-attachments/assets/31a67bd9-ef5c-4041-878d-28abbd92152a)
![image](https://github.com/user-attachments/assets/f2996538-8790-4653-805b-50331120b0cc)

### _2. Job Search Results_

![image](https://github.com/user-attachments/assets/6f458cbb-84c5-411c-809b-49445c70bb00)

### _3. Role-Based Recommendations_

![image](https://github.com/user-attachments/assets/39ab20c2-d277-491e-b4dc-06250c7453b8)
![image](https://github.com/user-attachments/assets/01e6ba70-9a21-42ff-a5ce-ccc1df03da05)

### _4. Job Details_

![image](https://github.com/user-attachments/assets/5e448534-f51b-4631-89f5-13ed480b8e17)
