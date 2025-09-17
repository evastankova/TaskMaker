# TaskMaker
Task Maker, which manages Users and Admins as role-based access. Admins assign tasks to users, while users can see them and mark them as completed. 
## Technologies used:
- Front- and Backend: Next.js + Supabase as BaaS (written on TypeScript)
- UI: Shadcn UI, Tailwind CSS
- Database: PostgreSQL (via Supabase)
- Authentication: Supabase (client-side authentication --> no cookie server-side sessions and server protection)
- Global State Management: React Context
## Why these:
- I opted for Next.js, as I wanted to ...
- I wanted to use a component library instead of designing custom UI in order to have clean UI and save time on having to work on each detail by myself.
- I opted for PostgreSQL as a database, as I have some experience with SQL databases, and they are the better choice for such a low-scale application with pretty structured and no rapidly changing data. Adiitionally Supabase supports PostgreSQL out-of-the-box.
- I chose to work with Supabase instead of creating custom sessions because while doing my research, I found out that Supabase is really helpful in other terms as well, e.g. having an integrated PostgreSQL database, and seemed like a technology worth acknowledging and getting the grasp of.
## Possible Optimisations (Future):
- Make the authentication with cookie sessions and server protection.
- Right now, a new user can choose whether they can be a user or an admin. In the future, I can add more real-life relevant functionality, e.g. a regular user can become an admin only when another admin allows it.
- Admins can be users on some hierarchical levels as well. I can make functionality that shows admins their assigned tasks as normal users.
- Make the UI responsive.
- Add functionality that allows users to ask questions and receive answers for their assigned tasks.
- Make the date format take European dates (dd/mm/yyyy), not American (mm/dd/yyyy)
- Right now some dark mode functionality is added, but it does not function properly. I can adjust it to work as it should. 
- Add functionality to delete user accounts.
## How to run it:
1) Clone the github repository
2) Open a terminal and navigate to the folder where the clone of the project is located
3) Run ```npm install``` --> downloads all dependencies
4) Run ```npm run dev``` and open localhost:3000 in your browser (if the port is already used for something else, you will have to change it)
5) Enjoy!