import Link from "next/link";

export default function Home({}: {  }) {
    return (
        <>
            <h1>NextGen: generate code for your Next.js project</h1>
            <p>Developed by <a href="https://twitter.com/wwsalmon">Samson Zhang</a></p>
            <p>Source code on <a href="https://github.com/wwsalmon/nextgen">GitHub</a></p>
            <p>
                When making a Next.js app, tons of boilerplate code needs to be written. Every database model, API endpoint, etc. requires repetitive scaffolding to be set up, differing according to a few parameters of what's required.
            </p>
            <p>
                NextGen automates this boilerplate so you can bash out Next.js apps or modify existing ones much faster. It's developed for my personal use, so for the moment it's opinionated on frameworks, database providers, etc. It's also WIP, and I'll be adding new templates and generators over time.
            </p>
            <p>
                For now, I hope the micro-tools I've developed below will be helpful to you. If so, get in touch with me <a href="https://twitter.com/wwsalmon">on Twitter</a> or via email (hello@samsonzhang.com) and let me know!
            </p>
            <h2>Templates</h2>
            <p><a href="https://github.com/wwsalmon/next-tailwind-typescript-example">🔗 next-tailwind-typescript-example</a> - set up NextJS, Tailwind, and Typescript in one CLI command</p>
            <h2>Generators</h2>
            <p><Link href="/model"><a>Mongoose + Typescript model generator</a></Link>: generate a Mongoose model file and typing given an object schema</p>
        </>
    );
}