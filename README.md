# Penify

Penify is an open source, cost free, self hostable blog platform which was featured on [Product Hunt](https://www.producthunt.com/products/penify#penify). Initially was built for collaboration with other bloggers but now you can use it for your personal blog.

## How to use Penify

Penify is built with [Next.js](https://nextjs.org). To run it you can clone or download the repository and run the following command:

```bash
yarn install
```

After that check the .env.example file which you can copy pase and rename to .env

You have to fill the not commented variables. All instructions will you find above the variables.

If you filled out the env envirements then push your DB schema to your Postgress DB.

```bash
yarn run db:push
```

After that you should be able to run dev mode and build mode for production

```bash
yarn run dev

Or for production

yarn run build
yarn run start
```

I recommend to host your blog on [Vercel](https://vercel.com) because it's free and easy to use but you can use your own server or any other hosting provider.

As already mention above, Penify was mainly used for collaboration, it means that the authentication is public. If you want to use it only for yourself with restricted access to the admin panel you have to firstly register with email and password credentials. Then set in your DB your account Role to ADMIN. After that remove register-popup.tsx file from project and in login-popup.tsx file remove the register button and your are good to go.

If you are using Neon DB then setting the role is very easy. Just go to your Neon console, select Tables, select Users table and then set Role to ADMIN for your account.

Second option is to use drizzle studio. After connection to your DB just run following command:

```bash
yarn run db:studio
```

Then go to Users table and set Role to ADMIN for your account.

## SEO Update

Before you host your blog you should update the sitemap.ts file with your own domain url. Check also layout.tsx file and update your metadata tags with your own URL and description. Update also robots.txt file with your own domain, which you finde in public folder.

## Adsense

Penify comes with prebuild adsense support. You can enable it by updating ads.txt file in public folder. Then you need to update google-ad-unit.tsx file with your own data. Then just uncomment 'AdSenseAsideArticle' component in article-aside.tsx and you are good to go with ads.

## How to contribute

If you want to contribute to Penify you can fork the repository and create a pull request. I will review it and merge it if it's good.

Feel free to open an issue if you have any problems with setting up Penify, found a bug or have any questions.
