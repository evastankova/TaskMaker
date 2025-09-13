# TaskMaker
Task Maker, which manages Users and Admins as role-based access. Admins assign tasks to users, while users can see them and mark them as completed. 
## Technologies used:
- Front- and Backend: Next.js (written on TypeScript)
- UI: Shadcn, Tailwind CSS
- Database: PostgreSQL (via Supabase)
- Authentication: Supabase (free project)
- Global State Management: React Context
## Why these:
- I opted for Next.js, as I wanted to ...
- I wanted to use a component library instead of designing custom UI in order to have clean UI and save time on having to work on each detail by myself.
- I opted for PostgreSQL as a database, as I have some experience with SQL databases, and they are the better choice for such a low-scale application with pretty structured and no rapidly changing data. Adiitionally Supabase supports PostgreSQL out-of-the-box.
- I chose to work with Supabase instead of creating custom sessions because while doing my research, I found out that Supabase is really helpful in other terms as well, e.g. having an integrated PostgreSQL database, and seemed like a technology worth acknowledging and getting the grasp of.
- Global Staate Management: ...
- Challenges: ...  

