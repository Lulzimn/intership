# Therapy Internship

Monorepo per projektin e praktikes me dy pjese kryesore:

- `Frontend` - React + Vite aplikacioni i klientit
- `Backend` - hapesire per API dhe logjike server-side

## Struktura e projektit

```text
Therapy Internship/
├── Backend/
└── Frontend/
```

## Nisja e Frontend

Kerkohet `Node.js 18+`.

```bash
cd Frontend
npm install
npm run dev
```

Aplikacioni starton ne `http://localhost:5173`.

## Rrugat kryesore ne aplikacion

- `/` - Home
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Dashboard
- `/register` - Register form

## Komanda te dobishme

```bash
cd Frontend
npm run dev      # zhvillim lokal
npm run build    # build production
npm run preview  # preview i build-it
npm run lint     # lint kontroll
```

## Git workflow i rekomanduar

```bash
git checkout -b feat/<emri-i-ndryshimit>
git add .
git commit -m "feat: pershkrim i shkurter"
git push -u origin feat/<emri-i-ndryshimit>
```

Pastaj hapet Pull Request drejt branch-it `main`.
