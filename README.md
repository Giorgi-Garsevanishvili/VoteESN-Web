# 📮 VoteESN Web Client

**VoteESN** is a secure and lightweight digital voting platform tailored for ESN (Erasmus Student Network) sections and other small to mid-scale organizations or NGOs.  
This is the **frontend interface**, built with Vanilla JavaScript and integrated with the [VoteESN API](https://github.com/Giorgi-Garsevanishvili/VoteESN-API).

---

## 🌍 Who Can Use It?

- ESN sections (e.g., Riga, Jelgava, Valmiera)
- NGOs and small to medium-sized organizations
- Self-hosted or via a hosted solution

---

## 🎯 Key Features

- 🛠️ **Admin panel** for managing elections, creating one-time tokens, and sending them via QR/email.
- 🗳️ **Voter interface** for secure, token-based, anonymous voting.
- 📍 Automatic section-based user assignment.
- 📱 Mobile-ready, QR scanning, and smart device/browser detection.
- ⚡ Lightweight frontend with **no framework** dependencies.

---

## 👥 User Roles

| Role   | Description                                                                 |
|--------|-----------------------------------------------------------------------------|
| Admin  | Create/manage elections, generate/send tokens, manage users, set IP rules. |
| Voter  | Use a one-time token to vote on a designated election.                     |

---

## 🧱 Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Deployment:** Netlify
- **Backend API:** [VoteESN API](https://github.com/Giorgi-Garsevanishvili/VoteESN-API)

---

## 📁 Folder Structure

```plaintext
📁 VOTEESN-WEB/
 ├── 📁 admin/                 # Admin panel scripts
 │   └── dashboard.js         # Admin logic for election and token management
 ├── 📁 auth/                  # Authentication logic
 │   ├── login.js
 │   └── logout.js
 ├── 📁 img/                   # Icons and images
 ├── 📁 lib/                   # NPM modules for deployed version
 ├── 📁 src/
 │   ├── 📁 api/               # Handles communication with backend API
 │   ├── 📁 font/              # Fonts used in reports or views
 │   ├── 📁 css/               # Stylesheets
 │   ├── 📁 utils/             # Status and error display logic
 │   └── 📁 views/             # All HTML views (except login.html)
 ├── 📄 _redirect              # Netlify routing rules
 ├── 📄 login.html             # Main entry (acts as index.html)
 └── 📄 README.md
```

---

## 🚀 Deployment

This project can be deployed to platforms like **Netlify** or any static hosting provider.  
Make sure to configure your `_redirect` file for SPA routing (if needed).

---

## 📄 License

This project is under a custom proprietary license.  
You may **not** use, copy, modify, or distribute any part of this software without **explicit permission** from the copyright holder.

For permissions, please contact: **George.Garsevanidi@gmail.com**  
See the LICENSE file for full details.

---

Developed & maintained by [@Giorgi-Garsevanishvili](https://github.com/Giorgi-Garsevanishvili)
