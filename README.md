# Savoury — Recipe Sharing Platform

A Node.js practical-exam project using Express, EJS, MongoDB/Mongoose, JWT authentication in an HTTP-only cookie, role-based access, multi-user recipes, comments and populated references.

## Requirements
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set your values:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/recipe_sharing
JWT_SECRET=use_a_long_random_secret_here
NODE_ENV=development
```

Start the app:

```bash
npm run dev
```

Open http://localhost:3000.

## Main features
- Register and login with bcrypt password hashing
- JWT token stored in an HTTP-only cookie; logout clears the cookie
- `attachUser`, `requireAuth`, and `requireRole` middleware
- Roles: `user` and `admin`
- Users can create, read, update and delete their own recipes
- Admins can edit/delete any recipe
- Each recipe is linked to its author; each user has a `recipes` reference array
- Comments are linked to users and recipes
- Mongoose `populate()` displays recipe authors and comment authors
- EJS views and a responsive culinary-themed stylesheet

## Important practical-exam notes
1. New accounts receive the `user` role by default. Do not allow visitors to choose `admin` during registration.
2. To promote an account to admin for testing, update that user's `role` field to `admin` in MongoDB Compass or the Mongo shell.
3. For production, add CSRF protection, rate limiting, stronger validation, secure deployment secrets, and consider using POST-only logout. The GET logout route is included only as a convenience for simple practical testing.
4. Image URL input expects a publicly accessible image URL; this starter project does not upload image files.

## Folder structure

```text
recipe-sharing-platform/
├── app.js
├── models/
│   ├── User.js
│   ├── Recipe.js
│   └── Comment.js
├── middleware/
│   ├── auth.js
│   └── asyncHandler.js
├── routes/
│   ├── authRoutes.js
│   ├── recipeRoutes.js
│   └── commentRoutes.js
├── views/
│   ├── partials/
│   │   ├── head.ejs
│   │   ├── foot.ejs
│   │   └── navbar.ejs
│   ├── recipeList.ejs
│   ├── myRecipes.ejs
│   ├── recipeForm.ejs
│   ├── recipeItem.ejs
│   ├── login.ejs
│   ├── register.ejs
│   └── error.ejs
└── public/
    └── css/
        └── style.css
```

## Main routes

| Method | URL | Purpose |
|---|---|---|
| GET | `/register` | Registration page |
| POST | `/register` | Create account |
| GET | `/login` | Login page |
| POST | `/login` | Authenticate and issue JWT cookie |
| POST | `/logout` | Clear JWT cookie |
| GET | `/recipes` | View all recipes |
| GET | `/recipes/mine` | View signed-in user's recipes |
| GET | `/recipes/new` | New recipe form |
| POST | `/recipes` | Create recipe |
| GET | `/recipes/:id` | Recipe details and comments |
| GET | `/recipes/:id/edit` | Edit form (owner/admin) |
| POST | `/recipes/:id/edit` | Update recipe (owner/admin) |
| POST | `/recipes/:id/delete` | Delete recipe (owner/admin) |
| POST | `/comments/:recipeId` | Add comment |
| POST | `/comments/:commentId/delete` | Delete own comment or admin |

**Note:** EJS files are HTML templates rendered by Express. The separate CSS file is `public/css/style.css`.
