This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.




# Solana Actions and Blockchain Links (Blinks)

[Read the docs to get started](https://solana.com/docs/advanced/actions)

Watch this video tutorial on
[How to Build Solana Actions](https://youtu.be/kCht01Ycif0)

Find
[more resources for Solana Actions and blinks](https://solana.com/solutions/actions)

Find example code snippets on how to build several different Solana Actions:

- [Deployed sample code snippets](https://solana-actions.vercel.app/)
- [Source code for code snippets](https://github.com/solana-developers/solana-actions/tree/main/examples/next-js)

Install the `@solana/actions` SDK into your application:

```shell
npm add @solana/actions
```

[`@solana/actions` SDK on NPM](https://www.npmjs.com/package/@solana/actions)

## What are Solana Actions?

[Solana Actions](https://solana.com/docs/advanced/actions#actions) are
specification-compliant APIs that return transactions on the Solana blockchain
to be previewed, signed, and sent across a number of various contexts, including
QR codes, buttons + widgets, and websites across the internet. Actions make it
simple for developers to integrate the things you can do throughout the Solana
ecosystem right into your environment, allowing you to perform blockchain
transactions without needing to navigate away to a different app or webpage.

## What are blockchain links (blinks)?

[Blockchain links](https://solana.com/docs/advanced/actions#blinks) – or blinks
– turn any Solana Action into a shareable, metadata-rich link. Blinks allow
Action-aware clients (browser extension wallets, bots) to display additional
capabilities for the user. On a website, a blink might immediately trigger a
transaction preview in a wallet without going to a decentralized app; in
Discord, a bot might expand the blink into an interactive set of buttons. This
pushes the ability to interact on-chain to any web surface capable of displaying
a URL.

## License

The Solana Actions JavaScript SDK is open source and available under the Apache
License, Version 2.0. See the [LICENSE](./LICENSE) file for more info.
