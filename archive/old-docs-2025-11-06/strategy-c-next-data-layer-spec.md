As a good Product Manager, you need the **specification** and the **Copilot prompts** before the raw output.

We will now generate the robust specification and the structured prompts for Copilot to create your Next.js frontend data layer, completing the technical infrastructure of Strategy C.

---

## 🛠️ Strategy C: Next.js Data Layer Specification

The goal here is to build the core data fetching architecture in your Next.js application, which will pull content from your freshly-defined Sanity CMS.

### Specification 1: Sanity Client and Query Utilities

| File             | `src/lib/sanity/client.ts`                                                                                                                                                       | `src/lib/sanity/queries.ts`                                                                                                                                                        |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**      | Configures the Sanity client for data fetching. Must read environment variables securely.                                                                                        | Defines reusable **GROQ queries** for application pages.                                                                                                                           |
| **Requirements** | Must use `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`. Must use a fixed `apiVersion` (e.g., `'v2025-01-01'`) and disable CDNs in development for fresh data. | **1. `APPLICATION_SLUGS_QUERY`**: Fetches all `slug.current` for `jobApplication` documents.                                                                                       |
|                  |                                                                                                                                                                                  | **2. `APPLICATION_BY_SLUG_QUERY`**: Fetches the full `jobApplication` document, including a nested query to pull the _linked project's_ details via the `linkedProject` reference. |

### Specification 2: Dynamic Route and Static Generation

| File             | `src/app/[slug]/page.tsx`                                                                                                                                                                                      |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**      | The single template file responsible for generating every personalised cover letter page (`/atlassian-role`, `/canva-cx`, etc.).                                                                               |
| **Requirements** | **1. `generateStaticParams()`:** Must fetch all possible slugs using `APPLICATION_SLUGS_QUERY` to enable Static Site Generation (SSG).                                                                         |
|                  | **2. `Page` Component (async):** Must accept `params` (containing the `slug`). It uses the `APPLICATION_BY_SLUG_QUERY` to fetch the complete application data.                                                 |
|                  | **3. Placeholder UI:** Should return a basic HTML structure using Tailwind CSS and display the fetched application data (`targetCompany`, `customIntroduction`, etc.) to prove the data connection is working. |

---

## 💻 Copilot Prompts for Execution

Use these prompts in your Copilot Chat. Since the goal is code generation and file creation, these are perfect tasks.

### Prompt Set 1: Sanity Client and Queries

**Context to Copilot:** "I am in the root of my Next.js project. We are using the App Router and TypeScript. My Sanity project ID and dataset are configured in `.env.local`."

**Prompt 1.1: Create Sanity Client Config (`client.ts`)**

```
Create a TypeScript file at 'src/lib/sanity/client.ts'. This file should configure and export a reusable Sanity client instance. Use environment variables NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET, setting the apiVersion to 'v2025-01-01'. The client needs a reusable async function, `sanityFetch`, that accepts a GROQ query string and parameters object, securely fetching data from the client.
```

**Prompt 1.2: Define GROQ Queries (`queries.ts`)**

```
Create a TypeScript file at 'src/lib/sanity/queries.ts'.
1. Export a GROQ constant: `APPLICATION_SLUGS_QUERY`. This query should fetch all slugs for the 'jobApplication' document type.
2. Export a GROQ constant: `APPLICATION_BY_SLUG_QUERY`. This query must accept a '$slug' parameter and fetch the *full* 'jobApplication' document that matches that slug. Crucially, it must also **eagerly fetch** the details of the 'linkedProject' via a projection, selecting its name, focus, and keyMetric.
```

### Prompt Set 2: Dynamic Page Implementation

**Context to Copilot:** "Now implement the dynamic routing using the files we just created."

**Prompt 2.1: Implement Dynamic Page (`[slug]/page.tsx`)**

```
Create the file 'src/app/[slug]/page.tsx'. This is a Server Component and must implement the following:
1. Import `generateStaticParams` and use the `APPLICATION_SLUGS_QUERY` to fetch and return all slugs.
2. Define the default `Page` component as an async function that accepts `{ params: { slug } }`.
3. Inside the `Page` component, use the `sanityFetch` function and `APPLICATION_BY_SLUG_QUERY` to retrieve the full application data for the given slug.
4. Render a simple Tailwind-styled page that prominently displays the `targetCompany`, `targetRoleTitle`, and the `customIntroduction`. Include a section that lists the `keyMetric` and `name` of the `linkedProject` to confirm the nested query worked. Use a clean, professional, responsive Tailwind layout.
```

---

That gives you the complete blueprint for the data flow. Once Copilot finishes those tasks, you'll have a fully functional Next.js/Sanity data connection and a dynamic template\!

Now, you are ready to start running those prompts. Let me know when you're ready to tackle the next phase: **Strategy D (The AI Automation with n8n)**.
