# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Fishing App Membership Levels

## 1. Non-members (Not registered)

Non-members have very limited access. They can only see a tiny bit of what registered users can.

- **Map**: Can only see basic fish catch info made available by admin. No search function.
- **Fish Catch Record**: Can view basic fishing info. Cannot post catches, take pictures, or see personal map.
- **Shopping Mall**: Can browse and make purchases.
- **My Information**: Can access but will be prompted to register.
- **Events**: Cannot participate in any events.

## 2. Free Members (Registered but not paying)

Free members have more access than non-members, but still have some limitations.

- **Map**: Can see more fish catch info than non-members. Search limited to posts from the past week.
- **Fish Catch Record**: Can post catches, take pictures in-app, and have a personal map. Search limited to posts from the past week.
- **Points**: Earn 100 points for making a private post public (subject to change).
- **Shopping Mall & My Information**: Full access.
- **Events**: Cannot participate in "This month's carp" event or other special events.

## 3. Paid Members (Monthly or yearly subscription)

Paid members get the full experience without any restrictions.

- **Map**: Full access to all fish catch info. Unrestricted search capabilities.
- **Fish Catch Record**: Full access to post, take pictures, use personal map, and search any post.
- **Points**: Earn 1,000 points for making a private post public (subject to change).
- **Shopping Mall & My Information**: Full access.
- **Events**: Can participate in all events.

## 4. Gold Members (100 selected paid members)

Gold members are special paid members who get extra benefits.

- All benefits of regular paid members
- Monthly bonus of 100,000 points

## 5. Supporters (10 selected paid members)

Supporters are the top-tier members with the most benefits.

- All benefits of regular paid members
- Monthly bonus of 1,000,000 points

---

## Things to do & Some doubts

- [✅] Make Watermark text bigger (Mainpage)

- [✅] Marker issue with color and changing to default color (Mainpage)

- [✅] If user is not logged in then can that user capture the image ?

- [ ? ] Need korean translation for main page tabs, fish catch record search tabs

- [ ? ] So they are saying taking pictures has fixed ratio ? What is the ratio ?

- [✅]Main page public posts need to show on the basis of the current location

- [✅] Fix the records posts are not visible at first after refresh they are visible

- [✅] If user becomes the gold or supporter does he receives the points instantly because he became the gold/supporter or does he receive that points after the one month

- [ ] Now when user sends the message from the inbox that message where can admin see it ?

- [ ] Does admin has access to delete the posts user created ?

- [ ] Need payment api

- [ ] Need korean translation of everything to implement in the korea

- [ ] Need to make video of the admin section

- [ ] In dashboard the points paid and points used are not showing the correct values those are just demo values. Need to fix it
